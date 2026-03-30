import { pdfSource, readerModules, starterPrompt, theoryResources, lessonSets } from "./data.js";
import { buildParcoursMarkdown } from "./export.js";

const mode = window.THIEL_READER_MODE || "open";
const modeLabel = window.THIEL_READER_MODE_LABEL || "Offene Version";
const config = window.THIEL_READER_CONFIG || {};
const isTeacherPreview = Boolean(config.teacherPreview);
const app = document.body;
const previewStorageKey = "thiel_teacher_preview_state";

const reviewLevels = [
  { value: "stark", label: "stark" },
  { value: "teilweise", label: "teilweise" },
  { value: "offen", label: "offen" }
];

const defaultState = {
  ready: false,
  loading: true,
  error: "",
  classroom: null,
  student: null,
  progress: null,
  peerReview: null,
  sebFeedback: null,
  sebFeedbackStatus: "idle",
  sebFeedbackError: "",
  sebFeedbackKey: "",
  selectedReviewId: null,
  lessonId: config.forcedLessonId || lessonSets[0].id,
  moduleId: readerModules[0].id,
  entryId: readerModules[0].entries[0].id,
  theoryId: theoryResources[0].id,
  notes: {},
  saveStatus: "idle",
  reviewSaveStatus: "idle",
  lastSavedAt: ""
};

const state = structuredClone(defaultState);
let saveTimer = null;
let feedbackTimer = null;
let sebFeedbackRequestId = 0;

function countCompletedEntries(notes = {}) {
  return readerModules.flatMap((module) => module.entries).filter((entry) => {
    const note = notes[entry.id] || {};
    return Boolean(
      String(note.observation || "").trim()
      || String(note.interpretation || "").trim()
      || String(note.theory || "").trim()
    );
  }).length;
}

function buildPreviewProgress(notes = {}) {
  const allEntries = readerModules.flatMap((module) => module.entries);
  const completedEntries = countCompletedEntries(notes);
  const lessonProgress = lessonSets.map((lesson) => {
    const entries = lesson.moduleIds.flatMap((moduleId) => readerModules.find((module) => module.id === moduleId)?.entries || []);
    const done = entries.filter((entry) => {
      const note = notes[entry.id] || {};
      return Boolean(
        String(note.observation || "").trim()
        || String(note.interpretation || "").trim()
        || String(note.theory || "").trim()
      );
    }).length;

    return {
      id: lesson.id,
      title: lesson.title,
      completedEntries: done,
      totalEntries: entries.length,
      percent: entries.length ? Math.round((done / entries.length) * 100) : 0
    };
  });

  return {
    completedEntries,
    totalEntries: allEntries.length,
    percent: allEntries.length ? Math.round((completedEntries / allEntries.length) * 100) : 0,
    evidenceEntries: allEntries.filter((entry) => String(notes[entry.id]?.evidence || "").trim()).length,
    theoryEntries: allEntries.filter((entry) => String(notes[entry.id]?.theory || "").trim()).length,
    completedLessonIds: lessonProgress.filter((lesson) => lesson.completedEntries === lesson.totalEntries).map((lesson) => lesson.id),
    lessonProgress
  };
}

function readPreviewState() {
  if (!isTeacherPreview) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(previewStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePreviewState(payload) {
  if (!isTeacherPreview) {
    return;
  }

  try {
    window.localStorage.setItem(previewStorageKey, JSON.stringify(payload));
  } catch {
    // ignore storage issues in preview mode
  }
}

function buildPreviewBootstrap() {
  const stored = readPreviewState() || {};
  const notes = stored.notes || {};
  const progress = buildPreviewProgress(notes);

  return {
    classroom: {
      id: "teacher-preview",
      name: "Lehrervorschau",
      lessonIds: lessonSets.map((lesson) => lesson.id),
      activeSebLessonId: config.initialLessonId || lessonSets[0].id
    },
    student: {
      id: "teacher-preview",
      displayName: "Lehrervorschau"
    },
    progress,
    peerReview: {
      enabled: false,
      assignments: [],
      stats: {
        assignedCount: 0,
        completedAssignedCount: 0,
        receivedCount: 0,
        receivedCompletedCount: 0
      }
    },
    work: {
      notes,
      selectedLessonId: stored.lessonId || config.initialLessonId || lessonSets[0].id,
      moduleId: stored.moduleId || readerModules[0].id,
      entryId: stored.entryId || readerModules[0].entries[0].id,
      theoryId: stored.theoryId || theoryResources[0].id,
      updatedAt: stored.updatedAt || ""
    }
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function fetchBootstrap() {
  if (isTeacherPreview) {
    return buildPreviewBootstrap();
  }

  const response = await fetch("/reader-api/bootstrap", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Die Reader-Sitzung konnte nicht geladen werden.");
  }
  return response.json();
}

async function fetchSebFeedback(payload) {
  const response = await fetch("/reader-api/seb-feedback", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || "Das SEB-Fachfeedback konnte nicht geladen werden.");
  }

  return response.json();
}

function applyBootstrap(payload) {
  state.classroom = payload.classroom;
  state.student = payload.student;
  state.progress = payload.progress;
  state.peerReview = payload.peerReview;
  state.notes = payload.work.notes || {};
  state.lessonId = config.forcedLessonId
    || config.initialLessonId
    || (mode === "seb" ? payload.classroom.activeSebLessonId : payload.work.selectedLessonId)
    || state.lessonId;
  state.moduleId = payload.work.moduleId || state.moduleId;
  state.entryId = payload.work.entryId || state.entryId;
  state.theoryId = payload.work.theoryId || state.theoryId;
  state.lastSavedAt = payload.work.updatedAt || "";

  if (state.peerReview?.assignments?.length) {
    const stillVisible = state.peerReview.assignments.some((assignment) => assignment.id === state.selectedReviewId);
    if (!stillVisible) {
      state.selectedReviewId = state.peerReview.assignments[0].id;
    }
  } else {
    state.selectedReviewId = null;
  }
}

function sebFeedbackPayload() {
  const entry = currentEntry();
  return {
    lessonId: state.lessonId,
    moduleId: state.moduleId,
    entryId: state.entryId,
    theoryId: state.theoryId,
    note: noteForEntry(entry?.id || state.entryId)
  };
}

function sebFeedbackKeyFor(payload) {
  return [
    payload.lessonId,
    payload.moduleId,
    payload.entryId,
    payload.theoryId,
    payload.note?.observation || "",
    payload.note?.evidence || "",
    payload.note?.interpretation || "",
    payload.note?.theory || "",
    payload.note?.revision || ""
  ].join("::");
}

async function requestSebFeedback({ showLoading = false, force = false } = {}) {
  if (mode !== "seb" || !state.ready) {
    return;
  }

  ensureSelection();
  const payload = sebFeedbackPayload();
  const feedbackKey = sebFeedbackKeyFor(payload);
  if (!force && state.sebFeedbackStatus === "ready" && state.sebFeedbackKey === feedbackKey) {
    return;
  }

  const requestId = ++sebFeedbackRequestId;
  state.sebFeedbackStatus = showLoading || !state.sebFeedback ? "loading" : "refreshing";
  state.sebFeedbackError = "";
  if (showLoading) {
    render();
  }

  try {
    const feedback = await fetchSebFeedback(payload);
    if (requestId !== sebFeedbackRequestId) {
      return;
    }

    state.sebFeedback = feedback;
    state.sebFeedbackKey = feedbackKey;
    state.sebFeedbackStatus = "ready";
    state.sebFeedbackError = "";
    render();
  } catch (error) {
    if (requestId !== sebFeedbackRequestId) {
      return;
    }

    state.sebFeedbackStatus = "error";
    state.sebFeedbackError = error.message;
    render();
  }
}

async function saveProgress() {
  clearTimeout(saveTimer);
  state.saveStatus = "saving";
  render();

  if (isTeacherPreview) {
    const updatedAt = new Date().toISOString();
    writePreviewState({
      notes: state.notes,
      lessonId: state.lessonId,
      moduleId: state.moduleId,
      entryId: state.entryId,
      theoryId: state.theoryId,
      updatedAt
    });
    state.progress = buildPreviewProgress(state.notes);
    state.lastSavedAt = updatedAt;
    state.saveStatus = "saved";
    render();
    return;
  }

  try {
    const response = await fetch("/reader-api/progress", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode,
        lessonId: state.lessonId,
        moduleId: state.moduleId,
        entryId: state.entryId,
        theoryId: state.theoryId,
        notes: state.notes
      })
    });

    if (!response.ok) {
      throw new Error("Arbeitsstand konnte nicht gespeichert werden.");
    }

    const payload = await response.json();
    applyBootstrap(payload);
    state.saveStatus = "saved";
    render();
    if (mode === "seb") {
      requestSebFeedback();
    }
  } catch (error) {
    state.saveStatus = "error";
    state.error = error.message;
    render();
  }
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveProgress();
  }, 500);
}

function queueSebFeedback() {
  if (mode !== "seb") {
    return;
  }

  clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    requestSebFeedback();
  }, 700);
}

function availableLessons() {
  const allowedLessonIds = state.classroom?.lessonIds || lessonSets.map((lesson) => lesson.id);

  if (config.forcedLessonId) {
    return lessonSets.filter((lesson) => lesson.id === config.forcedLessonId);
  }

  if (mode === "seb") {
    const activeLessonId = state.classroom?.activeSebLessonId || state.lessonId;
    return lessonSets.filter((lesson) => lesson.id === activeLessonId);
  }

  return lessonSets.filter((lesson) => allowedLessonIds.includes(lesson.id));
}

function currentLesson() {
  return availableLessons().find((lesson) => lesson.id === state.lessonId) || availableLessons()[0] || lessonSets[0];
}

function modulesForLesson(lesson = currentLesson()) {
  return lesson.moduleIds
    .map((moduleId) => readerModules.find((module) => module.id === moduleId))
    .filter(Boolean);
}

function currentModule() {
  return modulesForLesson().find((module) => module.id === state.moduleId) || modulesForLesson()[0];
}

function currentEntry() {
  return currentModule()?.entries.find((entry) => entry.id === state.entryId) || currentModule()?.entries[0];
}

function theoryIdsFor(module = currentModule(), entry = currentEntry()) {
  const ids = [...(module?.relatedTheoryIds || []), ...(entry?.relatedTheoryIds || [])];
  return [...new Set(ids)].filter((id) => theoryResources.some((resource) => resource.id === id));
}

function theoryOptionsFor(module = currentModule(), entry = currentEntry()) {
  const ids = theoryIdsFor(module, entry);
  if (!ids.length) {
    return theoryResources;
  }

  return ids
    .map((id) => theoryResources.find((resource) => resource.id === id))
    .filter(Boolean);
}

function ensureSelection() {
  const lessons = availableLessons();
  if (!lessons.some((lesson) => lesson.id === state.lessonId)) {
    state.lessonId = lessons[0]?.id || lessonSets[0].id;
  }

  const visibleModules = modulesForLesson();
  if (!visibleModules.some((module) => module.id === state.moduleId)) {
    state.moduleId = visibleModules[0]?.id || readerModules[0].id;
  }

  const module = currentModule();
  if (module && !module.entries.some((entry) => entry.id === state.entryId)) {
    state.entryId = module.entries[0]?.id || state.entryId;
  }

  const theories = theoryOptionsFor();
  if (!theories.some((resource) => resource.id === state.theoryId)) {
    state.theoryId = theories[0]?.id || theoryResources[0].id;
  }
}

function currentTheory() {
  const options = theoryOptionsFor();
  return options.find((resource) => resource.id === state.theoryId) || options[0] || theoryResources[0];
}

function noteForEntry(entryId) {
  const raw = state.notes[entryId] || {};
  return {
    observation: "",
    evidence: "",
    interpretation: "",
    theory: "",
    revision: "",
    focusAnswers: [],
    theoryResponses: {},
    ...raw
  };
}

function focusAnswersFor(entry = currentEntry()) {
  const note = noteForEntry(entry.id);
  return entry.prompts.map((_, index) => note.focusAnswers?.[index] || "");
}

function theoryResponseFor(entry = currentEntry(), theory = currentTheory()) {
  const note = noteForEntry(entry.id);
  const stored = note.theoryResponses?.[theory.id] || {};
  const transferPrompts = transferPromptsFor(entry, theory);

  return {
    guidingAnswers: theory.questions.map((_, index) => stored.guidingAnswers?.[index] || ""),
    transferAnswers: transferPrompts.map((_, index) => stored.transferAnswers?.[index] || "")
  };
}

function trimmed(value) {
  return String(value || "").trim();
}

function documentationStatusForEntry(entry = currentEntry(), theory = currentTheory()) {
  const note = noteForEntry(entry.id);
  const focusAnswers = focusAnswersFor(entry);
  const theoryResponses = theoryResponseFor(entry, theory);
  const checks = [
    { label: "Beobachtung", complete: Boolean(trimmed(note.observation)) },
    { label: "Textanker / Wortlaut", complete: Boolean(trimmed(note.evidence)) },
    { label: "Deutung", complete: Boolean(trimmed(note.interpretation)) },
    { label: "Theoriebezug", complete: Boolean(trimmed(note.theory)) },
    { label: "Revision / nächster Schritt", complete: Boolean(trimmed(note.revision)) },
    ...entry.prompts.map((prompt, index) => ({
      label: `Fokusfrage ${index + 1}: ${prompt}`,
      complete: Boolean(trimmed(focusAnswers[index]))
    })),
    ...theory.questions.map((question, index) => ({
      label: `Leitfrage ${index + 1}: ${question}`,
      complete: Boolean(trimmed(theoryResponses.guidingAnswers[index]))
    })),
    ...transferPromptsFor(entry, theory).map((prompt, index) => ({
      label: `Transfer ${index + 1}: ${prompt}`,
      complete: Boolean(trimmed(theoryResponses.transferAnswers[index]))
    }))
  ];

  return {
    completed: checks.filter((item) => item.complete).length,
    total: checks.length,
    missing: checks.filter((item) => !item.complete).map((item) => item.label)
  };
}

function completion(module) {
  const completed = module.entries.filter((entry) => {
    const note = noteForEntry(entry.id);
    return note.observation.trim() || note.interpretation.trim() || note.theory.trim();
  }).length;

  return `${completed}/${module.entries.length}`;
}

function progressForCurrentLesson() {
  const lesson = currentLesson();
  return state.progress?.lessonProgress?.find((entry) => entry.id === lesson.id) || null;
}

function pageRangeForLesson(lesson = currentLesson()) {
  const pageNumbers = modulesForLesson(lesson)
    .flatMap((module) => module.entries.map((entry) => Number(entry.pageNumber || 0)))
    .filter(Boolean);

  if (!pageNumbers.length) {
    return "";
  }

  const first = Math.min(...pageNumbers);
  const last = Math.max(...pageNumbers);
  return first === last ? `S. ${first}` : `S. ${first}-${last}`;
}

function isParcoursComplete() {
  return Boolean(
    state.progress &&
    state.progress.totalEntries > 0 &&
    state.progress.completedEntries >= state.progress.totalEntries
  );
}

function currentReviewAssignment() {
  return state.peerReview?.assignments?.find((assignment) => assignment.id === state.selectedReviewId) || state.peerReview?.assignments?.[0] || null;
}

function transferPromptsFor(entry, theory) {
  return [
    `Beziehe "${entry.passageLabel}" gezielt auf ${theory.shortTitle.toLowerCase()} und sichere deine Aussage mit mindestens zwei Wörtern aus dem Text.`,
    ...theory.transferPrompts.slice(0, 2)
  ];
}

function feedbackFor(note, module, entry) {
  const body = `${note.observation} ${note.interpretation} ${note.theory}`.toLowerCase();
  const evidence = note.evidence.toLowerCase();
  const theory = note.theory.toLowerCase();
  const signals = ["zeigt", "verdeutlicht", "deutet", "wirkt", "weil"];
  const summarySignals = ["dann", "danach", "passiert", "anschließend"];
  const positives = [];
  const steps = [];
  const relatedTheories = theoryOptionsFor(module, entry);

  if (evidence.trim().length >= 8) {
    positives.push("Du arbeitest bereits mit konkreten Wortsignalen aus dem Text.");
  } else {
    steps.push("Ergänze ein oder zwei Wörter aus dem PDF-Wortlaut als präzisen Textanker.");
  }

  if (signals.some((signal) => body.includes(signal))) {
    positives.push("Deine Notiz enthält bereits eine deutende Begründung.");
  } else {
    steps.push("Formuliere deutlicher, was die Stelle zeigt, andeutet oder bewirkt.");
  }

  if (summarySignals.some((signal) => body.includes(signal))) {
    steps.push("Achte darauf, nicht nur den Ablauf zu erzählen, sondern die sprachliche Wirkung zu erklären.");
  }

  if (note.theory.trim().length >= 20) {
    positives.push("Du verknüpfst die Passage schon mit einer Theorie-Linse.");
  } else if (relatedTheories.length) {
    steps.push(`Ziehe zusätzlich eine Theorie-Linse heran: ${relatedTheories.map((resource) => resource.shortTitle).join(", ")}.`);
  }

  if (module.lens && !body.includes(module.lens.toLowerCase().split(",")[0])) {
    steps.push(`Binde deine Beobachtung noch stärker an die Linse des Moduls: ${module.lens.toLowerCase()}.`);
  }

  if (entry.relatedTheoryIds?.includes("naturalismus")) {
    const naturalismTerms = ["milieu", "arbeit", "körper", "wirklichkeit", "druck", "sozial"];
    if (naturalismTerms.some((term) => theory.includes(term))) {
      positives.push("Der Theoriebezug zur naturalistischen Darstellung ist schon sichtbar.");
    }
  }

  if (entry.relatedTheoryIds?.includes("perspektive")) {
    const perspectiveTerms = ["erzähler", "perspektive", "nähe", "distanz", "wahrnehmung"];
    if (perspectiveTerms.some((term) => theory.includes(term))) {
      positives.push("Du achtest bereits darauf, wie die Erzählperspektive die Deutung lenkt.");
    }
  }

  if (entry.relatedTheoryIds?.includes("novelle")) {
    const novellaTerms = ["wendepunkt", "novelle", "konflikt", "verdichtung", "motiv"];
    if (novellaTerms.some((term) => theory.includes(term))) {
      positives.push("Du bindest die Passage schon an die Formlogik der Novelle zurück.");
    }
  }

  if (!steps.length) {
    steps.push("Die Notiz ist schon tragfähig. Präzisiere im nächsten Schritt noch die Gesamtwirkung der Szene.");
  }

  return { positives, steps };
}

function pdfUrlForEntry(entry) {
  return `${pdfSource}#page=${entry.pageNumber || 1}&zoom=page-width`;
}

function renderSidebar() {
  return modulesForLesson().map((module) => `
    <button class="module-pill ${module.id === state.moduleId ? "is-active" : ""}" data-action="select-module" data-module-id="${module.id}">
      <span>${escapeHtml(module.title)}</span>
      <strong>${completion(module)}</strong>
    </button>
  `).join("");
}

function renderLessonRail() {
  return availableLessons().map((lesson) => {
    const progress = state.progress?.lessonProgress?.find((entry) => entry.id === lesson.id);
    const entryCount = modulesForLesson(lesson).reduce((sum, module) => sum + module.entries.length, 0);
    return `
      <button class="lesson-pill ${lesson.id === state.lessonId ? "is-active" : ""}" data-action="select-lesson" data-lesson-id="${lesson.id}" ${mode === "seb" || config.forcedLessonId ? "disabled" : ""}>
        <span>${escapeHtml(lesson.title)}</span>
        <small>${escapeHtml(progress ? `${progress.completedEntries}/${progress.totalEntries} Passagen` : `${entryCount} Passagen · ${pageRangeForLesson(lesson)}`)}</small>
      </button>
    `;
  }).join("");
}

function renderTheorySelector(module, entry) {
  return theoryOptionsFor(module, entry).map((resource) => `
    <button class="theory-pill ${resource.id === state.theoryId ? "is-active" : ""}" data-action="select-theory" data-theory-id="${resource.id}">
      <span>${escapeHtml(resource.shortTitle)}</span>
      <small>${escapeHtml(resource.sourceTitle)}</small>
    </button>
  `).join("");
}

function renderEntryTabs(module) {
  return module.entries.map((entry) => `
    <button class="entry-tab ${entry.id === state.entryId ? "is-active" : ""}" data-action="select-entry" data-entry-id="${entry.id}">
      ${escapeHtml(entry.title)}
    </button>
  `).join("");
}

function renderPassageNavigator(module) {
  return module.entries.map((entry) => `
    <button class="passage-card ${entry.id === state.entryId ? "is-active" : ""}" data-action="select-entry" data-entry-id="${entry.id}">
      <span class="passage-page">${escapeHtml(entry.pageHint)}</span>
      <strong>${escapeHtml(entry.passageLabel)}</strong>
      <span>${escapeHtml(entry.prompts[0])}</span>
    </button>
  `).join("");
}

function renderSignalWords(entry) {
  const note = noteForEntry(entry.id);
  return entry.signalWords.map((word) => `
    <button class="signal-chip ${note.evidence.includes(word) ? "is-active" : ""}" data-action="toggle-signal" data-word="${escapeHtml(word)}">
      ${escapeHtml(word)}
    </button>
  `).join("");
}

function renderPromptList() {
  return starterPrompt.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderFocusQuestions(entry) {
  const focusAnswers = focusAnswersFor(entry);
  return `
    <div class="structured-section">
      <div class="section-head">
        <strong>Fokusfragen schriftlich beantworten</strong>
        <span class="status-badge" data-doc-count="focus">${escapeHtml(`${focusAnswers.filter((value) => trimmed(value)).length}/${entry.prompts.length}`)}</span>
      </div>
      <div class="question-answer-stack">
        ${entry.prompts.map((prompt, index) => `
        <label class="question-answer-block">
          ${escapeHtml(`Fokusfrage ${index + 1}`)}
          <span class="field-prompt">${escapeHtml(prompt)}</span>
          <textarea class="answer-field answer-field-lg" data-note-array="focusAnswers" data-index="${index}" placeholder="Formuliere hier eine knappe, textnahe Antwort.">${escapeHtml(focusAnswers[index])}</textarea>
        </label>
      `).join("")}
      </div>
    </div>
  `;
}

function renderNotebook(entry) {
  const note = noteForEntry(entry.id);
  const feedback = feedbackFor(note, currentModule(), entry);
  const theory = currentTheory();
  const documentation = documentationStatusForEntry(entry, theory);

  return `
    <section class="panel notebook">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Notizbuch</div>
          <h2>${escapeHtml(entry.title)}</h2>
        </div>
        <button class="button secondary" data-action="export-notes">Markdown exportieren</button>
      </div>

      <div class="documentation-status-box ${documentation.missing.length ? "is-warning" : "is-complete"}">
        <strong data-doc-summary="entry">${escapeHtml(`Dokumentationsstand: ${documentation.completed}/${documentation.total}`)}</strong>
        <p data-doc-missing="entry">${documentation.missing.length
          ? escapeHtml(`Noch offen: ${documentation.missing.join(" · ")}`)
          : "Alle Fokusfragen, Leitfragen und Transferfragen sind schriftlich dokumentiert."
        }</p>
      </div>

      <form id="note-form" class="note-grid">
        <label>
          Beobachtung
          <textarea name="observation" placeholder="Was fällt an Raum, Figur, Sprache oder Stimmung auf?">${escapeHtml(note.observation)}</textarea>
        </label>
        <label>
          Signalwörter / Wortlaut
          <textarea name="evidence" placeholder="Kurze Wortgruppen aus dem eingebetteten PDF">${escapeHtml(note.evidence)}</textarea>
        </label>
        <label>
          Deutung
          <textarea name="interpretation" placeholder="Was zeigt diese Stelle? Welche Wirkung entsteht?">${escapeHtml(note.interpretation)}</textarea>
        </label>
        <label>
          Theoriebezug
          <textarea name="theory" placeholder="Verbinde die Passage mit Novelle, Naturalismus oder Erzählperspektive.">${escapeHtml(note.theory)}</textarea>
        </label>
        <label>
          Revision / nächster Schritt
          <textarea name="revision" placeholder="Was würdest du nach Feedback oder erneuter Lektüre noch schärfen?">${escapeHtml(note.revision)}</textarea>
        </label>
      </form>

      ${mode === "seb" ? "" : `
        <div class="feedback-box">
          <h3>Arbeitsfeedback</h3>
          <div class="feedback-columns">
            <div>
              <strong>Stärken</strong>
              <ul>${feedback.positives.length ? feedback.positives.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>Noch keine textnahe Stärke sichtbar.</li>"}</ul>
            </div>
            <div>
              <strong>Nächste Schritte</strong>
              <ul>${feedback.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
          </div>
        </div>
      `}
    </section>
  `;
}

function renderSebFeedbackPanel() {
  if (mode !== "seb") {
    return "";
  }

  const entry = currentEntry();
  const theory = currentTheory();
  const feedback = state.sebFeedback;

  if (state.sebFeedbackStatus === "loading" && !feedback) {
    return `
      <section class="panel seb-feedback-panel">
        <div class="panel-head">
          <div>
            <div class="eyebrow">Analytisches Fachfeedback</div>
            <h2>Diagnose wird aufgebaut</h2>
          </div>
        </div>
        <div class="empty-box">Die aktuelle Passage wird gerade im Hinblick auf Textbindung, Deutungstiefe, Theorieintegration und Revisionsreife ausgewertet.</div>
      </section>
    `;
  }

  if (state.sebFeedbackStatus === "error") {
    return `
      <section class="panel seb-feedback-panel">
        <div class="panel-head">
          <div>
            <div class="eyebrow">Analytisches Fachfeedback</div>
            <h2>Fachfeedback momentan nicht verfügbar</h2>
          </div>
          <button class="button secondary" data-action="refresh-seb-feedback">Erneut prüfen</button>
        </div>
        <div class="empty-box">${escapeHtml(state.sebFeedbackError || "Die Auswertung konnte nicht erstellt werden.")}</div>
      </section>
    `;
  }

  if (!feedback) {
    return "";
  }

  return `
    <section class="panel seb-feedback-panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Analytisches Fachfeedback</div>
          <h2>${escapeHtml(feedback.heading)}</h2>
        </div>
        <div class="seb-feedback-actions">
          <span class="status-badge">${escapeHtml(`${feedback.overallScore}/100`)}</span>
          <button class="button secondary" data-action="refresh-seb-feedback">Neu auswerten</button>
        </div>
      </div>

      <div class="seb-feedback-summary">
        <p>${escapeHtml(feedback.summary)}</p>
        <div class="seb-feedback-meta">
          <span class="theory-tag">${escapeHtml(entry.passageLabel)}</span>
          <span class="theory-tag">${escapeHtml(theory.shortTitle)}</span>
          <span class="theory-tag">${escapeHtml(feedback.metadata.lessonTitle)}</span>
          ${state.sebFeedbackStatus === "refreshing" ? '<span class="theory-tag">aktualisiert …</span>' : ""}
        </div>
      </div>

      <div class="seb-profile-grid">
        ${feedback.profile.map((item) => `
          <article class="seb-profile-card">
            <div class="seb-profile-head">
              <strong>${escapeHtml(item.label)}</strong>
              <span class="status-badge">${escapeHtml(`${item.score}/100`)}</span>
            </div>
            <div class="eyebrow">${escapeHtml(item.level)}</div>
            <p>${escapeHtml(item.rationale)}</p>
          </article>
        `).join("")}
      </div>

      <div class="seb-feedback-columns">
        <article class="seb-feedback-card is-positive">
          <h3>Tragfähige Ansätze</h3>
          <ul class="question-list">
            ${feedback.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>

        <article class="seb-feedback-card is-caution">
          <h3>Fachliche Schärfungszonen</h3>
          <ul class="question-list">
            ${feedback.cautions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      </div>

      <div class="seb-feedback-columns">
        <article class="seb-feedback-card">
          <h3>Konkrete Revisionsaufträge</h3>
          <ol class="question-list seb-feedback-steps">
            ${feedback.nextMoves.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ol>
        </article>

        <article class="seb-feedback-card">
          <h3>Weiterführende Rückfragen</h3>
          <ul class="question-list">
            ${feedback.prompts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      </div>
    </section>
  `;
}

function renderPdfPanel(entry, module) {
  return `
    <article class="panel pdf-panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Text im PDF</div>
          <h2>${escapeHtml(entry.passageLabel)}</h2>
        </div>
        <div class="pdf-head-actions">
          <span class="status-badge">${escapeHtml(entry.pageHint)}</span>
          <a class="button secondary" href="${pdfUrlForEntry(entry)}" target="_blank" rel="noreferrer">PDF separat öffnen</a>
        </div>
      </div>

      <div class="pdf-focus-box">
        <strong>Arbeitsfokus</strong>
        <p>${escapeHtml(module.briefing)}</p>
      </div>

      <div class="passage-nav">
        ${renderPassageNavigator(module)}
      </div>

      <div class="pdf-frame-wrap">
        <iframe class="pdf-frame" src="${pdfUrlForEntry(entry)}" title="Bahnwärter Thiel PDF"></iframe>
      </div>
    </article>
  `;
}

function renderTheoryPanel(module, entry) {
  const theory = currentTheory();
  const transferPrompts = transferPromptsFor(entry, theory);
  const theoryResponses = theoryResponseFor(entry, theory);

  return `
    <article class="panel theory-panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Theorie-Linse</div>
          <h2>${escapeHtml(theory.title)}</h2>
        </div>
        <a class="button secondary" href="${escapeHtml(theory.openUrl)}" target="_blank" rel="noreferrer">Video extern öffnen</a>
      </div>

      <div class="theory-summary">
        <p>${escapeHtml(theory.summary)}</p>
        <div class="theory-tag-row">
          ${theory.keyIdeas.map((idea) => `<span class="theory-tag">${escapeHtml(idea)}</span>`).join("")}
        </div>
      </div>

      <div class="theory-grid theory-grid-answer">
        <section class="structured-section theory-card">
          <div class="section-head">
            <strong>${escapeHtml(`Leitfragen zu ${theory.shortTitle}`)}</strong>
            <span class="status-badge" data-doc-count="guiding">${escapeHtml(`${theoryResponses.guidingAnswers.filter((value) => trimmed(value)).length}/${theory.questions.length}`)}</span>
          </div>
          <div class="question-answer-stack">
            ${theory.questions.map((question, index) => `
            <label class="question-answer-block">
              ${escapeHtml(`Leitfrage ${index + 1}`)}
              <span class="field-prompt">${escapeHtml(question)}</span>
              <textarea class="answer-field answer-field-lg" data-note-theory-section="guidingAnswers" data-index="${index}" placeholder="Halte deine Antwort zur Leitfrage schriftlich fest.">${escapeHtml(theoryResponses.guidingAnswers[index])}</textarea>
            </label>
          `).join("")}
          </div>
        </section>
        <section class="structured-section theory-card">
          <div class="section-head">
            <strong>Transfer zur Passage schriftlich festhalten</strong>
            <span class="status-badge" data-doc-count="transfer">${escapeHtml(`${theoryResponses.transferAnswers.filter((value) => trimmed(value)).length}/${transferPrompts.length}`)}</span>
          </div>
          <div class="question-answer-stack">
            ${transferPrompts.map((question, index) => `
            <label class="question-answer-block">
              ${escapeHtml(`Transfer ${index + 1}`)}
              <span class="field-prompt">${escapeHtml(question)}</span>
              <textarea class="answer-field answer-field-lg" data-note-theory-section="transferAnswers" data-index="${index}" placeholder="Übertrage die Theorie hier ausdrücklich auf die aktuelle Passage.">${escapeHtml(theoryResponses.transferAnswers[index])}</textarea>
            </label>
          `).join("")}
          </div>
        </section>
      </div>

      <div class="writing-frame-box">
        <strong>Schreibhilfe</strong>
        <p>${escapeHtml(theory.writingFrame)}</p>
      </div>

      <div class="video-card">
        <div class="video-wrap">
          <video class="theory-video" controls preload="metadata">
            <source src="${escapeHtml(theory.embedUrl)}" type="video/mp4">
          </video>
        </div>
        <p class="video-note">
          Falls das Video im Browser nicht direkt lädt, kannst du es jederzeit über den externen Link öffnen.
        </p>
      </div>
    </article>
  `;
}

function renderReviewList() {
  return state.peerReview.assignments.map((assignment) => `
    <button class="review-pill ${assignment.id === state.selectedReviewId ? "is-active" : ""}" data-action="select-review" data-review-id="${assignment.id}">
      <span>${escapeHtml(assignment.reviewee?.displayName || "Peer")}</span>
      <small>${escapeHtml(`${assignment.status} · ${assignment.reviewee?.lessonPortfolio?.completedEntries || 0}/${assignment.reviewee?.lessonPortfolio?.totalEntries || 0} Passagen`)}</small>
    </button>
  `).join("");
}

function renderCriterionFields(review) {
  return state.peerReview.criteria.map((criterion) => {
    const value = review.criteria.find((entry) => entry.id === criterion.id) || { id: criterion.id, level: "", comment: "" };
    return `
      <article class="criterion-card">
        <div>
          <strong>${escapeHtml(criterion.label)}</strong>
          <p>${escapeHtml(criterion.prompt)}</p>
        </div>
        <label>
          Einschätzung
          <select name="criterion-level" data-criterion-id="${criterion.id}">
            <option value="">bitte wählen</option>
            ${reviewLevels.map((level) => `<option value="${level.value}" ${value.level === level.value ? "selected" : ""}>${escapeHtml(level.label)}</option>`).join("")}
          </select>
        </label>
        <label>
          Kommentar
          <textarea name="criterion-comment" data-criterion-id="${criterion.id}" placeholder="Woran sieht die Person deine Einschätzung konkret im Text?">${escapeHtml(value.comment)}</textarea>
        </label>
      </article>
    `;
  }).join("");
}

function renderPeerPortfolio(review) {
  const entries = review.reviewee?.lessonPortfolio?.entries || [];
  if (!entries.length) {
    return '<div class="empty-box">Für diese Lektion liegt von dieser Person noch kein bearbeiteter Passagenausschnitt vor.</div>';
  }

  return entries.map((entry) => `
    <article class="peer-entry-card">
      <div class="peer-entry-head">
        <div>
          <div class="eyebrow">${escapeHtml(entry.pageHint)}</div>
          <h3>${escapeHtml(entry.title)}</h3>
        </div>
        <span class="status-badge">${escapeHtml(entry.passageLabel)}</span>
      </div>
      ${entry.observation ? `<p><strong>Beobachtung:</strong> ${escapeHtml(entry.observation)}</p>` : ""}
      ${entry.evidence ? `<p><strong>Textanker:</strong> ${escapeHtml(entry.evidence)}</p>` : ""}
      ${entry.interpretation ? `<p><strong>Deutung:</strong> ${escapeHtml(entry.interpretation)}</p>` : ""}
      ${entry.theory ? `<p><strong>Theoriebezug:</strong> ${escapeHtml(entry.theory)}</p>` : ""}
      ${entry.revision ? `<p><strong>Revision:</strong> ${escapeHtml(entry.revision)}</p>` : ""}
    </article>
  `).join("");
}

function renderPeerReviewPanel() {
  if (mode !== "open" || !state.peerReview?.enabled) {
    return "";
  }

  if (!state.peerReview.assignments?.length) {
    return `
      <section class="panel review-panel">
        <div class="panel-head">
          <div>
            <div class="eyebrow">Peer Review</div>
            <h2>Derzeit keine Zuweisungen</h2>
          </div>
        </div>
        <div class="empty-box">Sobald weitere Schüler*innen in dieser Klasse arbeiten oder die Lehrkraft Peer Review aktiviert, erscheinen hier deine Review-Aufträge.</div>
      </section>
    `;
  }

  const review = currentReviewAssignment();
  const reviewStatusLabel = {
    idle: "",
    saving: "speichert Review ...",
    saved: "Review gespeichert",
    error: "Review konnte nicht gespeichert werden"
  }[state.reviewSaveStatus] || "";

  return `
    <section class="panel review-panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Peer Review</div>
          <h2>Zugewiesene Rückmeldungen</h2>
        </div>
        <span class="status-badge">${escapeHtml(`${state.peerReview.stats.completedAssignedCount}/${state.peerReview.stats.assignedCount} abgeschlossen`)}</span>
      </div>

      <div class="notice-box">
        <strong>Arbeitsrahmen</strong>
        <p>${escapeHtml(state.peerReview.instructions)}</p>
        <p>${escapeHtml(`Review-Lektion: ${lessonSets.find((lesson) => lesson.id === state.peerReview.lessonId)?.title || state.peerReview.lessonId}`)}</p>
      </div>

      <div class="review-layout">
        <aside class="review-sidebar">
          <div class="review-pill-list">
            ${renderReviewList()}
          </div>
        </aside>

        <div class="review-main">
          <div class="panel-head">
            <div>
              <div class="eyebrow">Peer-Arbeit</div>
              <h2>${escapeHtml(review.reviewee?.displayName || "Peer")}</h2>
            </div>
            <span class="status-badge">${escapeHtml(review.status)}</span>
          </div>

          <div class="review-meta-grid">
            <div class="status-card">
              <span class="eyebrow">Bearbeitete Passagen</span>
              <strong>${escapeHtml(`${review.reviewee?.lessonPortfolio?.completedEntries || 0}/${review.reviewee?.lessonPortfolio?.totalEntries || 0}`)}</strong>
            </div>
            <div class="status-card">
              <span class="eyebrow">Zuletzt aktualisiert</span>
              <strong>${escapeHtml(review.reviewee?.updatedAt ? new Date(review.reviewee.updatedAt).toLocaleString("de-CH") : "-")}</strong>
            </div>
          </div>

          <div class="peer-portfolio">
            ${renderPeerPortfolio(review)}
          </div>

          <form id="peer-review-form" class="review-form">
            <input type="hidden" name="reviewId" value="${review.id}">
            <div class="criteria-grid">
              ${renderCriterionFields(review)}
            </div>

            <label>
              Wichtiger Textanker aus der besprochenen Arbeit
              <textarea name="quotedEvidence" placeholder="Welche Formulierung oder welches Signalwort soll in der Überarbeitung unbedingt erhalten oder präzisiert werden?">${escapeHtml(review.quotedEvidence || "")}</textarea>
            </label>
            <label>
              Stärken
              <textarea name="strengths" placeholder="Was gelingt der Person textnah oder deutungsstark bereits gut?">${escapeHtml(review.strengths || "")}</textarea>
            </label>
            <label>
              Nächste Schritte
              <textarea name="nextSteps" placeholder="Welche konkrete Überarbeitung würdest du als Nächstes empfehlen?">${escapeHtml(review.nextSteps || "")}</textarea>
            </label>
            <label>
              Rückfrage
              <textarea name="question" placeholder="Welche Rückfrage hilft der Person, ihre Deutung weiter zu schärfen?">${escapeHtml(review.question || "")}</textarea>
            </label>

            <div class="row">
              <button type="submit" data-submit-status="draft">Entwurf speichern</button>
              <button type="submit" class="button secondary" data-submit-status="submitted">Review abschicken</button>
              ${reviewStatusLabel ? `<span class="inline-status">${escapeHtml(reviewStatusLabel)}</span>` : ""}
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderTopStatus() {
  const lesson = currentLesson();
  const progress = progressForCurrentLesson();
  const saveLabel = {
    idle: "bereit",
    saving: "speichert ...",
    saved: state.lastSavedAt
      ? `${isTeacherPreview ? "lokal gespeichert" : "gespeichert"} · ${new Date(state.lastSavedAt).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}`
      : (isTeacherPreview ? "lokal gespeichert" : "gespeichert"),
    error: "Speicherfehler"
  }[state.saveStatus] || "bereit";

  return `
    <section class="status-strip">
      <div class="status-card">
        <span class="eyebrow">Klasse</span>
        <strong>${escapeHtml(state.classroom?.name || "-")}</strong>
      </div>
      <div class="status-card">
        <span class="eyebrow">Bearbeitung</span>
        <strong>${escapeHtml(state.student?.displayName || "-")}</strong>
      </div>
      <div class="status-card">
        <span class="eyebrow">Aktive Lektion</span>
        <strong>${escapeHtml(lesson?.title || "-")}</strong>
      </div>
      <div class="status-card">
        <span class="eyebrow">Fortschritt</span>
        <strong>${escapeHtml(progress ? `${progress.completedEntries}/${progress.totalEntries}` : "-")}</strong>
      </div>
      <div class="status-card">
        <span class="eyebrow">Peer Reviews</span>
        <strong>${escapeHtml(state.peerReview?.stats ? `${state.peerReview.stats.completedAssignedCount}/${state.peerReview.stats.assignedCount}` : "-")}</strong>
      </div>
      <div class="status-card">
        <span class="eyebrow">Status</span>
        <strong>${escapeHtml(saveLabel)}</strong>
      </div>
    </section>
  `;
}

function renderProgressBox() {
  return `
    <div class="progress-box">
      ${state.progress?.lessonProgress?.map((lesson) => `
        <div class="progress-row">
          <span>${escapeHtml(lesson.title)}</span>
          <strong>${escapeHtml(`${lesson.completedEntries}/${lesson.totalEntries}`)}</strong>
        </div>
      `).join("") || ""}
    </div>
  `;
}

function renderParcoursExportPanel() {
  const complete = isParcoursComplete();
  const answered = state.progress?.completedEntries || 0;
  const total = state.progress?.totalEntries || 0;

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Parcours-Export</div>
          <h2>${complete ? "Parcours abgeschlossen" : "Parcours dokumentieren"}</h2>
        </div>
        <button class="button secondary" data-action="export-notes">${complete ? "Fragen und Antworten exportieren" : "Zwischenstand exportieren"}</button>
      </div>
      <div class="notice-box">
        <strong>${complete ? "Alle Stationen sind bearbeitet." : "Export bereits jetzt möglich."}</strong>
        <p>${escapeHtml(`Der Export enthält alle Lektionen, Fokusfragen und die dazu eingetragenen Antworten. Aktuell sind ${answered} von ${total} Passagen bearbeitet.`)}</p>
      </div>
    </section>
  `;
}

function render() {
  if (state.loading) {
    app.innerHTML = '<main class="reader-shell"><section class="panel"><h1>Lädt ...</h1><p>Arbeitsumgebung wird vorbereitet.</p></section></main>';
    return;
  }

  if (state.error && !state.ready) {
    app.innerHTML = `<main class="reader-shell"><section class="panel"><h1>Reader nicht verfügbar</h1><p>${escapeHtml(state.error)}</p></section></main>`;
    return;
  }

  ensureSelection();
  const module = currentModule();
  const entry = currentEntry();
  const lesson = currentLesson();

  app.innerHTML = `
    <main class="reader-shell">
      <section class="hero">
        <div>
          <div class="eyebrow">Bahnwärter Thiel · ${escapeHtml(modeLabel)}</div>
          <h1>Engmaschiges PDF-Lesetool für die ganze Novelle</h1>
          <p>
            ${isTeacherPreview
              ? "Diese Lehrervorschau zeigt denselben streng geführten Reader wie die Lernenden: mit Textfeldern, Lückenanzeige, Export und direkt sichtbarem Arbeitsfeedback, aber ohne Klassen-Code und ohne Schüler-Session."
              : mode === "seb"
              ? "Diese SEB-Fassung arbeitet mit einem klaren Lektionen-Set. Die Textpassagen und Theorie-Linsen sind auf die aktuelle Prüfungseinheit fokussiert."
              : "Der Text ist vollständig integriert. Links steuerst du den Textpfad und die Theorie-Linsen, in der Mitte liest du die Passage im PDF, rechts verbindest du Textbeobachtung, Theoriebezug, Überarbeitung und Peer Review."}
          </p>
        </div>
        <div class="hero-actions">
          <span class="status-badge">${escapeHtml(modeLabel)}</span>
          <span class="status-badge">${escapeHtml(lesson.reviewFocus)}</span>
          ${isTeacherPreview
            ? '<a class="button secondary" href="/teacher">Zum Dashboard</a><a class="button secondary" href="/auth/teacher/logout">Abmelden</a>'
            : (mode === "open" ? '<a class="button secondary" href="/auth/logout">Abmelden</a>' : "")
          }
        </div>
      </section>

      ${renderTopStatus()}

      ${state.error ? `<section class="panel"><p>${escapeHtml(state.error)}</p></section>` : ""}

      <section class="layout">
        <aside class="panel sidebar">
          <div class="panel-head">
            <div>
              <div class="eyebrow">${escapeHtml(starterPrompt.title)}</div>
              <h2>Textpfad</h2>
            </div>
          </div>
          <ul class="prompt-list">${renderPromptList()}</ul>

          <section class="lesson-box">
            <div class="eyebrow">Lektionssets</div>
            <div class="lesson-list">
              ${renderLessonRail()}
            </div>
            <div class="sidebar-task">
              <strong>${escapeHtml(lesson.title)}</strong>
              <p>${escapeHtml(mode === "seb" ? lesson.sebPrompt : lesson.summary)}</p>
            </div>
          </section>

          ${renderProgressBox()}
          <div class="module-list">${renderSidebar()}</div>

          <div class="sidebar-task">
            <strong>${escapeHtml(module.title)}</strong>
            <p>${escapeHtml(module.task)}</p>
          </div>

          <section class="theory-sidebar">
            <div class="eyebrow">Theorie-Ressourcen</div>
            <div class="theory-pill-list">
              ${renderTheorySelector(module, entry)}
            </div>
          </section>
        </aside>

        ${renderPdfPanel(entry, module)}

        <section class="content-column">
          <article class="panel scene-panel">
            <div class="panel-head">
              <div>
                <div class="eyebrow">${escapeHtml(module.lens)}</div>
                <h2>${escapeHtml(entry.title)}</h2>
              </div>
              <span class="status-badge">${escapeHtml(entry.pageHint)}</span>
            </div>

            <div class="entry-tabs">${renderEntryTabs(module)}</div>
            <div class="scene-card">
              <h3>${escapeHtml(entry.passageLabel)}</h3>
              <p>${escapeHtml(entry.context)}</p>
              <div class="signal-grid">${renderSignalWords(entry)}</div>
              <div class="prompt-box">
                <strong>Fokusfragen</strong>
                ${renderFocusQuestions(entry)}
              </div>
              <div class="writing-frame-box">
                <strong>Satzstarter</strong>
                <p>${escapeHtml(entry.writingFrame)}</p>
              </div>
            </div>
          </article>

          ${renderTheoryPanel(module, entry)}
          ${renderNotebook(entry)}
          ${renderSebFeedbackPanel()}
          ${renderPeerReviewPanel()}
          ${renderParcoursExportPanel()}
        </section>
      </section>
    </main>
  `;
}

function updateNoteField(field, value) {
  const entry = currentEntry();
  state.notes[entry.id] = {
    ...noteForEntry(entry.id),
    [field]: value
  };
  state.saveStatus = "idle";
}

function updateNoteArrayField(field, index, value) {
  const entry = currentEntry();
  const note = noteForEntry(entry.id);
  const nextValues = Array.isArray(note[field]) ? [...note[field]] : [];
  nextValues[index] = value;
  state.notes[entry.id] = {
    ...note,
    [field]: nextValues
  };
  state.saveStatus = "idle";
}

function updateTheoryAnswer(section, index, value) {
  const entry = currentEntry();
  const theory = currentTheory();
  const note = noteForEntry(entry.id);
  const stored = note.theoryResponses?.[theory.id] || {};
  const nextSection = Array.isArray(stored[section]) ? [...stored[section]] : [];
  nextSection[index] = value;

  state.notes[entry.id] = {
    ...note,
    theoryResponses: {
      ...(note.theoryResponses || {}),
      [theory.id]: {
        ...stored,
        [section]: nextSection
      }
    }
  };
  state.saveStatus = "idle";
}

function updateLiveDocumentation() {
  const entry = currentEntry();
  const theory = currentTheory();
  if (!entry || !theory) {
    return;
  }

  const focusAnswers = focusAnswersFor(entry);
  const theoryResponses = theoryResponseFor(entry, theory);
  const documentation = documentationStatusForEntry(entry, theory);
  const summary = document.querySelector('[data-doc-summary="entry"]');
  const missing = document.querySelector('[data-doc-missing="entry"]');
  const focusCount = document.querySelector('[data-doc-count="focus"]');
  const guidingCount = document.querySelector('[data-doc-count="guiding"]');
  const transferCount = document.querySelector('[data-doc-count="transfer"]');
  const entryBox = summary?.closest(".documentation-status-box");

  if (summary) {
    summary.textContent = `Dokumentationsstand: ${documentation.completed}/${documentation.total}`;
  }

  if (missing) {
    missing.textContent = documentation.missing.length
      ? `Noch offen: ${documentation.missing.join(" · ")}`
      : "Alle Fokusfragen, Leitfragen und Transferfragen sind schriftlich dokumentiert.";
  }

  if (entryBox) {
    entryBox.classList.toggle("is-warning", Boolean(documentation.missing.length));
    entryBox.classList.toggle("is-complete", !documentation.missing.length);
  }

  if (focusCount) {
    focusCount.textContent = `${focusAnswers.filter((value) => trimmed(value)).length}/${entry.prompts.length}`;
  }

  if (guidingCount) {
    guidingCount.textContent = `${theoryResponses.guidingAnswers.filter((value) => trimmed(value)).length}/${theory.questions.length}`;
  }

  if (transferCount) {
    transferCount.textContent = `${theoryResponses.transferAnswers.filter((value) => trimmed(value)).length}/${transferPromptsFor(entry, theory).length}`;
  }
}

function updateReviewField(field, value) {
  const review = currentReviewAssignment();
  if (!review) {
    return;
  }

  review[field] = value;
  state.reviewSaveStatus = "idle";
}

function updateReviewCriterion(criterionId, field, value) {
  const review = currentReviewAssignment();
  if (!review) {
    return;
  }

  const current = review.criteria.find((entry) => entry.id === criterionId);
  if (current) {
    current[field] = value;
  }
  state.reviewSaveStatus = "idle";
}

async function submitReview(status) {
  const review = currentReviewAssignment();
  if (!review) {
    return;
  }

  state.reviewSaveStatus = "saving";
  render();

  try {
    const response = await fetch(`/reader-api/reviews/${review.id}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status,
        criteria: review.criteria,
        quotedEvidence: review.quotedEvidence,
        strengths: review.strengths,
        nextSteps: review.nextSteps,
        question: review.question
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Peer Review konnte nicht gespeichert werden.");
    }

    const payload = await response.json();
    applyBootstrap(payload);
    state.reviewSaveStatus = "saved";
    render();
  } catch (error) {
    state.reviewSaveStatus = "error";
    state.error = error.message;
    render();
  }
}

function exportNotes() {
  const markdown = buildParcoursMarkdown({
    modeLabel,
    classroomName: state.classroom?.name || "-",
    studentName: state.student?.displayName || "-",
    complete: isParcoursComplete(),
    completedEntries: state.progress?.completedEntries || 0,
    totalEntries: state.progress?.totalEntries || 0,
    lessons: availableLessons().map((lesson) => ({
      title: lesson.title,
      summary: lesson.summary,
      reviewFocus: lesson.reviewFocus,
      pageRange: pageRangeForLesson(lesson),
      entries: modulesForLesson(lesson).flatMap((module) => module.entries.map((entry) => {
        const note = noteForEntry(entry.id);
        const exportTheories = theoryOptionsFor(module, entry);
        const documentationTheory = exportTheories.find((resource) => resource.id === state.theoryId) || exportTheories[0];
        const theorySections = exportTheories.map((theory) => {
          const stored = note.theoryResponses?.[theory.id] || {};
          const transferPrompts = transferPromptsFor(entry, theory);

          return {
            title: theory.title,
            sourceTitle: theory.sourceTitle,
            guidingQuestions: theory.questions.map((question, index) => ({
              prompt: question,
              answer: stored.guidingAnswers?.[index] || ""
            })),
            transferQuestions: transferPrompts.map((prompt, index) => ({
              prompt,
              answer: stored.transferAnswers?.[index] || ""
            }))
          };
        });

        return {
          title: entry.title,
          moduleTitle: module.title,
          pageHint: entry.pageHint,
          passageLabel: entry.passageLabel,
          context: entry.context,
          prompts: entry.prompts,
          signalWords: entry.signalWords,
          writingFrame: entry.writingFrame,
          focusAnswers: entry.prompts.map((prompt, index) => ({
            prompt,
            answer: note.focusAnswers?.[index] || ""
          })),
          theorySections,
          documentation: documentationTheory ? documentationStatusForEntry(entry, documentationTheory) : null,
          answers: {
            observation: note.observation || "-",
            evidence: note.evidence || "-",
            interpretation: note.interpretation || "-",
            theory: note.theory || "-",
            revision: note.revision || "-"
          }
        };
      }))
    }))
  });

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bahnwaerter-thiel-parcours-${mode}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const action = target.dataset.action;

  if (action === "select-lesson" && !target.disabled) {
    state.lessonId = target.dataset.lessonId;
    ensureSelection();
    render();
    queueSave();
    queueSebFeedback();
  }

  if (action === "select-module") {
    state.moduleId = target.dataset.moduleId;
    state.entryId = currentModule().entries[0].id;
    ensureSelection();
    render();
    queueSave();
    queueSebFeedback();
  }

  if (action === "select-entry") {
    state.entryId = target.dataset.entryId;
    ensureSelection();
    render();
    queueSave();
    queueSebFeedback();
  }

  if (action === "select-theory") {
    state.theoryId = target.dataset.theoryId;
    render();
    queueSave();
    queueSebFeedback();
  }

  if (action === "toggle-signal") {
    const entry = currentEntry();
    const word = target.dataset.word;
    const note = noteForEntry(entry.id);
    const tokens = note.evidence
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);

    const nextTokens = tokens.includes(word)
      ? tokens.filter((token) => token !== word)
      : [...tokens, word];

    updateNoteField("evidence", nextTokens.join(", "));
    render();
    queueSave();
    queueSebFeedback();
  }

  if (action === "select-review") {
    state.selectedReviewId = target.dataset.reviewId;
    state.reviewSaveStatus = "idle";
    render();
  }

  if (action === "export-notes") {
    exportNotes();
  }

  if (action === "refresh-seb-feedback") {
    requestSebFeedback({ showLoading: true, force: true });
  }
});

document.addEventListener("input", (event) => {
  if (event.target.dataset.noteArray) {
    updateNoteArrayField(event.target.dataset.noteArray, Number(event.target.dataset.index || 0), event.target.value);
    queueSave();
    queueSebFeedback();
    updateLiveDocumentation();
    return;
  }

  if (event.target.dataset.noteTheorySection) {
    updateTheoryAnswer(event.target.dataset.noteTheorySection, Number(event.target.dataset.index || 0), event.target.value);
    queueSave();
    queueSebFeedback();
    updateLiveDocumentation();
    return;
  }

  const noteForm = event.target.closest("#note-form");
  if (noteForm) {
    updateNoteField(event.target.name, event.target.value);
    queueSave();
    queueSebFeedback();
    updateLiveDocumentation();
    return;
  }

  const reviewForm = event.target.closest("#peer-review-form");
  if (reviewForm) {
    if (event.target.name === "criterion-level") {
      updateReviewCriterion(event.target.dataset.criterionId, "level", event.target.value);
    } else if (event.target.name === "criterion-comment") {
      updateReviewCriterion(event.target.dataset.criterionId, "comment", event.target.value);
    } else {
      updateReviewField(event.target.name, event.target.value);
    }
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "peer-review-form") {
    return;
  }

  event.preventDefault();
  const submitter = event.submitter;
  const status = submitter?.dataset.submitStatus || "draft";
  submitReview(status);
});

async function init() {
  render();

  try {
    const payload = await fetchBootstrap();
    applyBootstrap(payload);
    state.ready = true;
    state.loading = false;
    state.error = "";
    ensureSelection();
    render();
    if (mode === "seb" && !isTeacherPreview) {
      await requestSebFeedback({ showLoading: true, force: true });
    }
  } catch (error) {
    state.loading = false;
    state.ready = false;
    state.error = error.message;
    render();
  }
}

init();
