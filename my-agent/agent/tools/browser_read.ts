import { defineTool } from "eve/tools";
import { z } from "zod";
import { browser } from "../lib/browser";

export default defineTool({
  description:
    "Read the current page without navigating: `links` (text + href, optionally inside a CSS selector), `text` or `html` (optionally of one element), " +
    "or scroll first with scroll=true to load lazy results. Prefer links/selectors over reading whole pages.",
  inputSchema: z.object({
    session: z.string().default("default"),
    mode: z.enum(["text", "html", "links"]).default("text"),
    selector: z.string().optional(),
    scroll: z.boolean().default(false),
    maxChars: z.number().int().max(40000).default(8000),
  }),
  async execute({ session, mode, selector, scroll, maxChars }) {
    if (scroll) await browser("scroll", { session, max_chars: 100 });
    return browser("read", { session, mode, selector, max_chars: maxChars });
  },
});
