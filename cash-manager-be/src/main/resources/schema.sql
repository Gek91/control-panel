
CREATE TABLE `users` (
	`id` VARCHAR(63) NOT NULL,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `enabled` TINYINT(4) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `record_entry` (
	`id` VARCHAR(63) NOT NULL ,
	`description` VARCHAR(255) NOT NULL,
	`record_date` DATE NOT NULL,
	`value` DECIMAL(6,2) NOT NULL,
	`creation_timestamp` DATETIME NOT NULL,
	`last_modification_timestamp` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;


