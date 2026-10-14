<!--
Sync Impact Report
- Version change: v1.0.0 -> v1.1.0
- List of modified principles:
  - Added: VI. Aislamiento de Funcionalidades y Estrategia de Ramas (Branching Obligatorio)
- Added sections:
  - Flujo de Desarrollo y Puertas de Calidad: 0. Aislamiento Previo de Rama (Branch Gate)
  - Reglas operativas para Agentes de Automatización/IA en control de versiones
- Removed sections: None
- Follow-up TODOs: None
-->

# Originador Constitution

## Core Principles

### I. Calidad de Código y Mantenibilidad Estricta
El código fuente DEBE ser legible, autodocumentado y construido siguiendo principios de diseño limpio (alta cohesión, bajo acoplamiento y responsabilidad única).
- Tipado y Análisis Estático: El proyecto DEBE utilizar comprobación de tipos estricta y linters/formateadores automatizados. Todo commit DEBE aprobar las validaciones de estilo con cero advertencias y cero errores.
- Nomenclatura y Claridad: Los identificadores DEBEN expresar con exactitud el dominio del negocio y la intención operativa, evitando abreviaturas opacas o nombres genéricos.
- Manejo de Errores: Queda ESTRICTAMENTE PROHIBIDO silenciar excepciones o capturar errores genéricos sin acción o registro estructurado. Todo fallo DEBE ser controlado, trazable y tipado.
- Reutilización y Simplicidad: DEBE evitarse la duplicación innecesaria de lógica de negocio (DRY pragmático), evitando al mismo tiempo abstracciones especulativas o prematuras (YAGNI).

*Justificación*: Un estándar riguroso de calidad previene la acumulación de deuda técnica, acelera la incorporación de nuevos desarrolladores y minimiza la tasa de defectos en entornos productivos.

### II. Estándares de Prueba Rigurosos y Enfoque Test-First
La verificación automatizada es parte integral del desarrollo; ninguna funcionalidad o corrección se considera terminada sin su correspondiente cobertura de pruebas.
- Metodología Test-First: Los casos de prueba DEBEN definirse y validarse contra los requisitos antes de considerar completada la implementación de la lógica correspondiente.
- Pirámide de Pruebas:
  - Pruebas Unitarias: Obligatorias para el 100% de las funciones de lógica de negocio pura, cálculo de dominio y transformaciones de datos, con una meta de cobertura mínima del 80% sobre el dominio.
  - Pruebas de Integración: Obligatorias para verificar contratos de API, puntos de persistencia de datos y comunicación entre módulos o servicios.
  - Pruebas de Extremo a Extremo (E2E): Obligatorias para los flujos críticos de usuario (happy paths y escenarios de error primarios).
- Determinismo y Aislamiento: Las suites de prueba DEBEN ser deterministas, independientes del orden de ejecución y aisladas de dependencias externas inestables mediante el uso de contratos, dobles de prueba (mocks/stubs) o entornos efímeros controlados.
- Regresión: Cada reporte de error o bug DEBE acompañarse de una prueba de regresión automatizada que reproduzca el fallo antes de su resolución.

*Justificación*: La certeza operativa y la capacidad de refactorizar con confianza dependen de una red de seguridad de pruebas automatizadas sólida, rápida y determinista.

### III. Consistencia y Accesibilidad en la Experiencia de Usuario (UX)
La experiencia del usuario final DEBE ser predecible, intuitiva, accesible y consistente en todos los puntos de contacto de la aplicación.
- Sistema de Diseño y Componentes: Todas las interfaces DEBEN basarse en un sistema de diseño estandarizado (tokens de color, tipografía, escalas de espaciado y componentes reutilizables). Queda prohibida la introducción de estilos ad-hoc no justificados.
- Estados de Interacción Obligatorios: Todo elemento interactivo y vista DEBE contemplar de forma explícita cinco estados de interfaz: reposo (default), interacción (hover/focus/active), carga/espera (loading skeletons o spinners), estado vacío (empty state) y estado de error con instrucciones claras de recuperación.
- Accesibilidad (a11y): Las interfaces DEBEN satisfacer como mínimo las pautas WCAG 2.1 nivel AA, garantizando navegación completa por teclado, contrastes cromáticos adecuados y etiquetas semánticas para lectores de pantalla.
- Mensajería Orientada al Usuario: Los errores y notificaciones DEBEN comunicarse en lenguaje comprensible y humano, indicando claramente la causa y las opciones de acción, ocultando detalles técnicos o trazas internas de la pila.

*Justificación*: Una experiencia de usuario coherente y accesible reduce la carga cognitiva, disminuye los errores del usuario, aumenta la retención y proyecta fiabilidad profesional.

### IV. Rendimiento Predecible, Eficiencia y Resiliencia
El rendimiento no es una optimización tardía, sino un requisito no funcional continuo que DEBE validarse durante todo el ciclo de vida del software.
- Presupuestos de Rendimiento (Performance Budgets):
  - Respuestas de API y Servicios: Las consultas estándar DEBEN responder con un tiempo de latencia p95 inferior a 200 ms.
  - Interfaz de Usuario: Las páginas web DEBEN mantener métricas Core Web Vitals en umbrales óptimos (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- Eficiencia en el Manejo de Datos: Las consultas a bases de datos DEBEN evitar el problema N+1, utilizar índices adecuados y aplicar paginación obligatoria en cualquier colección de tamaño variable.
- Carga Asíncrona y Ponderada: Los activos pesados, scripts de terceros y módulos no esenciales DEBEN cargarse bajo demanda (lazy loading) o de forma asíncrona.
- Resiliencia ante Fallas: Las llamadas a servicios externos DEBEN implementar políticas de timeout estrictas, reintentos con retraso exponencial (exponential backoff) y mecanismos de disyunción (circuit breaker) o degradación elegante.

*Justificación*: La velocidad y la resiliencia impactan de forma directa en la satisfacción del usuario, los costos de infraestructura y la escalabilidad del sistema ante picos de demanda.

### V. Simplicidad Arquitectónica y Desacoplamiento Modular
El sistema DEBE diseñarse priorizando la menor complejidad necesaria para satisfacer los requerimientos del negocio.
- Límites Claros de Módulos: Los módulos y submódulos DEBEN poseer fronteras bien delimitadas, comunicándose a través de interfaces públicas formales y contratos explícitos.
- YAGNI (You Aren't Gonna Need It): NO DEBEN introducirse marcos de trabajo complejos, microservicios prematuros o capas de abstracción no solicitadas hasta que una necesidad tangible lo exija.
- Justificación de Dependencias: La incorporación de bibliotecas o dependencias externas DEBE evaluarse por su tamaño, licencia, actividad de mantenimiento, impacto en seguridad y compatibilidad técnica.

*Justificación*: El software simple es más económico de mantener, más fácil de probar, presenta una menor superficie de ataque y permite pivotar ante cambios de requerimientos.

### VI. Aislamiento de Funcionalidades y Estrategia de Ramas (Branching Obligatorio)
Queda ESTRICTAMENTE PROHIBIDO desarrollar o codificar directamente sobre la rama principal (`main` o `master`), tanto por parte de desarrolladores humanos como de agentes autónomos de IA.
- Aislamiento Previo al Código: Antes de crear o modificar código fuente, pruebas o configuraciones de una funcionalidad o corrección, se DEBE verificar el estado del repositorio Git y crear o situarse en una rama de trabajo dedicada.
- Convención de Nomenclatura de Ramas:
  - Nuevas funcionalidades o features: `feature/<id-feature>-<slug>` (ejemplo: `feature/001-llm-analytics`)
  - Corrección de anomalías o bugs: `fix/<id-bug>-<slug>`
  - Refactorizaciones o tareas de mantenimiento: `refactor/<slug>` o `chore/<slug>`
- Deber Operativo de los Agentes de IA: Al recibir cualquier instrucción de implementación (incluyendo comandos como `/speckit-implement`), el agente DEBE ejecutar como paso preliminar la verificación de la rama activa (`git branch --show-current`). Si se encuentra en `main` o `master`, DEBE crear y cambiarse a la rama `feature/<feature-name>` correspondiente antes de aplicar cualquier cambio en archivos de código.
- Integración Regulada: La integración a la rama principal solo podrá realizarse mediante Pull Request o Merge Request tras superar satisfactoriamente las compuertas de calidad automatizadas.

*Justificación*: El aislamiento riguroso en ramas garantiza que la rama principal permanezca en un estado siempre desplegable y estable, previene la contaminación de código en progreso y permite abortar o refinar cambios sin afectar el tronco de desarrollo.

## Criterios para Decisiones Técnicas y Opciones de Implementación

Toda decisión arquitectónica o elección tecnológica en Originador DEBE fundamentarse y alinearse con los principios constitucionales mediante los siguientes mecanismos:

1. Registros de Decisión Arquitectónica (ADR):
   - Cualquier cambio estructural, adición de nuevas tecnologías, selección de bibliotecas críticas o cambio de paradigmas DEBE formalizarse mediante un documento ADR (Architecture Decision Record).
   - El ADR DEBE evaluar explícitamente el impacto sobre los ejes fundamentales: calidad de código, pruebas, experiencia de usuario, rendimiento y aislamiento modular.

2. Marco de Evaluación de Alternativas Técnicas:
   - Ante múltiples opciones de implementación, DEBE priorizarse aquella alternativa que ofrezca mayor simplicidad de mantenimiento y menor latencia, siempre que cumpla con las restricciones de negocio.
   - Si una opción técnica ofrece entrega rápida a expensas de la degradación del rendimiento o la falta de pruebas, DEBE ser rechazada salvo autorización explícita como deuda técnica temporal.

3. Gestión Formal de Deuda Técnica:
   - Cualquier compromiso deliberado que relaje temporalmente un principio constitucional DEBE ser documentado como un ítem de deuda técnica en el backlog, con un responsable asignado, una fecha límite de subsanación y un plan de mitigación.

## Flujo de Desarrollo y Puertas de Calidad (Quality Gates)

Para asegurar el cumplimiento de esta constitución, el ciclo de vida del desarrollo DEBE implementar las siguientes compuertas obligatorias:

0. Aislamiento Previo de Rama (Branch Gate):
   - Verificación estricta de que el espacio de trabajo no esté en `main` o `master`.
   - Creación y verificación de rama dedicada `feature/...` o `fix/...` antes de editar código.

1. Verificación en Integración Continua (CI):
   - Compilación exitosa sin advertencias.
   - Ejecución del 100% de linters y validaciones de formato de código.
   - Aprobación del 100% de la suite de pruebas automatizadas (unitarias e integración).
   - Umbral mínimo de cobertura de código verificado automáticamente.

2. Revisión de Código por Pares (Peer Review):
   - Todo cambio a la rama principal DEBE ser revisado y aprobado por al menos un revisor calificado mediante Pull Request.
   - El revisor DEBE verificar no solo la corrección sintáctica, sino la adhesión a los principios de experiencia de usuario, diseño modular, manejo de errores, rendimiento y branching.

3. Monitoreo y Observabilidad en Producción:
   - Toda funcionalidad desplegada DEBE contar con registros estructurados (logs) e instrumentación de métricas clave de salud y rendimiento (latencias, tasas de error, uso de CPU y memoria).

## Governance

Esta Constitución representa el marco normativo supremo de ingeniería y diseño para el proyecto Originador. Tiene precedencia sobre preferencias individuales, estilos personales de programación o presiones coyunturales que comprometan la integridad del producto.

1. Cumplimiento Obligatorio:
   - Todo colaborador, líder técnico, desarrollador o agente de automatización / IA que contribuya a este repositorio DEBE acatar los principios y reglas aquí establecidos.
   - Los agentes de codificación autónoma DEBEN leer esta Constitución y verificar explícitamente el cumplimiento de las compuertas de calidad y la creación de rama antes de emitir cambios de código.
   - El incumplimiento sistemático o no justificado de estas normas invalidará la aprobación de pull requests o despliegues.

2. Procedimiento de Enmienda:
   - Cualquier miembro del equipo puede proponer enmiendas a esta constitución mediante una solicitud de cambio (Pull Request).
   - Las propuestas DEBEN incluir: justificación de la necesidad de cambio, evaluación de impacto en la base de código existente, plan de transición o migración, y consenso de los líderes técnicos del proyecto.

3. Política de Versionado Semántico de la Constitución:
   - **MAJOR (X.0.0)**: Cambios incompatibles, eliminación, sustitución o redefinición fundamental de principios rectores o reglas de gobernanza.
   - **MINOR (x.Y.0)**: Adición de nuevos principios rectores, nuevas secciones de gobernanza o ampliación sustancial de estándares sin invalidar los existentes.
   - **PATCH (x.y.Z)**: Correcciones tipográficas, refinamientos de redacción, adición de ejemplos aclaratorios o ajustes menores no semánticos.

4. Revisiones de Cumplimiento Periódicas:
   - En cada ciclo de retrospectiva o hito de versión mayor, el equipo DEBE auditar la alineación entre la base de código real y las directrices de esta Constitución para identificar desviaciones y actualizar estándares si la evolución técnica lo demanda.

**Version**: 1.1.0 | **Ratified**: 2026-10-14 | **Last Amended**: 2026-10-14

