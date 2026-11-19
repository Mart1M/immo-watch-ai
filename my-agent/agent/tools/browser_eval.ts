import { defineTool } from "eve/tools";
import { z } from "zod";
import { browser } from "../lib/browser";

export default defineTool({
  description:
    "Run a JavaScript expression in the current page and return its JSON result. Best way to extract many listings at once, e.g. " +
    "`[...document.querySelectorAll('.card')].map(c => ({href: c.querySelector('a').href, price: c.innerText}))`, or to read embedded JSON (`__NEXT_DATA__`).",
  inputSchema: z.object({ session: z.string().default("default"), js: z.string(), maxChars: z.number().int().max(60000).default(20000) }),
  execute: ({ session, js, maxChars }) => browser("eval", { session, js, max_chars: maxChars }),
});
