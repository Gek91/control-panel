
INSERT INTO feed_category (id, name) VALUES
    (1, 'Tecnologia'),
    (2, 'Economia'),
    (3, 'Sport'),
    (4, 'Vuota');

INSERT INTO feed (id, name, category_id, url, enabled, fetch_interval, created_at) VALUES
    (1, 'HN',      1, 'https://example.test/hn',  1, 600,  '2026-04-01 00:00:00'),
    (2, 'TechCr',  1, 'https://example.test/tc',  1, 900,  '2026-04-01 00:00:00'),
    (3, 'Economy', 2, 'https://example.test/eco', 1, 1800, '2026-04-01 00:00:00'),
    (4, 'Sport1',  3, 'https://example.test/spo', 1, 1800, '2026-04-01 00:00:00');

INSERT INTO news (id, feed_id, guid, link, title, summary, published_at, fetched_at, "read") VALUES
    (1, 1, 'hn-1',  'https://example.test/news/1', 'HN News 1',  's1', '2026-04-19 10:00:00', '2026-04-19 10:05:00', 0),
    (2, 1, 'hn-2',  'https://example.test/news/2', 'HN News 2',  's2', '2026-04-19 08:00:00', '2026-04-19 08:05:00', 1),
    (3, 2, NULL,    'https://example.test/news/3', 'TC News 3',  NULL,'2026-04-19 12:00:00', '2026-04-19 12:05:00', 0),
    (4, 2, NULL,    'https://example.test/news/4', 'TC News 4',  NULL, NULL,                  '2026-04-19 09:00:00', 0),
    (5, 3, 'eco-1', 'https://example.test/news/5', 'Eco News 5', 's5', '2026-04-19 11:00:00', '2026-04-19 11:05:00', 0);
