-- Test data for local development.
-- Loaded only on first DB initialization (when SEED_PATH env var is set).


INSERT INTO feed_category (name) VALUES
    ('Tecnologia'),
    ('Economia'),
    ('Politica'),
    ('Cultura'),
    ('Sport');

INSERT INTO feed (name, category_id, url, fetch_interval) VALUES
    ('Hacker News',    1, 'https://hnrss.org/frontpage',                              600),
    ('TechCrunch',     1, 'https://techcrunch.com/feed/',                             900),
    ('ANSA Tecnologia',1, 'https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml', 1800),
    ('The Verge',      1, 'https://www.theverge.com/rss/index.xml',                   1800),
    ('Economia',        2, 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml', 1800),
    ('Politica',        3, 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml', 1800),
    ('Cultura',         4, 'https://www.ansa.it/sito/notizie/cultura/cultura_rss.xml', 1800),
    ('Sport',          5, 'https://www.ansa.it/sito/notizie/sport/sport_rss.xml', 1800);

INSERT INTO news (feed_id, guid, link, title, summary, published_at, fetched_at, "read") VALUES
    (1, 'hn:38123', 'https://example.com/show-hn-rust-tool',     'Show HN: A new Rust CLI tool',           'Demo article about a new Rust CLI tool.',  '2026-04-18 10:30:00', '2026-04-18 10:35:00', 0),
    (1, 'hn:38124', 'https://example.com/ask-hn-monorepo',       'Ask HN: Best practices for monorepos',   'Discussion about monorepo trade-offs.',    '2026-04-18 09:15:00', '2026-04-18 09:20:00', 1),
    (1, 'hn:38125', 'https://example.com/sqlite-internals',      'SQLite Internals: WAL Mode Explained',   'Deep dive into WAL journaling in SQLite.', '2026-04-19 07:00:00', '2026-04-19 07:05:00', 0),

    (2, NULL,       'https://example.com/openai-launch',         'OpenAI announces new model',             'Latest OpenAI announcement.',              '2026-04-19 08:00:00', '2026-04-19 08:05:00', 0),
    (2, NULL,       'https://example.com/startup-funding',       'Startup raises $50M Series B',           'Funding round news.',                      '2026-04-19 11:00:00', '2026-04-19 11:05:00', 0),

    (3, 'ansa:001', 'https://example.com/ansa-cyber',            'Cybersecurity, nuove minacce in Italia', 'Aggiornamento sulle minacce cyber.',       '2026-04-19 07:30:00', '2026-04-19 07:35:00', 0),
    (3, 'ansa:002', 'https://example.com/ansa-ai-regolamento',   'AI: nuovo regolamento europeo',          'Punti chiave del nuovo regolamento UE.',   '2026-04-19 09:45:00', '2026-04-19 09:50:00', 0),

    (4, NULL,       'https://example.com/verge-iphone',          'Apple unveils new iPhone lineup',        'Highlights from the keynote.',             '2026-04-18 18:00:00', '2026-04-18 18:05:00', 1),
    (4, NULL,       'https://example.com/verge-ev-charging',     'EV charging network expands across EU',  'New stations rolling out in 2026.',        '2026-04-19 12:30:00', '2026-04-19 12:35:00', 0);
