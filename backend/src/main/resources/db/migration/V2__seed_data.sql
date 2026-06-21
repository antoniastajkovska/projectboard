CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (username, email, password)
VALUES (
    'anton',
    'anton@example.com',
    crypt('password123', gen_salt('bf'))
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (title, description, deadline, status, user_id)
VALUES
(
    'KIII Project',
    'Docker and Kubernetes app',
    DATE '2026-07-01',
    'IN_PROGRESS',
    (SELECT id FROM users WHERE email = 'anton@example.com')
),
(
    'Study Planner',
    'Track classes, assignments, and revision tasks',
    DATE '2026-07-15',
    'PLANNED',
    (SELECT id FROM users WHERE email = 'anton@example.com')
)
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, completed, project_id)
VALUES
(
    'Create Dockerfile',
    'Containerize the backend service',
    FALSE,
    (SELECT id FROM projects WHERE title = 'KIII Project' AND user_id = (SELECT id FROM users WHERE email = 'anton@example.com'))
),
(
    'Write README notes',
    'Document local setup and API endpoints',
    TRUE,
    (SELECT id FROM projects WHERE title = 'KIII Project' AND user_id = (SELECT id FROM users WHERE email = 'anton@example.com'))
),
(
    'Add assignment deadlines',
    'List upcoming due dates for the week',
    FALSE,
    (SELECT id FROM projects WHERE title = 'Study Planner' AND user_id = (SELECT id FROM users WHERE email = 'anton@example.com'))
)
ON CONFLICT DO NOTHING;
