CREATE TABLE feed_category (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL
);

CREATE TABLE feed (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    category_id     INTEGER NOT NULL REFERENCES feed_category(id) ON DELETE CASCADE,
    url             TEXT NOT NULL UNIQUE,
    enabled         INTEGER NOT NULL DEFAULT 1,
    fetch_interval  INTEGER NOT NULL DEFAULT 900,    -- secondi
    etag            TEXT,
    last_modified   TEXT,
    last_fetched_at DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id       INTEGER NOT NULL REFERENCES feed(id) ON DELETE CASCADE,
    guid          TEXT,                              -- RSS <guid> se presente
    link          TEXT NOT NULL,                     -- URL articolo (chiave dedup)
    title         TEXT NOT NULL,
    summary       TEXT,
    published_at  DATETIME,
    fetched_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read"        INTEGER NOT NULL DEFAULT 0,
    UNIQUE(feed_id, link)                            -- dedup per feed
);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_feed_id ON news(feed_id);
CREATE INDEX idx_feed_category_id ON feed(category_id);