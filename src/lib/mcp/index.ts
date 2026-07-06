import { defineMcp } from "@lovable.dev/mcp-js";
import syllabusInfoTool from "./tools/syllabus-info";
import listSubjectsTool from "./tools/list-subjects";

export default defineMcp({
  name: "gyaan-mcp",
  title: "Gyaan MCP",
  version: "0.1.0",
  instructions:
    "Tools for Gyaan, a CBSE study-notes app. Use `list_supported_subjects` to see available classes/subjects and `get_syllabus_info` for the correct 2026-27 NCERT book and syllabus details for a class and subject.",
  tools: [syllabusInfoTool, listSubjectsTool],
});