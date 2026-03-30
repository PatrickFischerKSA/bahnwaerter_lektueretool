export function buildParcoursMarkdown({
  modeLabel,
  classroomName,
  studentName,
  complete,
  completedEntries,
  totalEntries,
  lessons
}) {
  const lines = [
    "# Bahnwärter Thiel - Parcoursdokumentation",
    "",
    `Modus: ${modeLabel}`,
    `Klasse: ${classroomName || "-"}`,
    `Bearbeitung: ${studentName || "-"}`,
    `Stand: ${complete ? "Parcours abgeschlossen" : "Zwischenstand"}`,
    `Bearbeitete Passagen: ${completedEntries || 0}/${totalEntries || 0}`,
    ""
  ];

  for (const lesson of lessons) {
    lines.push(`## ${lesson.title}`);
    lines.push(lesson.summary || "");
    lines.push(`Review-Fokus: ${lesson.reviewFocus || "-"}`);
    lines.push(`Seitenkorridor: ${lesson.pageRange || "-"}`);
    lines.push("");

    for (const entry of lesson.entries || []) {
      lines.push(`### ${entry.title}`);
      lines.push(`Modul: ${entry.moduleTitle || "-"}`);
      lines.push(`Seite: ${entry.pageHint || "-"}`);
      lines.push(`Passage: ${entry.passageLabel || "-"}`);
      lines.push(`Kontext: ${entry.context || "-"}`);
      lines.push("");
      lines.push("Fragen:");
      for (const [index, prompt] of (entry.prompts || []).entries()) {
        lines.push(`${index + 1}. ${prompt}`);
      }
      lines.push("");
      lines.push("Antworten:");
      lines.push(`Beobachtung: ${entry.answers?.observation || "-"}`);
      lines.push(`Textanker / Wortlaut: ${entry.answers?.evidence || "-"}`);
      lines.push(`Deutung: ${entry.answers?.interpretation || "-"}`);
      lines.push(`Theoriebezug: ${entry.answers?.theory || "-"}`);
      lines.push(`Revision / nächster Schritt: ${entry.answers?.revision || "-"}`);
      lines.push(`Signalwörter der Passage: ${(entry.signalWords || []).join(", ")}`);
      lines.push(`Satzstarter: ${entry.writingFrame || "-"}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
