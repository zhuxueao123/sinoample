import { marked } from "marked";

export function normalizeRichTextHtml(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const content = value.trim();
  if (!content) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  return marked.parse(content) as string;
}
