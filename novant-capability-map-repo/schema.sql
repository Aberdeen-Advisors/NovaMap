-- Novant Health capability map — Neon Postgres schema.
-- Already applied to the live database (project falling-cake-29493003 /
-- novant-capability-map, database novant_capability_map). Kept here as the
-- source of truth if this ever needs to be recreated elsewhere.

CREATE TABLE IF NOT EXISTS capabilities (
  l2_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  apm_number TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unmapped_apps (
  apm_number TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tech_standards (
  name TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capabilities_l1 ON capabilities ((data->>'l1Id'));
CREATE INDEX IF NOT EXISTS idx_applications_cap ON applications ((data->>'primaryCapabilityId'));
