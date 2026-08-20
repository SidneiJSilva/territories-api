CREATE UNIQUE INDEX idx_assignments_one_active_per_territory
ON assignments (territory_id)
WHERE returned_at IS NULL;