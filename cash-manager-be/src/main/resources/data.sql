
INSERT INTO category (id, name, parent_id, color, icon) VALUES
    -- Top-level
    ('cat-food',          'Food',           NULL, '#E67E22', 'utensils'),
    ('cat-transport',     'Transport',      NULL, '#2980B9', 'car'),
    ('cat-housing',       'Housing',        NULL, '#8E44AD', 'home'),
    ('cat-entertainment', 'Entertainment',  NULL, '#16A085', 'film'),
    ('cat-health',        'Health',         NULL, '#C0392B', 'heart'),
    ('cat-shopping',      'Shopping',       NULL, '#D35400', 'shopping-bag'),
    ('cat-travel',        'Travel',         NULL, '#27AE60', 'plane'),
    ('cat-income',        'Income',         NULL, '#2ECC71', 'wallet'),
    ('cat-other',         'Other',          NULL, '#7F8C8D', 'circle'),

    -- Food
    ('cat-food-groceries',   'Groceries',   'cat-food',      NULL, NULL),
    ('cat-food-restaurants', 'Restaurants', 'cat-food',      NULL, NULL),
    ('cat-food-coffee',      'Coffee',      'cat-food',      NULL, NULL),

    -- Transport
    ('cat-transport-public', 'Public Transport', 'cat-transport', NULL, NULL),
    ('cat-transport-fuel',   'Fuel',             'cat-transport', NULL, NULL),
    ('cat-transport-taxi',   'Taxi',             'cat-transport', NULL, NULL),

    -- Housing
    ('cat-housing-rent',      'Rent',      'cat-housing', NULL, NULL),
    ('cat-housing-utilities', 'Utilities', 'cat-housing', NULL, NULL),

    -- Entertainment
    ('cat-entertainment-cinema',        'Cinema',        'cat-entertainment', NULL, NULL),
    ('cat-entertainment-subscriptions', 'Subscriptions', 'cat-entertainment', NULL, NULL),

    -- Income
    ('cat-income-salary', 'Salary', 'cat-income', NULL, NULL),
    ('cat-income-other',  'Other',  'cat-income', NULL, NULL);


-- =============================================================================
-- Sample records (dev only)
-- =============================================================================

INSERT INTO record_entry (id, description, record_date, amount, category_id, creation_timestamp, last_modification_timestamp) VALUES
    ('1', 'desc1', DATE '2023-01-01', 100.00, 'cat-food-groceries',   TIMESTAMP '2015-04-03 14:00:45', TIMESTAMP '2015-04-03 14:00:45'),
    ('2', 'desc2', DATE '2023-01-02', 110.00, 'cat-transport-fuel',   TIMESTAMP '2015-04-03 14:00:45', TIMESTAMP '2015-04-03 14:00:45'),
    ('3', 'desc3', DATE '2023-01-03', 120.00, 'cat-food-restaurants', TIMESTAMP '2015-04-03 14:00:45', TIMESTAMP '2015-04-03 14:00:45'),
    ('4', 'desc4', DATE '2023-01-04', 120.00, NULL,                   TIMESTAMP '2015-04-03 14:00:45', TIMESTAMP '2015-04-03 14:00:45'),
    ('5', 'desc5', DATE '2023-01-05', 100.00, 'cat-housing-rent',     TIMESTAMP '2015-04-03 14:00:45', TIMESTAMP '2015-04-03 14:00:45');
