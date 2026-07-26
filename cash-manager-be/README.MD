
### Compile application
```bash
mvn clean compile package
```

### Run application
```bash
mvn spring-boot:run
```

### Build Docker image
```bash
docker build -t cash-manager:0.0.1 .
```

### Run Docker container
```bash
docker run --rm -p 8080:8080 cash-manager:0.0.1
```

# Local Swagger
http://localhost:8080/swagger-ui/index.html