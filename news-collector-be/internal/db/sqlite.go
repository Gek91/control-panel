package db

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"os"

	_ "modernc.org/sqlite"
)


type SQLiteOptions struct {
	SchemaPath string
	SeedPath   string
	DSN        string
}

type sqliteStore struct {
	db *sql.DB
}

func (s *sqliteStore) DB() *sql.DB { return s.db }

func (s *sqliteStore) Close() error {
	if s.db == nil {
		return nil
	}
	return s.db.Close()
}

var localData = SQLiteOptions{
	SchemaPath: "resources/schema.sql",
	SeedPath:   "resources/local_data.sql",
	DSN:        "file:memdb1?mode=memory&cache=shared&_pragma=foreign_keys(on)",
}

func OpenSQLite() (Store, error) {

	db, err := sql.Open("sqlite", localData.DSN)
	if err != nil {
		return nil, fmt.Errorf("sqlite open: %w", err)
	}
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("sqlite ping: %w", err)
	}

	ready, err := isSQLiteInitialized(db)
	if err != nil {
		_ = db.Close()
		return nil, err
	}

	if ready {
		slog.Info("sqlite ready", "initialized", true)
		return &sqliteStore{db: db}, nil
	}

	if localData.SchemaPath == "" {
		_ = db.Close()
		return nil, errors.New("sqlite: database empty and SchemaPath not set")
	}
	if err := applySQLFile(db, localData.SchemaPath); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("apply schema: %w", err)
	}
	slog.Info("schema applied", "path", localData.SchemaPath)

	if localData.SeedPath != "" {
		if err := applySQLFile(db, localData.SeedPath); err != nil {
			_ = db.Close()
			return nil, fmt.Errorf("apply seed: %w", err)
		}
		slog.Info("seed applied", "path", localData.SeedPath)
	}

	slog.Info("sqlite ready", "initialized", false)
	return &sqliteStore{db: db}, nil
}

func isSQLiteInitialized(db *sql.DB) (bool, error) {
	var name string
	err := db.QueryRow(
		`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'news'`,
	).Scan(&name)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return false, err
}

func applySQLFile(db *sql.DB, path string) error {
	content, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %s: %w", path, err)
	}
	if _, err := db.Exec(string(content)); err != nil {
		return fmt.Errorf("exec %s: %w", path, err)
	}
	return nil
}
