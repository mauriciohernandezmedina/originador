# Research & Architecture Decisions: LLM Performance Analytics Platform

**Feature**: `001-llm-performance-analytics`  
**Date**: 2026-10-14  
**Status**: Completed  

---

## 1. Technical Stack & Runtime Environment

### Decision 1.1: Java 25 LTS & Spring Boot 3.4+
- **Decision**: Adopt OpenJDK 25 (Temurin / Eclipse 25 LTS) running Spring Boot 3.4+.
- **Rationale**: Complies with the mandatory technical constraint specified for the project. Java 25 provides modern language features (pattern matching, records, virtual threads enabled by default for high-concurrency I/O), offering superior performance for concurrent REST metric ingestion.
- **Alternatives Considered**:
  - *Java 21 LTS*: Stable, but user explicitly specified Java 25 LTS.
  - *Node.js / Express*: Lightweight, but lacks the type-safety, enterprise data persistence ecosystem, and requested Spring Boot foundation.

### Decision 1.2: Embedded React Frontend (Single-Artifact Deployment)
- **Decision**: Build the React application via Vite/TypeScript and package the compiled assets (`dist/`) directly into Spring Boot's static resource directory (`src/main/resources/static/`).
- **Rationale**:
  - Provides a single, self-contained deployment unit (`.jar` or single Docker container).
  - Eliminates Cross-Origin Resource Sharing (CORS) issues in production, as the frontend and REST API share the exact same host and port (`http://localhost:8080`).
  - Simplifies Docker Compose orchestration (only 2 services: `app` and `postgres`).
- **SPA Routing Handling**:
  - Implement a Spring Web `ViewController` or regex forwarding mechanism (`@Controller` mapping all non-API paths matching `/{path:[^\\.]*}` to `forward:/index.html`) to support client-side HTML5 History API routing without 404 errors on browser refresh.
- **Alternatives Considered**:
  - *Separate Nginx container for frontend*: Adds unnecessary operational complexity and network hops for an internal evaluation platform.

### Decision 1.3: PostgreSQL 16+ via Docker Compose
- **Decision**: Use official PostgreSQL 16 Alpine container with a dedicated persistent volume (`postgres_data`).
- **Rationale**: Robust relational storage capable of indexing JSON payloads (for tool call arguments), calculating percentile statistics (`percentile_cont`), and handling tens of thousands of metric records with sub-millisecond query execution.
- **Alternatives Considered**:
  - *H2 / SQLite*: Fast to start, but lacks production parity, advanced analytical SQL functions, and concurrent write resilience.

---

## 2. Standardized Environment Variables & Configuration

### Decision 2.1: Environment Variable Convention
To prevent integration errors between Docker Compose, Spring Boot, and local runtime, the following unified convention is established:

| Variable | Default Value | Description |
|---|---|---|
| `SERVER_PORT` | `8080` | Puerto HTTP expuesto por la aplicación Spring Boot |
| `POSTGRES_DB` | `llm_analytics` | Nombre de la base de datos PostgreSQL |
| `POSTGRES_USER` | `originador_user` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | `originador_secret` | Contraseña de PostgreSQL |
| `POSTGRES_PORT` | `5432` | Puerto expuesto por el contenedor PostgreSQL |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/llm_analytics` | URL JDBC de conexión a la base de datos |
| `SPRING_DATASOURCE_USERNAME` | `${POSTGRES_USER}` | Usuario JDBC mapped al contenedor |
| `SPRING_DATASOURCE_PASSWORD` | `${POSTGRES_PASSWORD}` | Contraseña JDBC mapped al contenedor |
| `APP_API_KEY` | `originador-llm-secret-key-2026` | Clave estática para validar encabezado `X-API-Key` |
| `SPRING_PROFILES_ACTIVE` | `docker` | Perfil activo de Spring (`docker` o `local`) |

- **Docker Compose Networking**:
  - Database service name: `postgres`.
  - App service depends on `postgres` with healthcheck (`pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`).

---

## 3. Frontend API Client Architecture & Integration

### Decision 3.1: Centralized Axios / Fetch HTTP Client with Resilience
- **Decision**: Configure a dedicated API Client module (`src/services/apiClient.ts`) in the React frontend with explicit timeout and error interceptors.
- **Configuration Details**:
  - **Base URL**: `/api/v1` (relativo en producción embebida; configurable con `VITE_API_BASE_URL` en desarrollo local con proxy Vite).
  - **Connection Timeout**: `8000ms` (8 segundos). Aborta peticiones colgadas y notifica al usuario con un estado de timeout claro.
  - **Authentication Interceptor**: Inyecta automáticamente el encabezado `X-API-Key` en cada petición saliente leyendo desde la configuración o `localStorage`.
  - **Error Interceptor**:
    - `401 Unauthorized`: Emite evento global de error de autenticación con banner instructivo para reconfigurar la API Key.
    - `400 Bad Request`: Parsea errores de validación estructurados del backend (`fieldErrors`).
    - `500 Internal Error`: Notificación accesible de fallo sin crash de interfaz.
    - `Network Error / Timeout`: Activa estado de reintento automático y degradación visual.

### Decision 3.2: Data Visualization Library
- **Decision**: Chart.js con `react-chartjs-2` o `Recharts`.
- **Rationale**: Soporta gráficos de líneas temporales de latencia, barras apiladas para tokens (input vs output), gráficos de dispersión para detección de outliers y barras horizontales para distribución de herramientas con rendimiento de 60 fps en navegadores modernos.

---

## 4. Ingestion & Storage Performance

### Decision 4.1: Batch & Single Ingestion Throughput
- **Single Ingestion**: Ingesta síncrona transaccional con tiempo de respuesta < 50ms.
- **Batch Ingestion**: Endpoint `/api/v1/traces/batch` que procesa hasta 500 registros por llamada utilizando `saveAll` con batching JDBC de Hibernate (`spring.jpa.properties.hibernate.jdbc.batch_size=50`).
- **Database Indexing**:
  - B-tree en `iteration_id` para filtrado y agrupamiento instantáneo.
  - B-tree en `created_at` para ordenamiento cronológico y filtros temporales.
  - B-tree en `latency_ms` para consultas de percentiles y outliers.
  - Índice compuesto `(iteration_id, created_at DESC)`.

---

## 5. Sample Data Strategy

### Decision 5.1: Idempotent Built-in Sample Dataset
- **Decision**: Implementar un `SampleDataService` en el backend que pueda sembrar datos automáticamente al arranque si la base de datos está vacía, o bajo demanda mediante el endpoint `POST /api/v1/sample-data/seed` y `DELETE /api/v1/sample-data/reset`.
- **Dataset Contents**:
  - Al menos 3 iteraciones distintas:
    1. `v1-prompt-baseline`: Respuestas estándar con modelos GPT-4o / Claude 3.5 Sonnet, latencias moderadas, sin herramientas.
    2. `v2-prompt-optimized`: Prompts refinados con menor consumo de tokens y mayor throughput (tokens/segundo).
    3. `v3-agentic-tools`: Agentes complejos con múltiples llamadas a herramientas (`web_search`, `calculator`, `database_query`), incluyendo casos con latencia alta y un fallo simulado.
  - Más de 30 trazas representativas con variedad de tokens y marcas temporales realistas.
