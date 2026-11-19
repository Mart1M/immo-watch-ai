-- Schema of the Immo Watch database. Applied once, when the Postgres volume is created.

CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS searches (
  id               serial PRIMARY KEY,
  name             text NOT NULL,
  -- {transaction: "buy"|"rent", propertyTypes: ["flat","house"], locations: ["Lille"],
  --  minPrice, maxPrice, minSurface, minRooms, minBedrooms, notes}
  criteria         jsonb NOT NULL,
  sources          text[] NOT NULL DEFAULT '{bienici,pap,seloger}',
  interval_minutes integer NOT NULL DEFAULT 360,
  active           boolean NOT NULL DEFAULT true,
  last_run_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listings (
  id            serial PRIMARY KEY,
  source        text NOT NULL,
  external_id   text NOT NULL,
  url           text,
  title         text,
  price         integer,
  surface       numeric,
  rooms         integer,
  bedrooms      integer,
  property_type text,
  city          text,
  postal_code   text,
  description   text,
  image_url     text,
  published_at  timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  removed_at    timestamptz,
  raw           jsonb,
  UNIQUE (source, external_id)
);

CREATE TABLE IF NOT EXISTS search_listings (
  search_id  integer NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  score      integer,          -- 0-100 fit with the criteria, set by the agent
  note       text,             -- one-line reason for the score
  seen       boolean NOT NULL DEFAULT false,
  favorite   boolean NOT NULL DEFAULT false,
  matched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (search_id, listing_id)
);

CREATE TABLE IF NOT EXISTS price_history (
  listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price      integer NOT NULL,
  seen_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runs (
  id          serial PRIMARY KEY,
  search_id   integer NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  source      text NOT NULL,
  status      text NOT NULL,   -- ok | error | blocked
  found       integer NOT NULL DEFAULT 0,
  new_count   integer NOT NULL DEFAULT 0,
  error       text,
  started_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_first_seen_idx ON listings (first_seen_at DESC);
CREATE INDEX IF NOT EXISTS runs_started_idx ON runs (started_at DESC);
