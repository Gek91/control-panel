// Package testutil offers helpers shared across the test suite.
//
// The goal is to exercise the real Handler → SQLRepository → SQLite chain
// in-memory, without fakes: every test gets an isolated database with the
// production schema applied and the same deterministic fixture loaded from
// `resources/test_data.sql`.
package testutil

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sync/atomic"
	"testing"

	_ "modernc.org/sqlite"

	"news-collector-be/internal/db"
)

// dbSeq guarantees a unique name for each in-memory SQLite DB so that
// parallel tests never share state through cache=shared.
var dbSeq atomic.Int64

// testStore is a db.Store tailored for tests: it wraps the *sql.DB opened
// against the in-memory database.
type testStore struct {
	db *sql.DB
}

func (s *testStore) DB() *sql.DB  { return s.db }
func (s *testStore) Close() error { return s.db.Close() }

// NewStore opens an isolated in-memory SQLite store and loads schema +
// fixture into it. The store is closed automatically when the test ends.
//
// Usage:
//
//	store := testutil.NewStore(t)
//	repo  := news.NewSQLRepository(store)
func NewStore(t *testing.T) db.Store {
	t.Helper()

	dsn := fmt.Sprintf(
		"file:testdb-%d-%d?mode=memory&cache=shared&_pragma=foreign_keys(on)",
		os.Getpid(), dbSeq.Add(1),
	)

	sqlDB, err := sql.Open("sqlite", dsn)
	if err != nil {
		t.Fatalf("sqlite open: %v", err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })

	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("sqlite ping: %v", err)
	}

	applySQLFile(t, sqlDB, "schema.sql")
	applySQLFile(t, sqlDB, "test_data.sql")

	return &testStore{db: sqlDB}
}

// applySQLFile executes a .sql file located under <projectRoot>/resources/.
func applySQLFile(t *testing.T, sqlDB *sql.DB, name string) {
	t.Helper()

	path := filepath.Join(projectRoot(), "resources", name)
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	if _, err := sqlDB.Exec(string(raw)); err != nil {
		t.Fatalf("exec %s: %v", path, err)
	}
}

// projectRoot walks up three levels from this file
// (internal/testutil/db.go → project root) so tests do not depend on the
// working directory `go test` is invoked from.
func projectRoot() string {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		panic("testutil: cannot resolve caller")
	}
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", ".."))
}
