import { defineTool } from "eve/tools";
import { z } from "zod";
import { sql } from "../lib/db";

export default defineTool({
  description: "Read one saved search (criteria, sources, schedule) by id.",
  inputSchema: z.object({ searchId: z.number().int() }),
  async execute({ searchId }) {
    const db = await sql();
    const [row] = await db`SELECT id, name, criteria, sources, interval_minutes FROM searches WHERE id = ${searchId}`;
    if (!row) throw new Error(`Search ${searchId} not found`);
    return row;
  },
});
