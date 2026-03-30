import test from "node:test";
import assert from "node:assert/strict";
import { buildParcoursMarkdown } from "../public/reader/export.js";

test("parcours export includes lesson questions and student answers", () => {
  const markdown = buildParcoursMarkdown({
    modeLabel: "Offene Version",
    classroomName: "Klasse 9B",
    studentName: "Lina K.",
    complete: true,
    completedEntries: 20,
    totalEntries: 20,
    lessons: [
      {
        title: "Lektion 3 · Gewalt, Schuld und innere Spaltung",
        summary: "Thiels Passivität und die Vorbereitung der Katastrophe.",
        reviewFocus: "Verbinde Schuldfrage und Wahrnehmungsinstabilität mit dem Wortlaut.",
        pageRange: "S. 13-17",
        entries: [
          {
            title: "Thiels Passivität",
            moduleTitle: "Gewalt und Schuld",
            pageHint: "S. 14",
            passageLabel: "Nicht-Handeln als Schuld",
            context: "Die Szene zeigt, wie Unterlassung moralisch aufgeladen wird.",
            prompts: [
              "Wie wird Schuld durch Nicht-Handeln sichtbar?",
              "Welche Wörter verschärfen die moralische Spannung?"
            ],
            focusAnswers: [
              {
                prompt: "Wie wird Schuld durch Nicht-Handeln sichtbar?",
                answer: "Die Szene macht Schuld gerade dadurch sichtbar, dass Thiel seine Handlungsmacht nicht einsetzt."
              },
              {
                prompt: "Welche Wörter verschärfen die moralische Spannung?",
                answer: "Vor allem die Wörter schwieg und duldete machen aus Beobachtung ein Werturteil."
              }
            ],
            signalWords: ["schwieg", "duldete", "Kind"],
            writingFrame: "Die Passage macht Schuld nicht über Tat, sondern über Unterlassung sichtbar, weil ...",
            theorySections: [
              {
                title: "Erzählperspektiven",
                sourceTitle: "musstewissen Deutsch",
                guidingQuestions: [
                  {
                    prompt: "Wie lenkt die Erzählperspektive die Wahrnehmung von Thiels innerem Konflikt?",
                    answer: "Die enge Wahrnehmung an Thiel bindet die Schuldfrage an seine innere Blockade."
                  }
                ],
                transferQuestions: [
                  {
                    prompt: "Beziehe die Passage gezielt auf Erzählperspektiven und sichere deine Aussage mit mindestens zwei Wörtern aus dem Text.",
                    answer: "Die personale Nähe über schwieg und duldete lässt seine Passivität wie ein inneres Mitwissen erscheinen."
                  }
                ]
              }
            ],
            documentation: {
              completed: 8,
              total: 9,
              missing: ["Transfer 2: Funktionsbezug zur Gesamtwirkung"]
            },
            answers: {
              observation: "Thiel greift nicht ein und bleibt äußerlich wie innerlich blockiert.",
              evidence: "schwieg, duldete, Kind",
              interpretation: "Gerade das Ausbleiben einer Handlung macht seine Schuld plausibel.",
              theory: "Die personale Nähe verstärkt, dass Passivität als inneres Versagen erfahrbar wird.",
              revision: "Noch genauer zeigen, wie die Wortwahl zwischen Beobachtung und Urteil kippt."
            }
          }
        ]
      }
    ]
  });

  assert.match(markdown, /Lektion 3 · Gewalt, Schuld und innere Spaltung/);
  assert.match(markdown, /Fokusfragen und schriftliche Antworten:/);
  assert.match(markdown, /Wie wird Schuld durch Nicht-Handeln sichtbar\?/);
  assert.match(markdown, /Antwort: Die Szene macht Schuld gerade dadurch sichtbar/);
  assert.match(markdown, /Notizbuchfelder:/);
  assert.match(markdown, /Beobachtung: Thiel greift nicht ein und bleibt äußerlich wie innerlich blockiert\./);
  assert.match(markdown, /Theoriebezug: Die personale Nähe verstärkt, dass Passivität als inneres Versagen erfahrbar wird\./);
  assert.match(markdown, /Leitfragen zu Erzählperspektiven/);
  assert.match(markdown, /Transfer zur Passage:/);
  assert.match(markdown, /Offene Lücken: Transfer 2: Funktionsbezug zur Gesamtwirkung/);
});
