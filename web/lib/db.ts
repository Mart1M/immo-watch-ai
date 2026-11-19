import postgres from "postgres";

const g = globalThis as unknown as { __sql?: postgres.Sql };

export const sql = (g.__sql ??= postgres(process.env.DATABASE_URL!, { max: 5 }));
