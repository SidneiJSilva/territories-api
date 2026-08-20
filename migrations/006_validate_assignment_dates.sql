ALTER TABLE assignments
ADD CONSTRAINT assignments_returned_at_check
CHECK (
    returned_at IS NULL
    OR returned_at >= assigned_at
);