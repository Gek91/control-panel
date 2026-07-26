### Install Dependencies with UV
```bash
uv sync
```

### Install Dependencies with UV
```bash
uv run run.py
```

### Running Tests

The test suite lives under `tests/` and is split into:

- `tests/unit/` — service-level tests that exercise repository + service together against an in-memory SQLite database.
- `tests/integration/` — API tests built on top of FastAPI's `TestClient`, also backed by an in-memory SQLite database.

Both layers seed the database from the `resources/test_data.sql` dump through the shared `seed_data` pytest fixture, mirroring how `resources/local_data.sql` is used by the local environment.

Run the full suite:
```bash
uv run pytest
```

Run only unit or integration tests:
```bash
uv run pytest tests/unit
uv run pytest tests/integration
```

Run a single test file or test case:
```bash
uv run pytest tests/unit/test_exercises.py
uv run pytest tests/unit/test_exercises.py::TestExercisesService::test_list_exercises_returns_seeded_exercises
```

### Swagger local url
http://localhost:8080/docs