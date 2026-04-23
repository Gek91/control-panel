DROP TABLE IF EXISTS record_entry;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id          VARCHAR(63)  NOT NULL,
    firstname   VARCHAR(255) NOT NULL,
    lastname    VARCHAR(255) NOT NULL,
    enabled     SMALLINT     NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

CREATE TABLE category (
    id                          VARCHAR(63)  NOT NULL,
    name                        VARCHAR(100) NOT NULL,
    parent_id                   VARCHAR(63),
    color                       VARCHAR(7),
    icon                        VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES category(id)
);
CREATE UNIQUE INDEX uq_category_name_per_parent ON category (name, parent_id);


CREATE TABLE record_entry (
    id                          VARCHAR(63)    NOT NULL,
    description                 VARCHAR(255)   NOT NULL,
    record_date                 DATE           NOT NULL,
    amount                      DECIMAL(17, 4) NOT NULL,
    category_id                 VARCHAR(63),
    creation_timestamp          TIMESTAMP      NOT NULL,
    last_modification_timestamp TIMESTAMP      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_record_category FOREIGN KEY (category_id) REFERENCES category(id)
);
