CREATE TABLE people (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE campaigns (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE territory_areas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL
);

CREATE TABLE territory_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label TEXT NOT NULL
);

CREATE TABLE territories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    area_id BIGINT NOT NULL
        REFERENCES territory_areas(id),
    type_id BIGINT NOT NULL
        REFERENCES territory_types(id),
    link TEXT,
    synced BOOLEAN NOT NULL DEFAULT FALSE,
    comment TEXT,
    boundaries JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE assignments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    territory_id BIGINT NOT NULL
        REFERENCES territories(id)
        ON DELETE CASCADE,
    person_id BIGINT NOT NULL
        REFERENCES people(id),
    campaign_id BIGINT
        REFERENCES campaigns(id),
    assigned_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
);

CREATE INDEX idx_assignments_territory_id
    ON assignments (territory_id);

CREATE INDEX idx_assignments_person_id
    ON assignments (person_id);

CREATE INDEX idx_assignments_territory_assigned_at
    ON assignments (territory_id, assigned_at DESC);

INSERT INTO settings (key, value)
VALUES
    ('assignment_delay_months', 4),
    ('delay_warning_days', 15),
    ('resting_days', 15);