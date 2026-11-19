import type { Sql } from "postgres";

let client: Sql | undefined;

// Created on first use to keep the bundle and cold starts small.
export async function sql(): Promise<Sql> {
  if (!client) {
    const { default: postgres } = await import("postgres");
    client = postgres(process.env.DATABASE_URL!, { max: 4 });
  }
  return client;
}
