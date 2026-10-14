# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Spring Boot Backend with Java 25
# ==========================================
FROM eclipse-temurin:25-jdk AS backend-builder
WORKDIR /app

ENV MAVEN_OPTS="--add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.model=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.processing=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED --add-opens=jdk.compiler/com.sun.tools.javac.jvm=ALL-UNNAMED"

# Install Maven in JDK 25 container
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

COPY pom.xml ./
COPY backend/pom.xml backend/pom.xml

# Pre-fetch Maven dependencies
RUN mvn -B -f pom.xml dependency:go-offline || true

# Copy backend source code
COPY backend/src backend/src

# Copy compiled frontend from Stage 1 into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist backend/src/main/resources/static

# Build final executable jar
RUN mvn -B -f backend/pom.xml clean package -DskipTests

# ==========================================
# Stage 3: Lightweight Runtime Image (Java 25)
# ==========================================
FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app

# Non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=backend-builder --chown=spring:spring /app/backend/target/*.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
