CREATE VIEW territories_view AS

WITH current_settings AS (
    SELECT
        MAX(value) FILTER (
            WHERE key = 'assignment_delay_months'
        ) AS assignment_delay_months,

        MAX(value) FILTER (
            WHERE key = 'delay_warning_days'
        ) AS delay_warning_days,

        MAX(value) FILTER (
            WHERE key = 'resting_days'
        ) AS resting_days

    FROM settings
),

latest_assignments AS (
    SELECT DISTINCT ON (territory_id)
        id,
        territory_id,
        person_id,
        campaign_id,
        assigned_at,
        returned_at

    FROM assignments

    ORDER BY territory_id, assigned_at DESC
)

SELECT
    t.id,
    t.number,
    t.link,
    t.synced,
    t.active,
    t.comment,
    t.boundaries,

    ta.label AS territory_area,
    tt.label AS territory_type,

    a.assigned_at,
    a.returned_at,
    a.person_id AS assignment_person_id,

    p.id AS people_id,
    p.first_name,
    p.last_name,

    CASE
        -- Territory is currently assigned
        WHEN a.returned_at IS NULL
             AND a.assigned_at IS NOT NULL
        THEN
            CASE
                -- Assignment exceeded the configured delay
                WHEN NOW() >
                    a.assigned_at
                    + MAKE_INTERVAL(
                        months => cs.assignment_delay_months
                    )
                THEN 'delayed'

                -- Assignment is within the configured warning period
                WHEN
                    a.assigned_at
                    + MAKE_INTERVAL(
                        months => cs.assignment_delay_months
                    )
                    - NOW()
                    <= MAKE_INTERVAL(
                        days => cs.delay_warning_days
                    )
                THEN 'delayed_soon'

                ELSE 'assigned'
            END

        -- Campaign assignments become available immediately
        -- after being returned
        WHEN a.returned_at IS NOT NULL
             AND a.campaign_id IS NOT NULL
        THEN 'available'

        -- Normal assignments remain resting for the
        -- configured number of days after being returned
        WHEN a.returned_at IS NOT NULL
             AND NOW() - a.returned_at
                 <= MAKE_INTERVAL(
                     days => cs.resting_days
                 )
        THEN 'resting'

        ELSE 'available'
    END AS status,

    -- Number of days remaining before the assignment becomes delayed
    CASE
        WHEN a.returned_at IS NULL
             AND a.assigned_at IS NOT NULL
             AND NOW() <=
                 a.assigned_at
                 + MAKE_INTERVAL(
                     months => cs.assignment_delay_months
                 )
        THEN
            GREATEST(
                0,
                FLOOR(
                    EXTRACT(
                        EPOCH FROM (
                            a.assigned_at
                            + MAKE_INTERVAL(
                                months => cs.assignment_delay_months
                            )
                            - NOW()
                        )
                    ) / 86400
                )
            )::INTEGER

        ELSE NULL
    END AS days_to_delay,

    -- Number of days the assignment has already been delayed
    CASE
        WHEN a.returned_at IS NULL
             AND a.assigned_at IS NOT NULL
             AND NOW() >
                 a.assigned_at
                 + MAKE_INTERVAL(
                     months => cs.assignment_delay_months
                 )
        THEN
            FLOOR(
                EXTRACT(
                    EPOCH FROM (
                        NOW()
                        - (
                            a.assigned_at
                            + MAKE_INTERVAL(
                                months => cs.assignment_delay_months
                            )
                        )
                    )
                ) / 86400
            )::INTEGER

        ELSE NULL
    END AS delayed_by_days

FROM territories t

CROSS JOIN current_settings cs

LEFT JOIN latest_assignments a
    ON a.territory_id = t.id

LEFT JOIN people p
    ON p.id = a.person_id

INNER JOIN territory_areas ta
    ON ta.id = t.area_id

INNER JOIN territory_types tt
    ON tt.id = t.type_id;