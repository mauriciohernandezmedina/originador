# Implementation Plan: LLM Performance Analytics Platform

**Branch**: `001-llm-performance-analytics` | **Date**: 2026-10-14 | **Spec**: [spec.md](file:///c:/Users/mhernandez/Proyectos/Originador/specs/001-llm-performance-analytics/spec.md)

**Input**: Feature specification from `/specs/001-llm-performance-analytics/spec.md` with explicit technical choices: Spring Boot with embedded React frontend, PostgreSQL 16+, Docker Compose, Java 25 LTS, standardized environment variables, and resilient API client configuration.

---

## Summary

La plataforma proporciona una solución integral para capturar, almacenar y analizar visualmente el rendimiento de interacciones y chats de modelos de lenguaje (LLM). Utiliza una arquitectura web moderna compuesta por un backend en Spring Boot (Java 25 LTS) que embebe un frontend en React (Vite/TypeScript) empaquetado como un único artefacto ejecutable, respaldado por PostgreSQL y orquestado mediante Docker Compose. Expone una API REST para ingesta pasiva de telemetría (individual y por lotes), persistencia relacional con cálculo de percentiles y velocidad de tokens, y un tablero interactivo para análisis temporal, comparación de iteraciones y desglose de herramientas en cascada.

---

## Technical Context

**Language/Version**: Java 25 LTS (OpenJDK Temurin) para backend; TypeScript 5.x y JavaScript (ES2022) para frontend.

**Primary Dependencies**:
- *Backend*: Spring Boot 3.4+, Spring Data JPA, Hibernate, PostgreSQL JDBC Driver, Jakarta Validation, Spring Boot Actuator, Lombok.
- *Frontend*: React 18/19, TypeScript, Vite, React Router 6, Chart.js / `react-chartjs-2` (o Recharts), Axios.

**Storage**: PostgreSQL 16+ en contenedor Docker con volumen persistente `postgres_data` e índices especializados para consultas analíticas rápidas.

**Testing**:
- *Backend*: JUnit 5, Mockito, AssertJ, Spring Boot Test (`@WebMvcTest`, `@DataJpaTest`).
- *Frontend*: Vitest, React Testing Library.
- *E2E / Integración*: Scripts automatizados y pruebas de contrato basadas en OpenAPI.

**Target Platform**: Contenedor Linux multiplataforma orquestado con Docker Compose en puerto `8080`.

**Project Type**: Web Application monorepo (Spring Boot con frontend React embebido en `src/main/resources/static/`).

**Performance Goals**:
- Ingesta REST individual < 50ms; ingesta por lotes (500 trazas) < 500ms.
- Consultas de resumen y percentiles p95 < 200ms.
- Carga de la aplicación web completa < 2 segundos con hasta 10,000 trazas almacenadas.

**Constraints**:
- Java 25 LTS obligatorio.
- Despliegue en un único puerto (`http://localhost:8080`) sin dependencias de proxies web externos en producción.
- Autenticación obligatoria en la API mediante encabezado `X-API-Key` con respuesta HTTP 401.
- Timeouts de conexión explícitos en el cliente HTTP del frontend (8000ms).
- Convención estandarizada de variables de entorno para Docker Compose y Spring Boot.

**Scale/Scope**: Soporte para más de 10,000 trazas históricas por instancia local, visualización en tiempo real de hasta 4 iteraciones comparativas y manejo de payloads con miles de tokens.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio Constitucional | Estado | Justificación de Cumplimiento |
|---|---|---|
| **I. Calidad de Código y Mantenibilidad** | **PASS** | Arquitectura en capas limpia (`Controller` → `Service` → `Repository` → `Entity/DTO`), tipado estricto en Java 25 y TypeScript, manejo centralizado de excepciones con `@RestControllerAdvice` y DTOs estructurados. |
| **II. Estándares de Prueba Rigurosos** | **PASS** | Estrategia de pruebas unitarias para cálculos métricos (latencias, throughput, percentiles), pruebas de integración para endpoints de ingesta y repositorios JPA, y escenarios E2E definidos en `quickstart.md`. |
| **III. Consistencia de UX y Accesibilidad** | **PASS** | Sistema de diseño coherente con los cinco estados obligatorios (reposo, hover/foco, carga con skeletons, estado vacío y banners de error recuperable), soporte de teclado y contraste accesible (WCAG 2.1 AA). |
| **IV. Rendimiento y Resiliencia** | **PASS** | Índices B-tree en `iteration_id`, `created_at` y `latency_ms`; latencias de API p95 < 200ms; timeout de 8s en cliente web con reintentos y degradación elegante. |
| **V. Simplicidad Arquitectónica** | **PASS** | Frontend embebido en Spring Boot; despliegue en un solo artefacto; orquestación mínima de 2 servicios en Docker Compose (`app` + `postgres`); sin dependencias de microservicios prematuros. |

*Resultado*: **TODOS LOS GATES APROBADOS SIN VIOLACIONES.**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-llm-performance-analytics/
├── plan.md              # Plan de implementación arquitectónico
├── research.md          # Decisiones tecnológicas (Java 25, Spring Boot, React, Docker)
├── data-model.md        # Esquema relacional, ERD, DDL e índices PostgreSQL
├── quickstart.md        # Guía de inicialización, ejecución y validación E2E
├── contracts/
│   └── openapi.yaml     # Contrato formal de la API REST v1.0.0
└── checklists/
    └── requirements.md  # Verificación de calidad de requisitos (16/16)
```

### Source Code (repository root)

```text
.
├── docker-compose.yml                  # Orquestación de app (Spring Boot) + postgres
├── .env.example                        # Plantilla de variables de entorno estandarizadas
├── Dockerfile                          # Multi-stage build (Node Vite build -> Maven Java 25 runtime)
├── pom.xml                             # Configuración Maven padre para Spring Boot y plugins
├── backend/                            # Módulo Spring Boot (Java 25 LTS)
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/originador/analytics/
│       │   │   ├── AnalyticsApplication.java
│       │   │   ├── config/
│       │   │   │   ├── ApiKeyAuthFilter.java       # Validación de encabezado X-API-Key
│       │   │   │   ├── WebMvcConfig.java           # Configuración CORS y formateadores
│       │   │   │   └── SpaForwardingController.java# Redirección de rutas React a index.html
│       │   │   ├── controller/
│       │   │   │   ├── TraceController.java        # Ingesta individual y batch, listados
│       │   │   │   ├── IterationController.java    # Gestión y comparación de iteraciones
│       │   │   │   ├── MetricsController.java      # Resúmenes globales y KPIs
│       │   │   │   └── SampleDataController.java   # Seed y reset de datos de prueba
│       │   │   ├── service/
│       │   │   │   ├── TraceIngestionService.java  # Lógica de validación y persistencia
│       │   │   │   ├── MetricsCalculationService.java # Cálculo de percentiles y deltas
│       │   │   │   ├── IterationService.java       # Agrupación dinámica por tags
│       │   │   │   └── SampleDataService.java      # Generador de escenarios de prueba
│       │   │   ├── repository/
│       │   │   │   ├── InteractionTraceRepository.java
│       │   │   │   ├── IterationRunRepository.java
│       │   │   │   └── ToolInvocationRepository.java
│       │   │   ├── model/
│       │   │   │   ├── InteractionTrace.java       # Entidad JPA
│       │   │   │   ├── IterationRun.java           # Entidad JPA
│       │   │   │   └── ToolInvocation.java         # Entidad JPA
│       │   │   └── dto/
│       │   │       ├── TraceIngestRequest.java
│       │   │       ├── TraceResponse.java
│       │   │       ├── PerformanceSummaryDto.java
│       │   │       ├── IterationComparisonDto.java
│       │   │       └── ErrorResponse.java
│       │   └── resources/
│       │       ├── application.yml             # Configuración base
│       │       ├── application-docker.yml      # Configuración de perfil Docker
│       │       └── static/                     # Directorio destino de la compilación React
│       └── test/
│           └── java/com/originador/analytics/
│               ├── service/MetricsCalculationServiceTest.java
│               ├── controller/TraceControllerTest.java
│               └── integration/TraceIngestionIntegrationTest.java
├── frontend/                           # Aplicación React + Vite + TypeScript
│   ├── package.json
│   ├── vite.config.ts                  # Configuración con proxy local '/api' -> 8080
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── services/
│       │   └── apiClient.ts            # Cliente Axios con timeout (8s), X-API-Key y handlers
│       ├── types/
│       │   └── api.ts                  # Tipos TypeScript sincronizados con openapi.yaml
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   └── Navigation.tsx
│       │   ├── common/
│       │   │   ├── KpiCard.tsx
│       │   │   ├── LoadingSkeleton.tsx
│       │   │   └── ErrorBanner.tsx
│       │   ├── charts/
│       │   │   ├── LatencyTimelineChart.tsx
│       │   │   ├── TokenDistributionChart.tsx
│       │   │   └── ToolBreakdownChart.tsx
│       │   ├── traces/
│       │   │   ├── TraceTable.tsx
│       │   │   └── TraceDetailModal.tsx    # Waterfall timeline
│       │   └── iterations/
│       │       ├── IterationSelector.tsx
│       │       └── IterationComparisonView.tsx
│       └── pages/
│           ├── DashboardPage.tsx
│           ├── IterationsPage.tsx
│           └── TracesPage.tsx
```

**Structure Decision**: Monorepo desacoplado en dos capas (`backend/` y `frontend/`) unificadas por el empaquetado estático de Spring Boot y el `Dockerfile` multi-stage. Esto permite desarrollo independiente del frontend con Vite dev server (HMR rápido) y un despliegue de producción extremadamente simple en un solo contenedor Docker.

---

## Complexity Tracking

> **No se detectan violaciones a las reglas constitucionales ni sobre-ingeniería no justificada.**

| Elemento Analizado | Alternativa Considerada | Razón de la Elección |
|---|---|---|
| **Despliegue Embebido vs Nginx Separado** | Nginx + Backend en contenedores separados | Rechazado por complejidad innecesaria de red y certificados; el empaquetado embebido comparte puerto `8080` sin problemas de CORS. |
| **PostgreSQL vs Base en Memoria (H2)** | H2 embebido | H2 no soporta funciones analíticas avanzadas de percentiles ni concurrencia realista con Docker. PostgreSQL es el estándar solicitado. |
| **Autenticación X-API-Key vs OAuth2/Keycloak** | Servidor de identidades completo (Keycloak) | Rechazado para esta fase interna; `X-API-Key` protege la ingesta eficazmente sin requerir infraestructura adicional. |
