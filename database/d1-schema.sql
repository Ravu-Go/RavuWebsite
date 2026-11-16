-- Cloudflare D1 SQLite Schema for RAVU Website (Optional — cookies/session fallback works automatically without D1)
-- Apply with: npx wrangler d1 execute ravu-db --file=database/d1-schema.sql

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'partner',
    category TEXT DEFAULT 'Business Partner',
    phone TEXT DEFAULT '',
    google_id TEXT,
    avatar TEXT,
    email_verified_at TEXT,
    last_login_at TEXT,
    last_login_provider TEXT,
    last_login_ip TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
