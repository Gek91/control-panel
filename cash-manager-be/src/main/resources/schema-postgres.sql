-- Postgres-only DDL additions. Loaded:
--   - by integration tests via @Sql({"/schema.sql", "/schema-postgres.sql", "/data.sql"})
--   - in production by setting spring.sql.init.platform=postgres in application-prod.properties
--     (Spring Boot then loads schema-${platform}.sql automatically alongside schema.sql)
--
-- Keep this file minimal: only constructs that H2 cannot parse, and that we still want
-- to enforce on the real database.

-- Top-level category names must be unique. Implemented as a partial unique index
-- because Postgres treats NULL parent_id values as distinct in the composite index.
CREATE UNIQUE INDEX uq_category_name_top_level ON category (name) WHERE parent_id IS NULL;
