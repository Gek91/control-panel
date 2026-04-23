
### Compile application
```bash
mvn clean compile package
```

### Run application
```bash
mvn spring-boot:run
```

# Local Swagger
http://localhost:8080/swagger-ui/index.html

---

## Tests

The suite is split into two categories:

| Category | Files | Stack | DB | Docker required? |
|---|---|---|---|---|
| **Unit** (`*Test.java`) | `RecordsApplicationServiceImplTest` | `@DataJpaTest` slice | H2 in-memory (`MODE=PostgreSQL`) | No |
| **Integration** (`*IT.java`) | `RecordsApiIT`, `CashManagerApplicationTests` | `@SpringBootTest` + MockMvc | Real Postgres via Testcontainers | **Yes** |


### Run the full suite
```bash
mvn test
```
This also generates the JaCoCo report at `target/site/jacoco/index.html`.

### Run unit tests only (no Docker needed)
```bash
mvn test -Dtest='*Test'
```

### Run integration tests only (Docker required)
```bash
mvn test -Dtest='*IT'
```

### Run a single test
```bash
mvn test -Dtest=RecordsApplicationServiceImplTest
mvn test -Dtest=RecordsApiIT
mvn test -Dtest='RecordsApplicationServiceImplTest#findById*'
```

### Coverage report
```bash
mvn test
open target/site/jacoco/index.html
```

### Prerequisites for integration tests

A running Docker daemon is required. Any of the following works:
- Docker Desktop
- OrbStack
- Colima (`colima start`)
- Podman: in addition to starting it, export the following before the build:
  ```bash
  export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
  export TESTCONTAINERS_RYUK_DISABLED=true
  ```

To speed up subsequent local runs (Postgres container reused across builds), create
`~/.testcontainers.properties` with:
```
testcontainers.reuse.enable=true
```
