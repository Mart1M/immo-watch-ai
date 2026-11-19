import { defineTool } from "eve/tools";
import { z } from "zod";
import { sql } from "../lib/db";

export default defineTool({
  description:
    "Record a failed or blocked run of one source for a search (successful runs are recorded by save_listings).",
  inputSchema: z.object({
    searchId: z.number().int(),
    source: z.string(),
    status: z.enum(["error", "blocked"]),
    error: z.string().max(500),
  }),
  async execute({ searchId, source, status, error }) {
    const db = await sql();
    await db`INSERT INTO runs (search_id, source, status, error) VALUES (${searchId}, ${source}, ${status}, ${error})`;
    await db`UPDATE searches SET last_run_at = now() WHERE id = ${searchId}`;
    return { ok: true };
  },
});
