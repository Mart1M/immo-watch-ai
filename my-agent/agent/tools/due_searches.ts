import { defineTool } from "eve/tools";
import { z } from "zod";
import { sql } from "../lib/db";

export default defineTool({
  description:
    "List the active searches whose schedule is due (never run, or last run older than their interval). Used by the cron tick.",
  inputSchema: z.object({}),
  async execute() {
    const db = await sql();
    return db`
      SELECT id, name, criteria, sources FROM searches
      WHERE active AND (last_run_at IS NULL OR last_run_at < now() - make_interval(mins => interval_minutes))
      ORDER BY last_run_at NULLS FIRST LIMIT 10`;
  },
});
