import { defineTool } from "eve/tools";
import { z } from "zod";
import { browser } from "../lib/browser";

export default defineTool({
  description: "Click an element of the current page (by visible text or CSS selector), then return the new page text. Use it for cookie banners, 'next page', filters.",
  inputSchema: z.object({
    session: z.string().default("default"),
    text: z.string().optional().describe("Visible text of the element"),
    selector: z.string().optional().describe("CSS selector (used when text is absent)"),
    maxChars: z.number().int().max(30000).default(8000),
  }),
  execute: ({ session, text, selector, maxChars }) => browser("click", { session, text, selector, max_chars: maxChars }),
});
