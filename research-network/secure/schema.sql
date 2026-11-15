-- PostgreSQL migration for LOVE FEMMIE Research + Network.
CREATE TABLE IF NOT EXISTS research_articles (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 topic TEXT NOT NULL,
 publisher TEXT NOT NULL,
 source_url TEXT NOT NULL UNIQUE,
 summary TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Approved','Rejected','Published')),
 reviewed_by TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS member_discovery_preferences (
 member_id TEXT PRIMARY KEY,
 display_name TEXT NOT NULL DEFAULT '',
 interests TEXT[] NOT NULL DEFAULT '{}',
 matching_consent BOOLEAN NOT NULL DEFAULT FALSE,
 discoverable BOOLEAN NOT NULL DEFAULT FALSE,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS research_audit_events (
 id BIGSERIAL PRIMARY KEY,
 actor_id TEXT NOT NULL,
 action TEXT NOT NULL,
 resource_id TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS research_articles_status_idx ON research_articles(status);
CREATE INDEX IF NOT EXISTS member_discovery_optin_idx ON member_discovery_preferences(matching_consent,discoverable);
