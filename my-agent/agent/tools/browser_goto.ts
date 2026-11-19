import { defineTool } from "eve/tools";
import { z } from "zod";
import { browser } from "../lib/browser";

export default defineTool({
  description:
    "Open a URL in a real browser (JavaScript runs, Cloudflare/anti-bot are handled) and return the visible text of the page. " +
    "Use `session` to keep a tab per site. If the result has blocked: true, the site refused us: record it with record_run.",
  inputSchema: z.object({
    url: z.string().url(),
    session: z.string().default("default").describe("Tab name, e.g. the source name"),
    waitFor: z.string().optional().describe("CSS selector to wait for before reading"),
    maxChars: z.number().int().max(30000).default(8000),
  }),
  execute: ({ url, session, waitFor, maxChars }) => browser("goto", { url, session, wait_for: waitFor, max_chars: maxChars }),
});
