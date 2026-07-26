# ---- build ----
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests package

# ---- runtime ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1000 -S app && adduser -u 1000 -S app -G app

COPY --from=build --chown=app:app /build/target/cash-manager-*.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
