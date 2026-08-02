import { auth, defineMcp } from "@lovable.dev/mcp-js";
import syllabusInfoTool from "./tools/syllabus-info";
import listSubjectsTool from "./tools/list-subjects";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gyaan-mcp",
  title: "Gyaan MCP",
  version: "0.1.0",
  instructions:
    "Tools for Gyaan, a CBSE study-notes app. Use `list_supported_subjects` to see available classes/subjects and `get_syllabus_info` for the correct 2026-27 NCERT book and syllabus details for a class and subject.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [syllabusInfoTool, listSubjectsTool],
});