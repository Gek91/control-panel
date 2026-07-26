-- Seed data for tests. Tutti gli id sono prefissati con `seed-` cosi' non
-- collidono con gli UUID generati a runtime dal service.
--
-- Caricato all'inizio di ogni test (vedi @Sql con BEFORE_TEST_METHOD nei test).
-- Le tabelle vengono ricreate da schema.sql nello stesso script @Sql.

-- Categories: gerarchia minima ma rappresentativa (top-level + qualche sottocategoria)
INSERT INTO category (id, name, parent_id, color, icon) VALUES
    ('seed-cat-food',             'Food',        NULL,            '#E67E22', 'utensils'),
    ('seed-cat-transport',        'Transport',   NULL,            '#2980B9', 'car'),
    ('seed-cat-other',            'Other',       NULL,            '#7F8C8D', 'circle'),
    ('seed-cat-food-groceries',   'Groceries',   'seed-cat-food', NULL,      NULL),
    ('seed-cat-food-restaurants', 'Restaurants', 'seed-cat-food', NULL,      NULL);

-- Records: alcuni con categoria, uno senza, per coprire entrambi i casi nei test
INSERT INTO record_entry (id, description, record_date, amount, category_id, creation_timestamp, last_modification_timestamp) VALUES
    ('seed-1', 'seed groceries', DATE '2024-01-01', 25.0000, 'seed-cat-food-groceries', TIMESTAMP '2024-01-01 10:00:00', TIMESTAMP '2024-01-01 10:00:00'),
    ('seed-2', 'seed gas',       DATE '2024-01-02', 60.5000, 'seed-cat-transport',      TIMESTAMP '2024-01-02 10:00:00', TIMESTAMP '2024-01-02 10:00:00'),
    ('seed-3', 'seed dinner',    DATE '2024-01-03', 45.2000, NULL,                      TIMESTAMP '2024-01-03 10:00:00', TIMESTAMP '2024-01-03 10:00:00');
