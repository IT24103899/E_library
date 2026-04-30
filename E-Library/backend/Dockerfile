# ============================================
# Dockerfile for Hugging Face Spaces deployment
# Spring Boot backend + SQLite (embedded DB)
# Port 7860 is required by Hugging Face Spaces
# ============================================

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q && \
    cp $(ls target/*.jar | grep -v plain | head -1) target/app.jar

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Create data directory for SQLite database
RUN mkdir -p /app/data
COPY --from=build /app/target/app.jar app.jar
EXPOSE 7860
ENTRYPOINT ["java", "-Dspring.profiles.active=huggingface", "-jar", "app.jar"]
