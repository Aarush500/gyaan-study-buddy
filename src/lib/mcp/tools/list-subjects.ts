import { defineTool } from "@lovable.dev/mcp-js";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Science",
  "English", "Hindi", "Social Science", "History", "Geography",
  "Civics", "Economics", "Political Science", "Computer Science",
  "Accountancy", "Business Studies",
];
const CLASS_LEVELS = ["9", "10", "11", "12"];

export default defineTool({
  name: "list_supported_subjects",
  title: "List supported subjects",
  description: "List the CBSE class levels and subjects that Gyaan supports.",
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: `Classes: ${CLASS_LEVELS.join(", ")}\nSubjects: ${SUBJECTS.join(", ")}` }],
    structuredContent: { classLevels: CLASS_LEVELS, subjects: SUBJECTS },
  }),
});