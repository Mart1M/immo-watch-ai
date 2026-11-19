import { defineTool } from "eve/tools";
import { z } from "zod";
import { sql } from "../lib/db";

const listing = z.object({
  externalId: z.string().describe("Stable id of the ad on the source site"),
  url: z.string().url(),
  title: z.string().optional(),
  price: z.number().optional().describe("Euros (monthly rent for rentals)"),
  surface: z.number().optional().describe("m²"),
  rooms: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  propertyType: z.string().optional().describe("flat | house | other"),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().optional(),
  publishedAt: z.string().optional().describe("ISO date"),
  score: z.number().int().min(0).max(100).optional().describe("Fit with the search criteria"),
  note: z.string().max(200).optional().describe("One-line reason for the score"),
});

export default defineTool({
  description:
    "Upsert listings of one source for a search, track price changes, link them to the search and record the run. Call once per source.",
  inputSchema: z.object({
    searchId: z.number().int(),
    source: z.enum(["bienici", "pap", "seloger", "leboncoin", "other"]),
    listings: z.array(listing).max(100),
  }),
  async execute({ searchId, source, listings }) {
    const db = await sql();
    let created = 0;
    for (const l of listings) {
      const [existing] = await db`SELECT id, price FROM listings WHERE source = ${source} AND external_id = ${l.externalId}`;
      let id: number;
      if (existing) {
        id = existing.id;
        await db`UPDATE listings SET url = ${l.url}, title = ${l.title ?? null}, price = ${l.price ?? null},
          surface = ${l.surface ?? null}, last_seen_at = now(), removed_at = NULL WHERE id = ${id}`;
        if (l.price != null && l.price !== existing.price) {
          await db`INSERT INTO price_history (listing_id, price) VALUES (${id}, ${l.price})`;
        }
      } else {
        const [row] = await db`INSERT INTO listings (source, external_id, url, title, price, surface, rooms, bedrooms,
          property_type, city, postal_code, description, image_url, published_at)
          VALUES (${source}, ${l.externalId}, ${l.url}, ${l.title ?? null}, ${l.price ?? null}, ${l.surface ?? null},
          ${l.rooms ?? null}, ${l.bedrooms ?? null}, ${l.propertyType ?? null}, ${l.city ?? null}, ${l.postalCode ?? null},
          ${l.description ?? null}, ${l.imageUrl ?? null}, ${l.publishedAt ?? null}) RETURNING id`;
        id = row.id;
        created++;
        if (l.price != null) await db`INSERT INTO price_history (listing_id, price) VALUES (${id}, ${l.price})`;
      }
      await db`INSERT INTO search_listings (search_id, listing_id, score, note)
        VALUES (${searchId}, ${id}, ${l.score ?? null}, ${l.note ?? null})
        ON CONFLICT (search_id, listing_id) DO UPDATE SET score = EXCLUDED.score, note = EXCLUDED.note`;
    }
    await db`INSERT INTO runs (search_id, source, status, found, new_count)
      VALUES (${searchId}, ${source}, 'ok', ${listings.length}, ${created})`;
    await db`UPDATE searches SET last_run_at = now() WHERE id = ${searchId}`;
    return { found: listings.length, new: created };
  },
});
