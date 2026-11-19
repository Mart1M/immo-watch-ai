import { sql } from "./db";

export type Criteria = {
  transaction: "buy" | "rent";
  propertyTypes: string[];
  locations: string[];
  maxPrice?: number;
  minSurface?: number;
  minRooms?: number;
  notes?: string;
};

export async function onboardingDone() {
  const [row] = await sql`SELECT 1 FROM searches LIMIT 1`;
  return !!row;
}

export async function stats() {
  const [row] = await sql`SELECT
    (SELECT count(*) FROM listings)::int AS total,
    (SELECT count(*) FROM listings WHERE first_seen_at > now() - interval '24 hours')::int AS new_today,
    (SELECT count(*) FROM searches WHERE active)::int AS active,
    (SELECT max(started_at) FROM runs) AS last_run`;
  return row as { total: number; new_today: number; active: number; last_run: Date | null };
}

export async function listings() {
  return sql`SELECT l.id, l.source, l.url, l.title, l.price, l.surface, l.rooms, l.city, l.image_url,
      l.first_seen_at, max(sl.score) AS score,
      (l.first_seen_at > now() - interval '24 hours') AS is_new
    FROM listings l LEFT JOIN search_listings sl ON sl.listing_id = l.id
    WHERE l.removed_at IS NULL GROUP BY l.id ORDER BY l.first_seen_at DESC LIMIT 500`;
}

export async function searches() {
  return sql`SELECT id, name, criteria, sources, interval_minutes, active, last_run_at FROM searches ORDER BY id`;
}

export async function recentRuns() {
  return sql`SELECT r.id, r.source, r.status, r.found, r.new_count, r.error, r.started_at, s.name
    FROM runs r JOIN searches s ON s.id = r.search_id ORDER BY r.started_at DESC LIMIT 15`;
}
