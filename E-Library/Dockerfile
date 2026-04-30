# --- Stage 1: Build Frontend ---
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
# Copy pom.xml and download dependencies (for caching)
COPY backend/pom.xml ./backend/
RUN mvn -f backend/pom.xml dependency:go-offline

# Copy source and built frontend
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/build ./backend/src/main/resources/static

# Build the JAR
RUN mvn -f backend/pom.xml clean package -DskipTests

# --- Stage 3: Project Runtime ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /app/data && chmod 777 /app/data

# Copy built JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Copy PDF files (optional, if you want them pre-packaged)
COPY pdf/ /app/pdf/

# Expose Hugging Face Port
EXPOSE 7860

# Run with Hugging Face profile
ENTRYPOINT ["java", "-Dspring.profiles.active=huggingface", "-jar", "app.jar"]
