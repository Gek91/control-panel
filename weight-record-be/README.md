Common tasks are also available via [Just](https://github.com/casey/just) — see `Justfile` (`just --list`).

### Install Dependencies with UV
```bash
uv sync
```

### Run the application
```bash
uv run run.py
```

### Build Docker image
```bash
docker build -t weight-record-api:0.0.1 .
```

### Run Docker container
```bash
docker run --rm -p 8080:8080 weight-record-api:0.0.1
```

### Running Tests

The test suite lives under `test/` and is split into:

- `test/unit/` — service-level tests that exercise repository + service together against an in-memory SQLite database.
- `test/integration/` — API tests built on top of FastAPI's `TestClient`, also backed by an in-memory SQLite database.

Both layers seed the database from the `resources/test_data.sql` dump through the shared `seed_data` pytest fixture, mirroring how `resources/local_data.sql` is used by the local environment.

Run the full suite:
```bash
uv run pytest
```

Run only unit or integration tests:
```bash
uv run pytest test/unit
uv run pytest test/integration
```

Run a single test file or test case:
```bash
uv run pytest test/unit/test_exercises.py
uv run pytest test/unit/test_exercises.py::TestExercisesService::test_list_exercises_returns_seeded_exercises
```

### Swagger local url
http://localhost:8080/docs