import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// 2026-27 NCERT syllabus notes per class/subject (mirrors the app's rules).
function syllabusNote(subject: string, classLevel: string): string {
  const subj = subject.toLowerCase();
  if (classLevel === "9") {
    if (subj.includes("math")) return "Class 9 (2026-27) uses the NEW NCF-2023 Maths book 'Ganita Manjari Part 1'. Topics are labelled Proficiency (mandatory) or Advanced (JEE/Olympiad). Never use old Class 9 Maths content.";
    if (["science", "physics", "chemistry", "biology"].includes(subj)) return "Class 9 (2026-27) uses the NEW book 'Exploration' (integrated Physics/Chemistry/Biology + new Earth Science). Gravitation is REMOVED from Class 9. Never use old Class 9 Science content.";
    if (["social science", "history", "geography", "civics", "political science", "economics"].includes(subj)) return "Class 9 (2026-27) uses the NEW integrated book 'Understanding Society: India and Beyond' (16 themes). Never use the old 4-book structure.";
    if (subj === "english") return "Class 9 (2026-27) uses the NEW book 'Kaveri'. Beehive/Moments are gone.";
    if (subj === "sanskrit") return "Class 9 (2026-27) uses the NEW book 'Sharda'.";
    return "Class 9 (2026-27) uses the NEW NCF-2023 books — never use old (pre-2024) Class 9 content.";
  }
  if (classLevel === "10" || classLevel === "12") return `Class ${classLevel} uses the EXISTING/OLD NCERT syllabus (no NCF-2023 changes yet).`;
  if (classLevel === "11") return "Class 11 is transitioning to new books; streams are flexible (students may mix subjects).";
  return "Unknown class level.";
}

export default defineTool({
  name: "get_syllabus_info",
  title: "Get syllabus info",
  description: "Return the correct 2026-27 NCERT syllabus note (book names, key changes) for a CBSE class and subject.",
  inputSchema: {
    classLevel: z.enum(["9", "10", "11", "12"]).describe("CBSE class level."),
    subject: z.string().min(1).describe("Subject name, e.g. Mathematics, Science, English."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ classLevel, subject }) => ({
    content: [{ type: "text", text: syllabusNote(subject, classLevel) }],
    structuredContent: { classLevel, subject, note: syllabusNote(subject, classLevel) },
  }),
});