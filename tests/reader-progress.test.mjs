import test from "node:test";
import assert from "node:assert/strict";
import { calculateReaderProgress, getLessonSetsWithCounts } from "../src/services/reader-progress.mjs";
import {
  buildReaderBootstrap,
  createOrResumeStudent,
  regenerateClassroomCode,
  savePeerReview,
  updateClassroomSettings
} from "../src/services/reader-store.mjs";

function makeReaderStore() {
  return {
    classes: [
      {
        id: "class-1",
        name: "Klasse 9A",
        code: "THIEL-9A",
        lessonIds: getLessonSetsWithCounts().map((lesson) => lesson.id),
        activeSebLessonId: "lesson-gewalt",
        allowOpen: true,
        allowSeb: true,
        peerReviewEnabled: true,
        requiredPeerReviews: 1,
        peerReviewLessonId: "lesson-lene",
        peerReviewVisibility: "assigned-only",
        peerReviewInstructions: "Arbeite textnah und präzise.",
        peerReviewCriteria: [
          { id: "textnaehe", label: "Textnähe", prompt: "..." },
          { id: "belegarbeit", label: "Belegarbeit", prompt: "..." }
        ],
        createdAt: "2026-03-30T08:00:00.000Z",
        updatedAt: "2026-03-30T08:00:00.000Z"
      }
    ],
    students: [],
    work: [],
    reviews: []
  };
}

test("calculateReaderProgress counts completed entries and lesson coverage", () => {
  const progress = calculateReaderProgress({
    "auftakt-1": {
      observation: "Der Einstieg bleibt sachlich."
    },
    "kapelle-1": {
      interpretation: "Der Raum wird sakral überhöht.",
      theory: "Das passt zur novellentypischen Verdichtung."
    }
  });

  assert.equal(progress.completedEntries, 2);
  assert.equal(progress.theoryEntries, 1);
  assert.equal(progress.lessonProgress.find((lesson) => lesson.id === "lesson-auftakt").completedEntries, 2);
});

test("lesson metadata includes the added theory units", () => {
  const lessons = getLessonSetsWithCounts();

  assert.ok(lessons.some((lesson) => lesson.id === "lesson-novellentheorie"));
  assert.ok(lessons.some((lesson) => lesson.id === "lesson-naturalismus-perspektive"));
});

test("createOrResumeStudent reuses class code and keeps one student per class/name", () => {
  const store = makeReaderStore();
  const first = createOrResumeStudent(store, {
    classCode: "thiel-9a",
    displayName: "Lina K.",
    mode: "open",
    lessonId: "lesson-auftakt"
  });
  const second = createOrResumeStudent(store, {
    classCode: "THIEL-9A",
    displayName: "Lina   K.",
    mode: "seb",
    lessonId: "lesson-gewalt"
  });

  assert.equal(store.students.length, 1);
  assert.equal(first.student.id, second.student.id);
  assert.equal(second.work.selectedLessonId, "lesson-gewalt");
});

test("teacher class settings can update active SEB lesson, peer review, and regenerate code", () => {
  const store = makeReaderStore();
  const before = store.classes[0].code;

  updateClassroomSettings(store, "class-1", {
    activeSebLessonId: "lesson-unfall",
    allowOpen: false,
    peerReviewEnabled: false,
    requiredPeerReviews: 2,
    peerReviewLessonId: "lesson-schluss"
  });
  regenerateClassroomCode(store, "class-1");

  assert.equal(store.classes[0].activeSebLessonId, "lesson-unfall");
  assert.equal(store.classes[0].allowOpen, false);
  assert.equal(store.classes[0].peerReviewEnabled, false);
  assert.equal(store.classes[0].requiredPeerReviews, 2);
  assert.equal(store.classes[0].peerReviewLessonId, "lesson-schluss");
  assert.notEqual(store.classes[0].code, before);
});

test("reader bootstrap exposes assigned peer reviews for open classes", () => {
  const store = makeReaderStore();
  const anna = createOrResumeStudent(store, {
    classCode: "THIEL-9A",
    displayName: "Anna",
    mode: "open",
    lessonId: "lesson-lene"
  });
  const ben = createOrResumeStudent(store, {
    classCode: "THIEL-9A",
    displayName: "Ben",
    mode: "open",
    lessonId: "lesson-lene"
  });

  ben.work.notes["lene-1"] = {
    observation: "Lene wirkt hart.",
    evidence: "kräftig, hart",
    interpretation: "Der Text zeichnet sie als Gegenfigur.",
    theory: "Das wirkt naturalistisch.",
    revision: ""
  };

  const bootstrap = buildReaderBootstrap(store, anna.student.id);
  assert.equal(bootstrap.peerReview.enabled, true);
  assert.equal(bootstrap.peerReview.assignments.length, 1);
  assert.equal(bootstrap.peerReview.assignments[0].reviewee.displayName, "Ben");
  assert.equal(bootstrap.peerReview.assignments[0].reviewee.lessonPortfolio.entries.length, 1);
});

test("submitted peer review requires complete criteria and is stored", () => {
  const store = makeReaderStore();
  const anna = createOrResumeStudent(store, {
    classCode: "THIEL-9A",
    displayName: "Anna",
    mode: "open",
    lessonId: "lesson-lene"
  });
  const ben = createOrResumeStudent(store, {
    classCode: "THIEL-9A",
    displayName: "Ben",
    mode: "open",
    lessonId: "lesson-lene"
  });

  const bootstrap = buildReaderBootstrap(store, anna.student.id);
  const review = bootstrap.peerReview.assignments.find((entry) => entry.revieweeStudentId === ben.student.id);

  const saved = savePeerReview(store, anna.student.id, review.id, {
    status: "submitted",
    quotedEvidence: "kräftig, hart",
    strengths: "Die Beobachtung bleibt textnah.",
    nextSteps: "Erkläre noch genauer die Wirkung der Wortwahl.",
    question: "Wie hängt Lenes Härte mit dem Milieu zusammen?",
    criteria: [
      { id: "textnaehe", level: "stark", comment: "Konkrete Signale werden benannt." },
      { id: "belegarbeit", level: "teilweise", comment: "Ein zweites Zitat würde helfen." }
    ]
  });

  assert.equal(saved.status, "submitted");
  assert.equal(store.reviews.length, 1);
  assert.equal(store.reviews[0].strengths, "Die Beobachtung bleibt textnah.");
});
