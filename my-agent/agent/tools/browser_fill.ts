import { defineTool } from "eve/tools";
import { z } from "zod";
import { browser } from "../lib/browser";

export default defineTool({
  description: "Type into an input of the current page like a person would (search box, price field), optionally press Enter, and return the new page text.",
  inputSchema: z.object({
    session: z.string().default("default"),
    selector: z.string(),
    value: z.string(),
    submit: z.boolean().default(false),
    maxChars: z.number().int().max(30000).default(8000),
  }),
  execute: ({ session, selector, value, submit, maxChars }) => browser("fill", { session, selector, value, submit, max_chars: maxChars }),
});
