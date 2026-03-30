import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdfSource, readerModules, theoryResources } from "../public/reader/data.js";
import { apiRouter } from "./routes/api.mjs";
import { readerApiRouter } from "./routes/reader-api.mjs";
import { hasOpenAccess, isSafeExamBrowserRequest, parseCookies } from "./services/access.mjs";
import { getEntriesForLesson, getLessonSetById, getLessonSetsWithCounts } from "./services/reader-progress.mjs";
import { createOrResumeStudent, updateReaderStore } from "./services/reader-store.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
const readerDir = path.join(publicDir, "reader");
const OPEN_PASSWORD = process.env.OPEN_VERSION_PASSWORD || "thiel";
const TEACHER_PASSWORD = process.env.TEACHER_DASHBOARD_PASSWORD || "kursraum";
const OPEN_COOKIE = "thiel_open_access";
const STUDENT_COOKIE = "thiel_reader_student";
const CLASS_COOKIE = "thiel_reader_class";
const TEACHER_COOKIE = "thiel_teacher_access";
const SEB_CONFIG_KEY_HASH = process.env.SEB_CONFIG_KEY_HASH || "";
const modulesById = new Map(readerModules.map((module) => [module.id, module]));
const entryIndex = new Map(readerModules.flatMap((module) => module.entries.map((entry) => [entry.id, { module, entry }])));

function renderShellPage({ title, body, bodyClass = "" }) {
  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <style>
          :root {
            --bg: #f3efe7;
            --surface: rgba(255,255,255,0.86);
            --border: rgba(48,66,55,0.16);
            --text: #213026;
            --muted: #66736b;
            --accent: #b45c39;
            --forest: #314335;
            --shadow: 0 20px 60px rgba(30, 42, 36, 0.12);
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100vh;
            font-family: "Avenir Next", "Segoe UI", sans-serif;
            color: var(--text);
            background:
              radial-gradient(circle at top left, rgba(180, 92, 57, 0.16), transparent 30%),
              radial-gradient(circle at top right, rgba(49, 67, 53, 0.18), transparent 36%),
              linear-gradient(180deg, #f4f0e6 0%, #ece6d7 100%);
          }
          .page {
            max-width: 1120px;
            margin: 0 auto;
            padding: 28px 20px 48px;
            display: grid;
            gap: 20px;
          }
          .panel {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 28px;
            box-shadow: var(--shadow);
            padding: 24px;
            backdrop-filter: blur(14px);
          }
          .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-size: 12px;
            color: var(--muted);
            margin-bottom: 10px;
          }
          h1, h2 {
            margin: 0 0 12px;
            font-family: "Iowan Old Style", "Palatino Linotype", serif;
          }
          h1 {
            font-size: clamp(2rem, 5vw, 3.6rem);
            line-height: 0.95;
          }
          p, li {
            line-height: 1.6;
            color: var(--muted);
          }
          .cards {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
          .card {
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 18px;
            background: rgba(255,255,255,0.72);
          }
          .button, button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: 999px;
            padding: 12px 18px;
            background: var(--forest);
            color: #f6f2ea;
            text-decoration: none;
            cursor: pointer;
          }
          .button.secondary, button.secondary {
            background: rgba(49,67,53,0.1);
            color: var(--forest);
          }
          input, select {
            width: 100%;
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 12px 14px;
            font: inherit;
            margin: 10px 0 12px;
            background: rgba(255,255,255,0.9);
          }
          .row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .notice {
            border-left: 4px solid var(--accent);
            padding: 14px;
            background: rgba(180,92,57,0.09);
            border-radius: 0 14px 14px 0;
            color: #62463d;
          }
          .form-grid {
            display: grid;
            gap: 10px;
          }
          .small-list {
            margin: 0;
            padding-left: 18px;
          }
          .teacher-entry-layout {
            display: grid;
            gap: 20px;
            grid-template-columns: minmax(280px, 0.38fr) minmax(0, 1fr);
          }
          .teacher-entry-sidebar,
          .teacher-entry-viewer,
          .teacher-entry-passage-list {
            display: grid;
            gap: 12px;
          }
          .teacher-entry-resource-list {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
          .lesson-nav-card,
          .passage-nav-card,
          .resource-nav-card {
            display: grid;
            gap: 8px;
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 14px;
            background: rgba(255,255,255,0.72);
            text-decoration: none;
            color: var(--text);
          }
          .lesson-nav-card.is-active,
          .passage-nav-card.is-active,
          .resource-nav-card.is-active {
            border-color: rgba(180, 92, 57, 0.45);
            background: rgba(180, 92, 57, 0.1);
          }
          .meta-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
          .meta-card {
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 14px;
            background: rgba(255,255,255,0.74);
          }
          .iframe-shell {
            min-height: 72vh;
            border: 1px solid var(--border);
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255,255,255,0.72);
          }
          .iframe-shell iframe {
            width: 100%;
            min-height: 72vh;
            border: none;
          }
          .prompt-panel {
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 16px;
            background: rgba(255,255,255,0.74);
          }
          .resource-panel {
            display: grid;
            gap: 14px;
          }
          @media (max-width: 960px) {
            .teacher-entry-layout {
              grid-template-columns: 1fr;
            }
            .iframe-shell,
            .iframe-shell iframe {
              min-height: 58vh;
            }
          }
        </style>
      </head>
      <body class="${bodyClass}">
        ${body}
      </body>
    </html>
  `;
}

function lessonMeta(lessonId) {
  if (!lessonId) {
    return null;
  }

  return getLessonSetById(lessonId);
}

function renderLandingPage() {
  const lessons = getLessonSetsWithCounts();
  return renderShellPage({
    title: "Bahnwärter Thiel Lesetool",
    body: `
      <main class="page">
        <section class="panel">
          <div class="eyebrow">Konkrete Umsetzung</div>
          <h1>Bahnwärter Thiel Lesetool</h1>
          <p>
            Drei zusammenhängende Zugänge für den Unterricht: offene Version, SEB-Version und ein Lehrkraft-Dashboard
            mit Klassen-Codes, Fortschrittsübersicht und lektionenbasierten Arbeitssets.
          </p>
        </section>
        <section class="cards">
          <article class="card">
            <div class="eyebrow">Offene Version</div>
            <h2>Passwort + Klassen-Code</h2>
            <p>Für Unterricht, Hausaufgaben oder Hybridsettings. Lernende melden sich mit Unterrichtspasswort, Klassen-Code und Namen an.</p>
            <a class="button" href="/open">Zur offenen Version</a>
          </article>
          <article class="card">
            <div class="eyebrow">Safe Exam Browser</div>
            <h2>SEB-only</h2>
            <p>Für Prüfungs- oder Testsettings. Die aktive SEB-Lektion kann pro Klasse im Lehrkraft-Dashboard festgelegt werden.</p>
            <a class="button" href="/seb">Zur SEB-Version</a>
          </article>
          <article class="card">
            <div class="eyebrow">Lehrkraft-Dashboard</div>
            <h2>Klassen und Fortschritt</h2>
            <p>Verwalte Klassen-Codes, steuere das aktive SEB-Arbeitsset und überblicke den Lernstand deiner Lerngruppe.</p>
            <a class="button secondary" href="/teacher">Zum Lehrkraft-Dashboard</a>
          </article>
          <article class="card">
            <div class="eyebrow">Lehrereingang</div>
            <h2>Alle Aufgaben direkt sehen</h2>
            <p>Geschützter Direkteinstieg für Lehrpersonen mit PDF, Lektionspfad, Passagen und allen Fragen ohne Klassenfreischaltung.</p>
            <a class="button secondary" href="/teacher-entry">Zum Lehrereingang</a>
          </article>
          <article class="card">
            <div class="eyebrow">Studio</div>
            <h2>Plattform-Backbone</h2>
            <p>Die generische Mehrprojekt-Plattform mit Annotationen, Reviews und Projektanlage bleibt separat verfügbar.</p>
            <a class="button secondary" href="/studio">Zum Studio</a>
          </article>
        </section>
        <section class="panel">
          <div class="eyebrow">Lektionssets</div>
          <ul class="small-list">
            ${lessons.map((lesson) => `<li><strong>${lesson.title}:</strong> ${lesson.summary}</li>`).join("")}
          </ul>
        </section>
      </main>
    `
  });
}

function pageRangeForLesson(lesson) {
  const pageNumbers = getEntriesForLesson(lesson.id)
    .map((entry) => Number(entry.pageNumber || 0))
    .filter(Boolean);

  if (!pageNumbers.length) {
    return "-";
  }

  const first = Math.min(...pageNumbers);
  const last = Math.max(...pageNumbers);
  return first === last ? `S. ${first}` : `S. ${first}-${last}`;
}

function renderTeacherEntryPage(lessonId) {
  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Lehrereingang · Bahnwärter Thiel</title>
        <link rel="stylesheet" href="/reader/styles.css">
      </head>
      <body>
        <script>
          window.THIEL_READER_MODE = "open";
          window.THIEL_READER_MODE_LABEL = "Lehrervorschau";
          window.THIEL_READER_CONFIG = ${JSON.stringify({
            teacherPreview: true,
            initialLessonId: lessonId || null
          })};
        </script>
        <script type="module" src="/reader/app.js"></script>
      </body>
    </html>
  `;
}

function renderStudentAccessPage({ mode, lessonId, errorText = "" }) {
  const isOpen = mode === "open";
  const lesson = lessonMeta(lessonId);
  const formAction = isOpen ? "/auth/open" : "/auth/seb";
  const title = isOpen ? "Offene Version entsperren" : "SEB-Version öffnen";
  const heading = isOpen ? "Lesetool entsperren" : "SEB-Lesetool starten";

  return renderShellPage({
    title,
    body: `
      <main class="page">
        <section class="panel">
          <div class="eyebrow">${isOpen ? "Offene Version" : "SEB-Version"}</div>
          <h1>${heading}</h1>
          <p>
            ${isOpen
              ? "Diese Version ist für offene Unterrichtssituationen gedacht und wird über Unterrichtspasswort, Klassen-Code und Namen freigeschaltet."
              : "Diese Version läuft nur im Safe Exam Browser. Für die Zuordnung zur Klasse gibst du nur Klassen-Code und Namen an."}
          </p>
          <div class="notice">
            <strong>So funktioniert die Anmeldung:</strong>
            <br>1. Klassen-Code exakt eingeben.
            <br>2. Deinen Namen oder ein eindeutiges Kürzel eintragen.
            ${isOpen ? "<br>3. Das Unterrichtspasswort eingeben." : ""}
            <br>${isOpen ? "4." : "3."} Auf ${isOpen ? "Freischalten" : "Starten"} klicken und dann direkt in der zugewiesenen Lektion arbeiten.
          </div>
          ${lesson ? `<div class="notice"><strong>Vorgewählte Lektion:</strong> ${lesson.title}<br>${lesson.sebPrompt}</div>` : ""}
          ${errorText ? `<div class="notice"><strong>Hinweis:</strong> ${errorText}</div>` : ""}
          <form method="post" action="${formAction}" class="form-grid">
            <input type="hidden" name="lessonId" value="${lessonId || ""}">
            <label for="classCode">Klassen-Code</label>
            <input id="classCode" name="classCode" type="text" autocomplete="off" placeholder="z. B. THIEL-9A">
            <label for="displayName">Name / Kürzel</label>
            <input id="displayName" name="displayName" type="text" autocomplete="name" placeholder="z. B. Lina K.">
            ${isOpen ? `
              <label for="password">Unterrichtspasswort</label>
              <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Passwort eingeben">
            ` : ""}
            <div class="row">
              <button type="submit">${isOpen ? "Freischalten" : "Starten"}</button>
              <a class="button secondary" href="/">Zur Übersicht</a>
            </div>
          </form>
        </section>
      </main>
    `
  });
}

function normalizeTeacherRedirect(target) {
  return target === "/teacher-entry" ? "/teacher-entry" : "/teacher";
}

function renderTeacherLoginPage(errorText = "", redirectTo = "/teacher") {
  const safeRedirect = normalizeTeacherRedirect(redirectTo);
  const isTeacherEntry = safeRedirect === "/teacher-entry";
  return renderShellPage({
    title: `${isTeacherEntry ? "Lehrereingang" : "Lehrkraft-Dashboard"} · Bahnwärter Thiel`,
    body: `
      <main class="page">
        <section class="panel">
          <div class="eyebrow">${isTeacherEntry ? "Lehrereingang" : "Lehrkraft-Dashboard"}</div>
          <h1>${isTeacherEntry ? "Lehrereingang entsperren" : "Dashboard entsperren"}</h1>
          <p>${isTeacherEntry
            ? "Der Lehrereingang zeigt alle Lektionen, Passagen, Fragen und das eingebettete PDF direkt, ist aber mit demselben Passwort wie das Lehrkraft-Dashboard geschützt."
            : "Die Lehrkraftansicht ist separat geschützt und verwaltet Klassen-Codes, SEB-Lektionen und Lernfortschritte."}</p>
          <div class="notice">
            <strong>Wichtig vor dem Unterricht:</strong>
            <br>1. Klasse anlegen.
            <br>2. Klassen-Code prüfen und kopieren.
            <br>3. Offene Version oder SEB-Version passend freischalten.
            <br>4. Einmal selbst mit Testname den Login durchspielen.
          </div>
          ${errorText ? `<div class="notice"><strong>Hinweis:</strong> ${errorText}</div>` : ""}
          <form method="post" action="/auth/teacher" class="form-grid">
            <input type="hidden" name="redirectTo" value="${safeRedirect}">
            <label for="teacherPassword">Lehrkraft-Passwort</label>
            <input id="teacherPassword" name="password" type="password" autocomplete="current-password" placeholder="Passwort eingeben">
            <div class="row">
              <button type="submit">${isTeacherEntry ? "Lehrereingang öffnen" : "Dashboard öffnen"}</button>
              <a class="button secondary" href="${isTeacherEntry ? "/teacher" : "/teacher-entry"}">${isTeacherEntry ? "Zum Dashboard" : "Zum Lehrereingang"}</a>
              <a class="button secondary" href="/">Zur Übersicht</a>
            </div>
          </form>
        </section>
      </main>
    `
  });
}

function renderSebBlockedPage() {
  return renderShellPage({
    title: "SEB erforderlich",
    body: `
      <main class="page">
        <section class="panel">
          <div class="eyebrow">SEB-Version</div>
          <h1>Zugriff nur über Safe Exam Browser</h1>
          <div class="notice">
            Diese Fassung akzeptiert nur Anfragen aus Safe Exam Browser.
            ${SEB_CONFIG_KEY_HASH ? " Zusätzlich ist serverseitig ein bestimmter SEB-Konfigurationsschlüssel hinterlegt." : ""}
          </div>
          <p>Starte das Tool direkt im konfigurierten SEB-Fenster oder nutze alternativ die offene Version mit Passwort.</p>
          <div class="row">
            <a class="button secondary" href="/open">Offene Version</a>
            <a class="button secondary" href="/">Zur Übersicht</a>
          </div>
        </section>
      </main>
    `
  });
}

function renderTeacherPage() {
  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Lehrkraft-Dashboard</title>
        <link rel="stylesheet" href="/teacher/styles.css">
      </head>
      <body>
        <script type="module" src="/teacher/app.js"></script>
      </body>
    </html>
  `;
}

function renderReaderPage(mode, lessonId) {
  const modeLabel = mode === "seb" ? "Safe Exam Browser" : "Offene Version";
  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bahnwärter Thiel Lesetool</title>
        <link rel="stylesheet" href="/reader/styles.css">
      </head>
      <body>
        <script>
          window.THIEL_READER_MODE = "${mode}";
          window.THIEL_READER_MODE_LABEL = "${modeLabel}";
          window.THIEL_READER_CONFIG = ${JSON.stringify({ forcedLessonId: lessonId || null })};
        </script>
        <script type="module" src="/reader/app.js"></script>
      </body>
    </html>
  `;
}

function getCookies(request) {
  return parseCookies(request.headers.cookie || "");
}

function hasStudentSession(request) {
  const cookies = getCookies(request);
  return Boolean(cookies[STUDENT_COOKIE]);
}

function clearStudentCookies(response) {
  response.append("Set-Cookie", `${OPEN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  response.append("Set-Cookie", `${STUDENT_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  response.append("Set-Cookie", `${CLASS_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function setStudentCookies(response, classroom, student, includeOpenAccess = false) {
  if (includeOpenAccess) {
    response.append("Set-Cookie", `${OPEN_COOKIE}=1; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`);
  }
  response.append("Set-Cookie", `${STUDENT_COOKIE}=${student.id}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`);
  response.append("Set-Cookie", `${CLASS_COOKIE}=${classroom.id}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`);
}

function hasTeacherAccess(request) {
  return getCookies(request)[TEACHER_COOKIE] === "1";
}

function lessonRedirect(mode, lessonId) {
  if (!lessonId) {
    return `/${mode}`;
  }
  return `/${mode}/lesson/${lessonId}`;
}

export function createApp() {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", apiRouter);
  app.use("/reader-api", readerApiRouter);
  app.use("/reader", express.static(readerDir));

  app.get("/", (_request, response) => {
    response.send(renderLandingPage());
  });

  app.get("/teacher-entry", (request, response) => {
    if (!hasTeacherAccess(request)) {
      response.send(renderTeacherLoginPage("", "/teacher-entry"));
      return;
    }

    response.send(renderTeacherEntryPage(request.query.lesson));
  });

  app.post("/auth/open", async (request, response) => {
    const { password, classCode, displayName, lessonId } = request.body;

    if (password !== OPEN_PASSWORD) {
      response.status(401).send(renderStudentAccessPage({
        mode: "open",
        lessonId,
        errorText: "Das Unterrichtspasswort stimmt nicht."
      }));
      return;
    }

    try {
      const access = await updateReaderStore(async (store) => (
        createOrResumeStudent(store, {
          classCode,
          displayName,
          mode: "open",
          lessonId
        })
      ));

      setStudentCookies(response, access.classroom, access.student, true);
      response.redirect(303, lessonRedirect("open", lessonId));
    } catch (error) {
      response.status(401).send(renderStudentAccessPage({
        mode: "open",
        lessonId,
        errorText: error.message
      }));
    }
  });

  app.post("/auth/seb", async (request, response) => {
    const { classCode, displayName, lessonId } = request.body;

    try {
      const access = await updateReaderStore(async (store) => (
        createOrResumeStudent(store, {
          classCode,
          displayName,
          mode: "seb",
          lessonId
        })
      ));

      setStudentCookies(response, access.classroom, access.student, false);
      response.redirect(303, lessonRedirect("seb", lessonId));
    } catch (error) {
      response.status(401).send(renderStudentAccessPage({
        mode: "seb",
        lessonId,
        errorText: error.message
      }));
    }
  });

  app.post("/auth/teacher", (request, response) => {
    const redirectTo = normalizeTeacherRedirect(request.body.redirectTo);
    if (request.body.password !== TEACHER_PASSWORD) {
      response.status(401).send(renderTeacherLoginPage("Das Lehrkraft-Passwort stimmt nicht.", redirectTo));
      return;
    }

    response.setHeader("Set-Cookie", `${TEACHER_COOKIE}=1; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax`);
    response.redirect(303, redirectTo);
  });

  app.get("/auth/logout", (_request, response) => {
    clearStudentCookies(response);
    response.redirect("/");
  });

  app.get("/auth/teacher/logout", (_request, response) => {
    response.setHeader("Set-Cookie", `${TEACHER_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    response.redirect("/");
  });

  app.get("/open", (request, response) => {
    if (!hasOpenAccess(request, OPEN_COOKIE) || !hasStudentSession(request)) {
      response.send(renderStudentAccessPage({ mode: "open" }));
      return;
    }

    response.send(renderReaderPage("open"));
  });

  app.get("/open/lesson/:lessonId", (request, response) => {
    if (!hasOpenAccess(request, OPEN_COOKIE) || !hasStudentSession(request)) {
      response.send(renderStudentAccessPage({ mode: "open", lessonId: request.params.lessonId }));
      return;
    }

    response.send(renderReaderPage("open", request.params.lessonId));
  });

  app.get("/seb", (request, response) => {
    if (!isSafeExamBrowserRequest(request, SEB_CONFIG_KEY_HASH)) {
      response.status(403).send(renderSebBlockedPage());
      return;
    }

    if (!hasStudentSession(request)) {
      response.send(renderStudentAccessPage({ mode: "seb" }));
      return;
    }

    response.send(renderReaderPage("seb"));
  });

  app.get("/seb/lesson/:lessonId", (request, response) => {
    if (!isSafeExamBrowserRequest(request, SEB_CONFIG_KEY_HASH)) {
      response.status(403).send(renderSebBlockedPage());
      return;
    }

    if (!hasStudentSession(request)) {
      response.send(renderStudentAccessPage({ mode: "seb", lessonId: request.params.lessonId }));
      return;
    }

    response.send(renderReaderPage("seb", request.params.lessonId));
  });

  app.get("/teacher", (request, response) => {
    if (!hasTeacherAccess(request)) {
      response.send(renderTeacherLoginPage("", "/teacher"));
      return;
    }

    response.send(renderTeacherPage());
  });

  app.get("/studio", (_request, response) => {
    response.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/studio/*", (_request, response) => {
    response.sendFile(path.join(publicDir, "index.html"));
  });

  app.use(express.static(publicDir));

  return app;
}
