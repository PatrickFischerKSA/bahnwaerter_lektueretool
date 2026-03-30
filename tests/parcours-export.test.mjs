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
            signalWords: ["schwieg", "duldete", "Kind"],
            writingFrame: "Die Passage macht Schuld nicht über Tat, sondern über Unterlassung sichtbar, weil ...",
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
  assert.match(markdown, /Fragen:/);
  assert.match(markdown, /Wie wird Schuld durch Nicht-Handeln sichtbar\?/);
  assert.match(markdown, /Antworten:/);
  assert.match(markdown, /Beobachtung: Thiel greift nicht ein und bleibt äußerlich wie innerlich blockiert\./);
  assert.match(markdown, /Theoriebezug: Die personale Nähe verstärkt, dass Passivität als inneres Versagen erfahrbar wird\./);
});
