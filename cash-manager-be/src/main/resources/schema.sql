CREATE TABLE users (
	id VARCHAR(63) NOT NULL,
	firstname VARCHAR(255) NOT NULL,
	lastname VARCHAR(255) NOT NULL,
	"enabled" SMALLINT NOT NULL DEFAULT 1,
	PRIMARY KEY (id)
);

CREATE TABLE record_entry (
	id VARCHAR(63) NOT NULL,
	"description" VARCHAR(255) NOT NULL,
	record_date DATE NOT NULL,
	"value" DECIMAL(6,2) NOT NULL,
	creation_timestamp TIMESTAMP NOT NULL,
	last_modification_timestamp TIMESTAMP NOT NULL,
	PRIMARY KEY (id)
);
