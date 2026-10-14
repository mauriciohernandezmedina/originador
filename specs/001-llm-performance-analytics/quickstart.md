# Quickstart & Validation Guide: LLM Performance Analytics Platform

**Feature**: `001-llm-performance-analytics`  
**Date**: 2026-10-14  
**Status**: Completed  

Esta guía describe los pasos para inicializar, ejecutar y validar de extremo a extremo la plataforma de análisis de rendimiento utilizando **Docker Compose** o entorno local.

---

## 1. Prerrequisitos

- **Docker & Docker Compose**: Docker Engine 24+ con plugin Compose v2 (`docker compose version`).
- **Opcional para desarrollo local sin Docker**:
  - JDK 25 LTS (`java -version`).
  - Node.js 20+ y npm 10+ (`node -v`, `npm -v`).
  - PostgreSQL 16 local en puerto `5432`.

---

## 2. Configuración y Despliegue con Docker Compose

### 2.1 Definición de Variables de Entorno
Cree un archivo `.env` en la raíz del repositorio (o utilice los valores por defecto):

```env
SERVER_PORT=8080
POSTGRES_DB=llm_analytics
POSTGRES_USER=originador_user
POSTGRES_PASSWORD=originador_secret
POSTGRES_PORT=5432
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/llm_analytics
APP_API_KEY=originador-llm-secret-key-2026
SPRING_PROFILES_ACTIVE=docker
```

### 2.2 Iniciar Contenedores
Ejecute en la raíz del proyecto:

```bash
docker compose up -d --build
```

El servicio `postgres` iniciará primero; una vez completada la comprobación de salud (`pg_isready`), el contenedor `app` (Spring Boot con React embebido) iniciará y escuchará en:
👉 **`http://localhost:8080`**

Para verificar el estado de los servicios:
```bash
docker compose ps
docker compose logs -f app
```

---

## 3. Escenarios de Validación de Extremo a Extremo (E2E)

### Escenario 1: Verificación de Autenticación con Clave de API
Comprobar que las peticiones no autenticadas son rechazadas con HTTP 401:

```bash
# Petición sin encabezado X-API-Key (Debe retornar 401 Unauthorized)
curl -i http://localhost:8080/api/v1/metrics/summary

# Petición con clave válida (Debe retornar 200 OK)
curl -i -H "X-API-Key: originador-llm-secret-key-2026" http://localhost:8080/api/v1/metrics/summary
```

### Escenario 2: Inicialización de Datos de Muestra (Demo Mode)
Poblar la base de datos con escenarios representativos predefinidos:

```bash
curl -X POST http://localhost:8080/api/v1/sample-data/seed \
  -H "X-API-Key: originador-llm-secret-key-2026" \
  -H "Content-Type: application/json"
```
**Resultado esperado**:
- `HTTP 200 OK` con JSON indicando 3 iteraciones creadas (`v1-prompt-baseline`, `v2-prompt-optimized`, `v3-agentic-tools`) y más de 30 trazas insertadas.

### Escenario 3: Ingesta de Nueva Traza de Interacción vía API REST
Simular que un agente de IA envía las métricas de un chat completado:

```bash
curl -X POST http://localhost:8080/api/v1/traces \
  -H "X-API-Key: originador-llm-secret-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "clientTraceId": "test-trace-001",
    "iterationId": "experiment-flash-eval",
    "modelName": "gemini-1.5-flash",
    "promptText": "Resume en tres viñetas las ventajas de Docker.",
    "responseText": "- Portabilidad\n- Aislamiento\n- Eficiencia de recursos",
    "inputTokens": 35,
    "outputTokens": 28,
    "startedAt": "2026-10-14T10:30:00.000Z",
    "endedAt": "2026-10-14T10:30:00.650Z",
    "status": "SUCCESS",
    "tools": [
      {
        "toolName": "formatter_tool",
        "startedAt": "2026-10-14T10:30:00.500Z",
        "endedAt": "2026-10-14T10:30:00.600Z",
        "status": "SUCCESS"
      }
    ]
  }'
```
**Resultado esperado**:
- Código `HTTP 201 Created` con el ID asignado a la traza, cálculo automático de latencia (`650ms`) y velocidad en tokens/segundo (`43.08`).

### Escenario 4: Comparación entre Dos Iteraciones
Verificar el cálculo automático de deltas de rendimiento:

```bash
curl -H "X-API-Key: originador-llm-secret-key-2026" \
  "http://localhost:8080/api/v1/iterations/compare?baseId=v1-prompt-baseline&targetId=v2-prompt-optimized"
```
**Resultado esperado**:
- JSON comparativo detallando el porcentaje de reducción de latencia (`latencyDeltaPercentage`) y ahorro de tokens (`tokensDeltaPercentage`).

### Escenario 5: Validación Visual en el Navegador Web
1. Abra `http://localhost:8080` en su navegador.
2. Ingrese la clave de API (`originador-llm-secret-key-2026`) en el diálogo inicial de configuración si es requerida.
3. Observe el Tablero Principal:
   - Tarjetas de KPIs (Latencia Media, p95, Total Tokens, Tokens/Seg).
   - Gráfico de serie temporal de latencias.
   - Gráfico de barras de consumo de tokens (entrada vs salida).
   - Gráfico de distribución de herramientas.
4. Navegue a la pestaña **Iteraciones**:
   - Seleccione `v1-prompt-baseline` y `v2-prompt-optimized` para visualización comparativa lado a lado.
5. Navegue a la pestaña **Trazas**:
   - Haga clic en una traza para abrir el modal de detalle con la línea de tiempo (*waterfall timeline*) distinguiendo el tiempo de inferencia del LLM del tiempo de herramientas.

---

## 4. Detención y Limpieza

Para detener los servicios y preservar datos:
```bash
docker compose down
```

Para reiniciar la base de datos limpia eliminando volúmenes:
```bash
docker compose down -v
```
