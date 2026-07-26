package db

import "database/sql"

// Store incapsula il pool database/sql usato dai repository.
// Implementazioni diverse (file locale, :memory:, stesso engine con path diverso)
// si limitano a come si apre la connessione; le query restano identiche.
type Store interface {
	DB() *sql.DB
	Close() error
}
