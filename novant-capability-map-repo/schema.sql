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

-- Demand backlog items (from "Demand to Capability Mapping vMCC.xlsx"), filtered to
-- records that are capability-tagged, successfully mapped to a primary L2 capability,
-- and still in an open workflow state (Draft/Screening/Submitted/Qualified/Approved).
-- Used by the "Demand Backlog" reconciliation page. Refreshing the backlog later means
-- re-running the same extract-and-load pass against an updated export of that file.
CREATE TABLE IF NOT EXISTS demand_items (
  demand_number TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capabilities_l1 ON capabilities ((data->>'l1Id'));
CREATE INDEX IF NOT EXISTS idx_applications_cap ON applications ((data->>'primaryCapabilityId'));
CREATE INDEX IF NOT EXISTS idx_demand_items_primary_cap ON demand_items ((data->>'primaryCapabilityId'));
