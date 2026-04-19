package core

import "errors"

// Errori condivisi dai repository (stesso significato per feed e news).
var (
	ErrNotFound      = errors.New("not found")
	ErrAlreadyExists = errors.New("already exists")
)
