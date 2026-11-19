"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { runAgent } from "@/lib/agent";
import type { Criteria } from "@/lib/queries";

export async function createSearch(input: { name: string; criteria: Criteria; sources: string[]; intervalMinutes: number }) {
  const [row] = await sql`INSERT INTO searches (name, criteria, sources, interval_minutes)
    VALUES (${input.name}, ${sql.json(input.criteria)}, ${input.sources}, ${input.intervalMinutes}) RETURNING id`;
  await runAgent(`Run search ${row.id} now.`);
  redirect("/");
}

export async function runSearch(id: number) {
  const ok = await runAgent(`Run search ${id} now.`);
  revalidatePath("/searches");
  return ok;
}

export async function updateSearch(id: number, patch: { active?: boolean; intervalMinutes?: number }) {
  if (patch.active !== undefined) await sql`UPDATE searches SET active = ${patch.active} WHERE id = ${id}`;
  if (patch.intervalMinutes) await sql`UPDATE searches SET interval_minutes = ${patch.intervalMinutes} WHERE id = ${id}`;
  revalidatePath("/searches");
}
