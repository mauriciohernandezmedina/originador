# Feature Specification: LLM Performance Analytics Platform

**Feature Branch**: `001-llm-performance-analytics`

**Created**: 2026-10-14

**Status**: Draft

**Input**: User description: "Cree una plataforma basada en web que pueda utilizarse para capturar el análisis de rendimiento de las interacciones / chats de LLM utilizando el prompt enviado, los tokens de entrada, los tokens de salida, la hora de inicio, la hora de finalización, las herramientas llamadas, etcétera. Haga posible almacenar diferentes iteraciones y permita mostrar gráficos y todas las demás formas relevantes en que se pueda determinar el rendimiento. Incluya una API REST para que los resultados puedan ser cargados. Incluya datos de muestra para que podamos ver cómo se vería."

## Clarifications

### Session 2026-10-14
- Q: ¿Cómo debe operar la plataforma para capturar y medir las interacciones de los LLMs? → A: Ingesta pasiva de telemetría: La aplicación o agente cliente invoca al LLM por su cuenta y reporta las métricas (tokens, tiempos, herramientas) a la API REST de la plataforma.
- Q: ¿Qué nivel de autenticación y seguridad debe exigir la API REST y la plataforma web? → A: Clave de API simple (API Key en encabezado): Autenticación mediante un token o clave de API estática en el encabezado HTTP (ej. X-API-Key) para proteger la ingesta sin sobrecargar de complejidad.
- Q: ¿Cómo deben crearse y organizarse las iteraciones dentro de la plataforma? → A: Agrupación automática por identificador (Tag-based): El cliente envía libremente un 'iteration_id' en cada métrica y el sistema indexa y agrupa automáticamente las iteraciones sin requerir alta previa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingesta Automatizada de Métricas de Interacción vía API REST (Priority: P1)

Como desarrollador o sistema de IA que ejecuta modelos de lenguaje (LLM), quiero enviar las métricas de cada interacción (prompt, tokens de entrada/salida, tiempos de ejecución, herramientas invocadas, estado) a través de una API REST estandarizada, para centralizar y persistir el historial de rendimiento de forma desatendida.

**Why this priority**: Es la base operativa del sistema; sin la capacidad de recibir y almacenar datos de telemetría de interacciones, ninguna visualización ni análisis comparativo es posible.

**Independent Test**: Puede probarse de forma independiente enviando una solicitud HTTP POST con un registro de interacción válido y verificando que el registro se almacene íntegro y devuelva un identificador de confirmación.

**Acceptance Scenarios**:

1. **Given** un cliente externo con métricas de una interacción de LLM (prompt, tokens de entrada: 120, tokens de salida: 250, hora de inicio, hora de fin, herramientas invocadas, identificador de iteración), **When** envía una solicitud HTTP POST al endpoint de ingesta con una clave de API válida en el encabezado `X-API-Key`, **Then** el sistema valida y persiste el registro, respondiendo con código de éxito y el identificador único de la traza registrada.
2. **Given** una solicitud de ingesta con campos obligatorios faltantes o tipos de datos inválidos (por ejemplo, tokens negativos o fecha de fin previa a fecha de inicio), **When** se envía al endpoint de la API con autenticación válida, **Then** el sistema rechaza la carga con un mensaje explicativo y código de error correspondiente, sin guardar registros corruptos.
3. **Given** un conjunto de múltiples interacciones generadas en lote, **When** el cliente envía una solicitud por lotes (batch ingestion) autenticada, **Then** el sistema procesa e indexa todos los registros válidos confirmando el número de elementos recibidos.
4. **Given** una solicitud a los endpoints de la API REST sin encabezado de autenticación o con una clave de API inválida, **When** el cliente intenta enviar métricas, **Then** el sistema rechaza la solicitud inmediatamente con código HTTP 401 Unauthorized sin procesar la carga.

---

### User Story 2 - Tablero Visual y Gráficos de Rendimiento de Interacciones (Priority: P1)

Como ingeniero de prompts o analista de IA, quiero acceder a un panel web con gráficos interactivos y métricas agregadas (latencia total, rendimiento de tokens por segundo, proporción de tokens de entrada/salida y frecuencia de errores), para evaluar de un vistazo el comportamiento de los modelos.

**Why this priority**: Representa el valor central de negocio y la experiencia de usuario principal, permitiendo diagnosticar cuellos de botella y costos operativos sin tener que analizar logs manualmente.

**Independent Test**: Puede probarse de forma independiente cargando datos existentes y verificando que el tablero calcule y muestre gráficos de distribución de latencia, consumo de tokens y resúmenes estadísticos (promedios, percentiles p50 y p95).

**Acceptance Scenarios**:

1. **Given** una colección de interacciones almacenadas, **When** el usuario ingresa a la vista principal de la plataforma web, **Then** el sistema muestra indicadores clave (tiempo de respuesta promedio, percentiles de latencia, velocidad de generación en tokens/segundo) y gráficos de evolución temporal de latencias y consumo de tokens.
2. **Given** el panel de gráficos, **When** el usuario filtra por rango de fechas o estado de interacción (exitoso, fallido, timeout), **Then** los gráficos y tarjetas de métricas se actualizan dinámicamente reflejando el subconjunto de datos filtrado.
3. **Given** interacciones que involucran llamadas a herramientas (function calling / tool use), **When** el usuario visualiza la sección de desglose de herramientas, **Then** el sistema muestra un gráfico con la frecuencia de uso y tiempo acumulado consumido por cada herramienta.

---

### User Story 3 - Gestión y Comparación entre Iteraciones y Evaluaciones (Priority: P2)

Como optimizador de prompts o evaluador de modelos, quiero agrupar las interacciones en diferentes iteraciones o ejecuciones de prueba (runs) y compararlas lado a lado, para determinar con precisión qué versión de prompt o configuración de modelo ofrece mejor balance de velocidad, consumo de tokens y efectividad.

**Why this priority**: La optimización de LLM es un proceso iterativo; comparar variantes (A/B testing de prompts o modelos) es esencial para validar mejoras cuantitativas.

**Independent Test**: Puede probarse de forma independiente seleccionando dos iteraciones distintas (por ejemplo, "Iteración 1: Prompt Base" vs "Iteración 2: Prompt Optimizado") y verificando que la vista comparativa resalte las diferencias de latencia media, total de tokens y tasa de llamadas a herramientas.

**Acceptance Scenarios**:

1. **Given** interacciones etiquetadas con identificadores de iteración distintos, **When** el usuario navega a la sección de iteraciones, **Then** visualiza un listado ordenado de todas las iteraciones registradas con su volumen de llamadas, fecha de ejecución y resumen de rendimiento.
2. **Given** la lista de iteraciones, **When** el usuario selecciona dos o más iteraciones para comparar, **Then** la plataforma despliega una vista comparativa con gráficos superpuestos y tablas comparativas de métricas (delta de latencia, reducción/aumento de tokens y tasa de éxito).
3. **Given** la necesidad de organizar experimentos, **When** el usuario asigna un nombre descriptivo o etiquetas a una iteración a través de la interfaz web, **Then** el sistema actualiza la metadata de la iteración para facilitar su búsqueda y referencia futura.

---

### User Story 4 - Exploración Detallada de Trazas Individuales e Invocación de Herramientas (Priority: P2)

Como desarrollador depurando un agente o flujo conversacional, quiero inspeccionar la traza completa de una interacción específica (texto del prompt, texto de respuesta generado, desglose temporal de cada herramienta llamada y tokens consumidos), para identificar por qué una consulta en particular fue lenta o costosa.

**Why this priority**: Permite realizar análisis de causa raíz sobre casos anómalos (outliers) identificados en los gráficos de alto nivel.

**Independent Test**: Puede probarse seleccionando un registro individual en la tabla de interacciones y confirmando que se rendericen todos los detalles cronológicos, el prompt original, la respuesta y la lista de herramientas ejecutadas con sus argumentos y duraciones.

**Acceptance Scenarios**:

1. **Given** un registro en la tabla de interacciones, **When** el usuario hace clic para ver el detalle de la interacción, **Then** se abre una vista detallada que presenta el texto íntegro del prompt, la respuesta del modelo, los tokens exactos (entrada y salida) y el cálculo de tokens por segundo.
2. **Given** una interacción que incluyó una o más llamadas a herramientas externas, **When** se examina la vista de detalle, **Then** se presenta una línea de tiempo (waterfall / timeline) que desglosa el tiempo invertido en la inferencia del modelo versus el tiempo consumido por cada herramienta.
3. **Given** una interacción que finalizó en error o excepción, **When** se examina el detalle, **Then** el sistema resalta el estado de falla, el mensaje de error capturado y en qué fase del ciclo de vida ocurrió (durante la inferencia o durante la ejecución de herramientas).

---

### User Story 5 - Datos de Muestra Predefinidos y Modo de Demostración (Priority: P3)

Como nuevo evaluador o usuario de la plataforma, quiero disponer de un conjunto representativo de datos de muestra preinstalado o cargable con un solo clic, para experimentar inmediatamente con los gráficos, iteraciones y visualizaciones sin necesidad de instrumentar previamente una aplicación externa.

**Why this priority**: Facilita la exploración inmediata, la validación funcional de la interfaz y las demostraciones del producto desde el primer minuto.

**Independent Test**: Puede probarse iniciando la plataforma en un entorno limpio y comprobando la presencia o carga opcional de datos de muestra que ilustren escenarios realistas (conversaciones simples, agentes con múltiples herramientas, iteraciones comparativas y casos con anomalías de rendimiento).

**Acceptance Scenarios**:

1. **Given** un entorno recién desplegado sin datos previos, **When** el usuario abre la plataforma por primera vez, **Then** la interfaz ofrece la opción de cargar un conjunto de datos de muestra de rendimiento.
2. **Given** la carga de datos de muestra activada, **When** finaliza la inicialización, **Then** el sistema puebla al menos tres iteraciones representativas con más de 20 interacciones de ejemplo, permitiendo interactuar de inmediato con todos los gráficos, filtros y comparativas.
3. **Given** un usuario que desea reiniciar o limpiar los datos de prueba, **When** ejecuta la acción de reinicio de datos de demostración, **Then** el sistema restaura el estado limpio o recarga las muestras originales sin afectar la estabilidad de la plataforma.

---

### Edge Cases

- **Interacciones interrumpidas o canceladas**: ¿Cómo registra el sistema solicitudes donde la hora de finalización no se completó por aborto del cliente o corte de conexión? El sistema debe admitir el estado "cancelled" o "timeout", registrando la hora de inicio y calculando el tiempo transcurrido hasta la interrupción con 0 tokens de salida generados.
- **Interacciones sin llamadas a herramientas**: Las interacciones de chat puro deben representarse sin errores en los gráficos de herramientas, indicando explícitamente "0 herramientas invocadas" sin distorsionar los promedios de duración de herramientas.
- **Llamadas a múltiples herramientas paralelas**: Si un modelo invoca múltiples herramientas simultáneamente, el sistema debe registrar el inicio y fin de cada herramienta de forma individual sin asumir secuencias estrictas.
- **Prompts o respuestas de gran longitud**: Para textos con miles de tokens, la interfaz debe truncar o paginar la previsualización en tablas para mantener la fluidez visual, ofreciendo expansión bajo demanda o visor de texto completo.
- **Valores extremos o anómalos de latencia**: Tiempos de respuesta atípicamente altos (por ejemplo, minutos debido a caídas de red) no deben romper la escala de los gráficos (uso de escalas adaptativas o visualización de percentiles resistentes a outliers como p50/p90/p99).
- **Carga de métricas duplicadas**: Si el cliente reintenta el envío de la misma interacción debido a problemas de red, el sistema debe evitar duplicados utilizando un identificador de interacción idempotente proporcionado por el cliente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE operar bajo un modelo de ingesta pasiva de telemetría (donde clientes y agentes ejecutan sus llamadas a LLMs de forma independiente) y exponer una API REST que permita recibir registros individuales de interacción con los siguientes atributos: identificador de interacción, identificador de iteración/experimento, nombre del modelo, prompt enviado, respuesta recibida, tokens de entrada, tokens de salida, marca de tiempo de inicio, marca de tiempo de finalización, estado (éxito, error, timeout) y lista opcional de herramientas invocadas.
- **FR-002**: El sistema DEBE exponer un endpoint en la API REST para la ingesta en lote (batch) de múltiples registros de interacción en una sola solicitud HTTP.
- **FR-003**: Para cada interacción registrada, el sistema DEBE calcular automáticamente la duración total (latencia en milisegundos) y la velocidad de generación (tokens de salida generados por segundo).
- **FR-004**: Para cada invocación de herramienta asociada a una interacción, el sistema DEBE registrar el nombre de la herramienta, argumentos de entrada, resultado o mensaje de error, hora de inicio y hora de fin de la herramienta.
- **FR-005**: El sistema DEBE persistir todos los registros de interacción y permitir su consulta ordenada cronológicamente y agrupada por iteración.
- **FR-006**: La interfaz web DEBE presentar un tablero principal con métricas resumidas que incluya: total de interacciones, latencia promedio y percentiles (p50, p95), total acumulado de tokens (entrada y salida), costo estimado o consumo medio de tokens, y tasa de error.
- **FR-007**: La interfaz web DEBE incluir gráficos interactivos que muestren:
  - Serie temporal de latencias por interacción.
  - Distribución comparativa de tokens de entrada vs tokens de salida.
  - Velocidad de procesamiento (tokens por segundo) a lo largo del tiempo.
  - Frecuencia y duración media por tipo de herramienta invocada.
- **FR-008**: El sistema DEBE permitir filtrar y buscar interacciones por: identificador de iteración, nombre de modelo, rango de fechas, rango de latencia, presencia de herramientas y estado de la ejecución.
- **FR-009**: El sistema DEBE agrupar automáticamente las interacciones según el valor de `iteration_id` recibido en cada métrica (creando dinámicamente la iteración sin requerir alta previa), permitir enriquecer opcionalmente su nombre descriptivo o hipótesis desde la interfaz web, y ofrecer una vista comparativa lado a lado que contraste métricas de rendimiento entre al menos dos iteraciones seleccionadas.
- **FR-010**: La interfaz web DEBE ofrecer una vista detallada para cada interacción individual que exponga el prompt completo, la respuesta generada, el desglose de tokens y una cronología gráfica (timeline) que diferencie el tiempo de procesamiento del modelo del tiempo de ejecución de cada herramienta.
- **FR-011**: El sistema DEBE incluir un conjunto de datos de muestra preconstruido que simule diversos escenarios reales de uso de LLMs (conversaciones cotidianas, flujos de agentes con múltiples herramientas, respuestas fallidas y distintas iteraciones comparables).
- **FR-012**: La interfaz web DEBE proveer un mecanismo accesible (botón o selector) para cargar, explorar o restablecer los datos de muestra en cualquier momento.
- **FR-013**: La API REST DEBE implementar validaciones de entrada estrictas, devolviendo respuestas de error descriptivas en formato JSON ante solicitudes mal formadas o parámetros inválidos.
- **FR-014**: La interfaz web DEBE implementar estados claros de carga, estados vacíos cuando no existan registros y mensajes de error comprensibles ante fallas de comunicación con la API.
- **FR-015**: El sistema DEBE permitir exportar los datos de las interacciones y los resúmenes de rendimiento en formato JSON o CSV.
- **FR-016**: La interfaz web DEBE ser completamente responsiva y accesible cumpliendo con estándares de navegación y visualización coherentes.
- **FR-017**: La API REST DEBE autenticar todas las solicitudes de ingesta y consulta mediante la verificación de una clave de API (API Key) transmitida a través del encabezado HTTP `X-API-Key`, respondiendo con código HTTP 401 Unauthorized ante peticiones no autorizadas o con claves inválidas.

### Key Entities *(include if feature involves data)*

- **InteractionTrace (Traza de Interacción)**: Representa una única llamada o turno de conversación con un LLM. Atributos: ID único, ID de cliente/idempotencia, ID de iteración, modelo utilizado, contenido del prompt, contenido de la respuesta, tokens de entrada, tokens de salida, total de tokens, fecha/hora de inicio, fecha/hora de finalización, duración total en ms, tokens por segundo, estado (Success, Error, Cancelled, Timeout), mensaje de error (opcional).
- **ToolInvocation (Invocación de Herramienta)**: Representa la ejecución de una herramienta o función llamada por el modelo durante una interacción. Atributos: ID único, ID de traza asociada, nombre de la herramienta, parámetros de entrada, respuesta/salida, fecha/hora de inicio, fecha/hora de fin, duración en ms, estado (Success, Error).
- **IterationRun (Iteración / Experimento)**: Representa una versión, experimento o lote de pruebas bajo una configuración particular. Generada automáticamente a partir del `iteration_id` reportado en las trazas y editable desde la UI. Atributos: ID único (`iteration_id`), nombre descriptivo, descripción/hipótesis, fecha de primera y última interacción, recuento total de interacciones asociadas, resumen consolidado de métricas (latencia media, percentiles, tokens promedio, tasa de éxito).
- **PerformanceSummary (Resumen de Rendimiento)**: Estructura de agregación estadística calculada para un conjunto de trazas o para una iteración. Atributos: total de interacciones, latencia mínima, media, p50, p90, p95, máxima; total de tokens consumidos; throughput promedio (tokens/seg); porcentaje de fallos; métricas de herramientas (frecuencia, tiempo acumulado).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden visualizar el tablero de rendimiento completo y sus gráficos interactivos con menos de 2 segundos de tiempo de carga inicial con hasta 10,000 registros almacenados.
- **SC-002**: El endpoint de ingesta de la API REST es capaz de procesar y confirmar el registro de una interacción en menos de 100 milisegundos para solicitudes individuales.
- **SC-003**: Un evaluador o usuario nuevo puede explorar e interactuar con los datos de muestra y comparar dos iteraciones en menos de 1 minuto desde el primer acceso a la plataforma.
- **SC-004**: El 100% de las métricas clave (latencia total, tokens de entrada, tokens de salida, throughput en tokens/segundo y desglose de herramientas) son calculadas y visualizadas con exactitud matemática verificable contra los datos de entrada brutos.
- **SC-005**: Los usuarios pueden identificar anomalías de rendimiento (outliers con latencia superior al percentil p95 o ejecuciones fallidas) en un solo clic desde el gráfico principal hacia la lista de trazas filtradas.
- **SC-006**: La comparación lado a lado entre dos iteraciones resalta de forma inmediata las variaciones porcentuales (deltas de latencia y de tokens) sin requerir cálculos manuales por parte del usuario.

## Assumptions

- **Almacenamiento Local Inicial**: Para la primera fase de la plataforma, los datos se almacenan de forma persistente en una base de datos embebida o local sin requerir configuración compleja de infraestructura en la nube.
- **Entorno de Acceso y Autenticación**: La plataforma está concebida como una herramienta interna para equipos de ingeniería y científicos de datos; la API se protege mediante clave estática (API Key) en encabezado HTTP sin requerir un sistema multi-inquilino ni login de usuarios individual.
- **Formatos de Entrada**: Los clientes externos que reportan métricas envían solicitudes en formato JSON estándar a través de HTTP/HTTPS con su correspondiente clave de API.
- **Contenido de Prompts**: Se asume que el almacenamiento de prompts y respuestas en texto completo está permitido dentro del entorno de evaluación y pruebas, con el objetivo de facilitar el análisis cualitativo y la depuración técnica.
- **Conjunto de Datos de Muestra**: Los datos de muestra generados simularán modelos y casos de uso representativos del ecosistema moderno de IA (por ejemplo, agentes de búsqueda, asistentes de código y sistemas conversacionales con function calling).
