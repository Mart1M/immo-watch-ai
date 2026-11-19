import { defineTool } from "eve/tools";
import { z } from "zod";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const BLOCKED = /just a moment|captcha|datadome|access denied|cf-chl/i;

function pick(value: unknown, path: string): unknown {
  return path.split(".").filter(Boolean).reduce<any>((v, k) => v?.[k], value);
}

export default defineTool({
  description:
    "HTTP GET a URL and return its body. For JSON APIs pass `jsonPath` (dot path to an array) and `fields` to get a compact projection. " +
    "Plain HTTP only (no JavaScript, no anti-bot bypass): for protected sites use the browser_* tools.",
  inputSchema: z.object({
    url: z.string().url(),
    jsonPath: z.string().optional().describe("Dot path to an array in the JSON response, e.g. realEstateAds"),
    fields: z.array(z.string()).optional().describe("Keys to keep on each array item"),
    maxChars: z.number().int().max(60000).default(30000),
  }),
  async execute({ url, jsonPath, fields, maxChars }) {
    let status = 0;
    let body = "";
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, accept: "application/json,text/html;q=0.9,*/*;q=0.8", "accept-language": "fr-FR,fr;q=0.9" },
        signal: AbortSignal.timeout(25_000),
      });
      status = res.status;
      body = await res.text();
    } catch (e) {
      body = String(e);
    }
    const blocked = status === 0 || status === 403 || status === 429 || (status !== 200 && BLOCKED.test(body)) || BLOCKED.test(body.slice(0, 3000));

    if (status !== 200) return { ok: false, status, blocked, body: body.slice(0, 300) };

    if (jsonPath) {
      const items = pick(JSON.parse(body), jsonPath);
      if (!Array.isArray(items)) return { ok: false, status, body: "jsonPath is not an array" };
      const rows = fields ? items.map((it) => Object.fromEntries(fields.map((f) => [f, pick(it, f)]))) : items;
      return { ok: true, status, count: rows.length, items: rows };
    }
    return { ok: true, status, body: body.slice(0, maxChars), truncated: body.length > maxChars };
  },
});
