# LLM Performance Analytics Platform (Originador)

[![Java](https://img.shields.io/badge/Java-25%20LTS-orange.svg)](https://openjdk.org/projects/jdk/25/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED.svg)](https://docs.docker.com/compose/)

Plataforma integral de observabilidad, telemetría y análisis de rendimiento para interacciones con Modelos de Lenguaje Grande (LLMs). Permite registrar métricas pasivas de inferencia (latencia, tokens de entrada/salida, llamadas a herramientas/Function Calling, timestamps y errores), comparar versiones de prompts/modelos lado a lado con cálculo automático de deltas, y realizar auditoría profunda con visor de cascada (*execution waterfall*).

---

## 🌟 Características Principales

- **📊 Tablero de Control en Tiempo Real**:
  - Indicadores clave (KPIs): Latencia Media, Percentiles (p50, p90, p95), Consumo Total de Tokens, Rendimiento de Generación (tokens/segundo) y Tasa de Error.
  - Gráficos interactivos: Línea temporal de latencia, distribución de tokens (input vs output) y desglose de uso de herramientas externas.
  - Filtros temporales dinámicos (`1h`, `24h`, `7d`, `30d`, `all`).

- **⚡ Comparación y Gestión de Iteraciones**:
  - Agrupación automática de trazas por tag (`iteration_id`).
  - Cálculo de deltas porcentuales frente a una iteración base: variación de latencia (%), ahorro de tokens (%), aceleración de throughput (*speedup %*) y diferencial de tasa de error.
  - Edición de metadatos (nombres descriptivos e hipótesis de experimentación).

- **🔍 Explorador de Trazas e Invocación de Herramientas**:
  - Búsqueda y filtrado multicriterio (iteración, modelo, estado, rangos de latencia) con paginación.
  - Visor detallado con **línea de tiempo en cascada (*waterfall*)**: separa visualmente el tiempo de inferencia del LLM respecto al tiempo consumido por cada invocación a herramientas.
  - Inspección del texto íntegro del prompt, respuesta generada, argumentos de entrada y resultados de herramientas.

- **📥 Exportación de Datos**:
  - Descarga de conjuntos de trazas en formatos **CSV** y **JSON** formateado con un solo clic para análisis externo.

- **🌱 Modo Demostración Integrado (1-Click)**:
  - Generador preconfigurado de 3 iteraciones realistas (`v1-prompt-baseline`, `v2-prompt-optimized`, `v3-agentic-tools`) y más de 30 trazas interactivas con Function Calling y simulación de fallos.
  - Función de restablecimiento (*reset*) transaccional de la base de datos.

- **🔒 Seguridad y Robustez**:
  - Autenticación estática mediante encabezado `X-API-Key` (retornando `401 Unauthorized` si falta o no es válida).
  - Manejo de CORS con preflight `OPTIONS` y cabeceras de protección (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
  - Ingesta idempotente basada en `(iteration_id, client_trace_id)` para prevenir duplicados.

---

## 🏗️ Arquitectura y Tecnologías

El sistema está empaquetado como un único artefacto ejecutable desplegable:

```
┌────────────────────────────────────────────────────────┐
│               Navegador Web / Clientes REST            │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (Port 8080)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Docker Container (app)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Spring Boot 3.4 (Java 25 LTS)            │  │
│  │                                                  │  │
│  │  ┌──────────────┐             ┌───────────────┐  │  │
│  │  │  REST API    │             │ Static Assets │  │  │
│  │  │  Controllers │             │ (React + Vite)│  │  │
│  │  └──────┬───────┘             └───────────────┘  │  │
│  │         │                                        │  │
│  │         ▼ JPA / Hibernate                        │  │
│  └─────────┼────────────────────────────────────────┘  │
└────────────┼───────────────────────────────────────────┘
             │ Port 5432
             ▼
┌────────────────────────────────────────────────────────┐
│             Docker Container (postgres:16)             │
│                      llm_analytics                     │
└────────────────────────────────────────────────────────┘
```

- **Backend**: Java 25 LTS, Spring Boot 3.4+, Spring Data JPA, Hibernate, Maven.
- **Frontend**: React 18, TypeScript, Vite, CSS moderno responsivo y accesible (WCAG 2.1 AA compliant).
- **Base de Datos**: PostgreSQL 16+ con Docker Volume persistente.
- **Contenedores**: Multi-stage `Dockerfile` (`node:20-alpine` → `eclipse-temurin:25-jdk` → `eclipse-temurin:25-jre`).

---

## 🚀 Inicio Rápido con Docker Compose

### 1. Prerrequisitos
- Tener instalado **Docker** y **Docker Compose v2** (`docker compose version`).

### 2. Configurar Variables de Entorno (Opcional)
Se incluye un archivo `.env.example`. Puede crear una copia local `.env` o utilizar los valores predeterminados:

```bash
# Variables estándar en .env:
SERVER_PORT=8080
POSTGRES_DB=llm_analytics
POSTGRES_USER=originador_user
POSTGRES_PASSWORD=originador_secret
POSTGRES_PORT=5432
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/llm_analytics
APP_API_KEY=originador-llm-secret-key-2026
SPRING_PROFILES_ACTIVE=docker
```

### 3. Iniciar la Plataforma
Ejecute en la raíz del proyecto:

```bash
docker compose up -d --build
```

El servicio `postgres` iniciará primero verificando su salud mediante `pg_isready`; una vez listo, se compilará y ejecutará el contenedor `app`.

### 4. Acceso Web
Abra su navegador en:
👉 **[http://localhost:8080](http://localhost:8080)**

> [!TIP]
> Al entrar por primera vez, haga clic en el botón superior **`🌱 Cargar Datos Demo`** para poblar instantáneamente las 3 iteraciones y visualizar métricas reales.

---

## 📡 Referencia de la API REST

Todas las peticiones a la API requieren el encabezado:
`X-API-Key: originador-llm-secret-key-2026`

### 1. Ingesta de Trazas

#### Ingesta Individual
```bash
POST /api/v1/traces
Content-Type: application/json
X-API-Key: originador-llm-secret-key-2026

{
  "clientTraceId": "trace-uuid-001",
  "iterationId": "v2-prompt-optimized",
  "modelName": "gpt-4o",
  "promptText": "¿Cuál es la capital de Francia?",
  "responseText": "La capital de Francia es París.",
  "inputTokens": 25,
  "outputTokens": 40,
  "startedAt": "2026-10-14T10:00:00.000Z",
  "endedAt": "2026-10-14T10:00:01.200Z",
  "status": "SUCCESS",
  "tools": [
    {
      "toolName": "web_search",
      "inputArguments": "{\"q\": \"capital france\"}",
      "outputResult": "{\"result\": \"Paris\"}",
      "startedAt": "2026-10-14T10:00:00.200Z",
      "endedAt": "2026-10-14T10:00:00.520Z",
      "status": "SUCCESS"
    }
  ]
}
```
*Respuesta:* `201 Created` con el ID de la traza, latencia calculada (`1200ms`) y tokens/segundo (`33.33 tok/s`).

#### Ingesta Masiva (*Batch*)
```bash
POST /api/v1/traces/batch
Content-Type: application/json
X-API-Key: originador-llm-secret-key-2026

[
  { /* Trace 1 */ },
  { /* Trace 2 */ }
]
```

### 2. Consulta y Detalle de Trazas
- `GET /api/v1/traces?iterationId=...&modelName=...&status=...&page=0&size=20`: Consulta paginada con filtros.
- `GET /api/v1/traces/{id}`: Detalle completo de interacción con texto íntegro y herramientas.

### 3. Iteraciones y Comparativa de Deltas
- `GET /api/v1/iterations`: Listado de iteraciones con métricas agregadas.
- `GET /api/v1/iterations/{id}`: Estadísticas específicas de una iteración.
- `PUT /api/v1/iterations/{id}`: Actualización de nombre descriptivo e hipótesis.
- `GET /api/v1/iterations/compare?baseId={baseId}&targetId={targetId}`: Comparación frente a frente con deltas porcentuales.

### 4. Tablero de Métricas y KPIs
- `GET /api/v1/metrics/summary?timeRange=all`: Resumen global (`latencyMetrics`, `tokenMetrics`, `toolUsage`, tasa de error).

### 5. Modo Demo
- `POST /api/v1/sample-data/seed`: Genera las 3 iteraciones de muestra y 33 trazas con herramientas.
- `DELETE /api/v1/sample-data/reset`: Limpia todas las tablas de telemetría.

---

## 📁 Estructura del Proyecto

```text
Originador/
├── backend/                               # Proyecto Spring Boot (Java 25)
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/originador/analytics/
│       │   │   ├── config/                # Filtro API Key, CORS, SPA forwarding, Errores
│       │   │   ├── controller/            # Controladores REST (/traces, /iterations, /metrics, /sample-data)
│       │   │   ├── dto/                   # DTOs de petición y respuesta tipados
│       │   │   ├── model/                 # Entidades JPA (IterationRun, InteractionTrace, ToolInvocation)
│       │   │   ├── repository/            # Repositorios Spring Data JPA con agregaciones y Specs
│       │   │   └── service/               # Servicios de negocio, cálculo de percentiles y deltas
│       │   └── resources/
│       │       ├── application.yml        # Configuración por defecto
│       │       └── application-docker.yml # Perfil Docker
│       └── test/                          # Pruebas unitarias y de integración
├── frontend/                              # SPA React + TypeScript (Vite)
│   ├── package.json
│   ├── vite.config.ts                     # Compilación dirigida a backend static resources
│   └── src/
│       ├── components/
│       │   ├── charts/                    # Gráficos (Latencia, Tokens, Herramientas)
│       │   ├── common/                    # KpiCard, LoadingSkeleton
│       │   ├── iterations/                # Selector de iteraciones, modal de metadatos, deltas
│       │   ├── layout/                    # Header con banner demo, navegación de pestañas
│       │   └── traces/                    # Tabla paginada, visor waterfall, botón de exportación
│       ├── pages/                         # DashboardPage, IterationsPage, TracesPage
│       ├── services/                      # Clientes API tipados (apiClient, traceService, etc.)
│       └── utils/                         # Utilidades de exportación CSV/JSON
├── specs/                                 # Especificación de requerimientos, modelo y contratos OpenAPI
├── docker-compose.yml                     # Orquestación de PostgreSQL y App
├── Dockerfile                             # Multi-stage Docker build (Node 20 + Java 25)
├── .env.example                           # Plantilla de variables de entorno
└── pom.xml                                # Maven Parent POM
```

---

## 🛠️ Detención y Mantenimiento

Para detener los contenedores preservando los datos:
```bash
docker compose down
```

Para reiniciar la base de datos limpiando los volúmenes persistentes:
```bash
docker compose down -v
```

---

## 📄 Licencia

Este proyecto se distribuye bajo los términos de la licencia MIT.