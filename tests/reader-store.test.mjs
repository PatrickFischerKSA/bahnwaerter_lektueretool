import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTeacherOverview,
  createClassroom,
  createOrResumeStudent,
  regenerateClassroomCode,
  saveReaderProgress
} from "../src/services/reader-store.mjs";

function emptyStore() {
  return {
    classes: [],
    students: [],
    work: [],
    reviews: []
  };
}

test("createClassroom generates a code and all current lesson ids", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 9B" });

  assert.equal(store.classes.length, 1);
  assert.equal(classroom.name, "Klasse 9B");
  assert.match(classroom.code, /^THIEL-[A-Z0-9]{6}$/);
  assert.equal(classroom.lessonIds.length, 5);
  assert.ok(classroom.lessonIds.includes("lesson-auftakt"));
  assert.ok(classroom.lessonIds.includes("lesson-schluss"));
});

test("regenerateClassroomCode replaces the existing class code", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 9C" });
  const previousCode = classroom.code;

  regenerateClassroomCode(store, classroom.id);

  assert.notEqual(classroom.code, previousCode);
  assert.match(classroom.code, /^THIEL-[A-Z0-9]{6}$/);
});

test("student registration reuses same learner and stores progress under selected class code", () => {
  const store = emptyStore();
  const classroom = createClassroom(store, { name: "Klasse 9D" });

  const first = createOrResumeStudent(store, {
    classCode: classroom.code,
    displayName: "Lina K.",
    mode: "open",
    lessonId: "lesson-auftakt"
  });
  const firstSelectedLessonId = first.work.selectedLessonId;

  const second = createOrResumeStudent(store, {
    classCode: classroom.code,
    displayName: "Lina K.",
    mode: "seb",
    lessonId: "lesson-gewalt"
  });

  assert.equal(store.students.length, 1);
  assert.equal(first.student.id, second.student.id);
  assert.equal(first.classroom.id, classroom.id);
  assert.equal(firstSelectedLessonId, "lesson-auftakt");
  assert.equal(second.work.selectedLessonId, "lesson-gewalt");

  saveReaderProgress(store, first.student.id, {
    mode: "open",
    lessonId: "lesson-gewalt",
    moduleId: "gewalt",
    entryId: "gewalt-1",
    theoryId: "perspektive",
    notes: {
      "gewalt-1": {
        observation: "Thiel bleibt in einer Situation der Härte auffällig passiv.",
        evidence: "schwieg, stand da",
        interpretation: "Gerade das Ausbleiben einer Reaktion macht Schuld sichtbar.",
        theory: "Die Perspektive hält uns nah an seiner Wahrnehmung und verschärft damit die moralische Spannung.",
        revision: "Noch präziser am Wortlaut zeigen, wie Beobachtung in Anklage kippt."
      }
    }
  });

  const overview = buildTeacherOverview(store);
  const overviewClass = overview.classes.find((entry) => entry.id === classroom.id);
  const student = overviewClass.students.find((entry) => entry.displayName === "Lina K.");

  assert.equal(student.progress.completedEntries, 1);
  assert.equal(student.progress.lessonProgress.some((lesson) => lesson.id === "lesson-gewalt"), true);
});
