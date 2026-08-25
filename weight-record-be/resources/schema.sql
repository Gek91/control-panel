CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(10) NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS records (
    id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    exercise_id VARCHAR(10) NOT NULL,
    weight REAL NOT NULL,
    percentage INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (exercise_id) REFERENCES exercises (id)
);
