package com.originador.analytics.service;

import com.originador.analytics.dto.SampleDataSeedResponse;
import com.originador.analytics.model.InteractionTrace;
import com.originador.analytics.model.IterationRun;
import com.originador.analytics.model.ToolInvocation;
import com.originador.analytics.repository.InteractionTraceRepository;
import com.originador.analytics.repository.IterationRunRepository;
import com.originador.analytics.repository.ToolInvocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SampleDataService {

    private final IterationRunRepository iterationRepository;
    private final InteractionTraceRepository traceRepository;
    private final ToolInvocationRepository toolRepository;

    @Transactional
    public void resetSampleData() {
        log.info("Resetting all database telemetry and iterations...");
        toolRepository.deleteAllInBatch();
        traceRepository.deleteAllInBatch();
        iterationRepository.deleteAllInBatch();
        log.info("Database reset completed successfully.");
    }

    @Transactional
    public SampleDataSeedResponse seedSampleData() {
        log.info("Seeding realistic sample data...");

        // Clean existing data first to ensure deterministic seed
        resetSampleData();

        Instant now = Instant.now();

        // 1. Iterations definition
        IterationRun iter1 = IterationRun.builder()
                .id("v1-prompt-baseline")
                .name("V1 - Prompts Baseline")
                .description("Versión inicial sin optimizar de prompts. Consultas crudas directas sin few-shot ni compresión.")
                .createdAt(now.minus(7, ChronoUnit.DAYS))
                .updatedAt(now.minus(4, ChronoUnit.DAYS))
                .build();

        IterationRun iter2 = IterationRun.builder()
                .id("v2-prompt-optimized")
                .name("V2 - Prompts Optimizados")
                .description("Rediseño con delimitadores XML, compresión semántica y few-shot para menor latencia y consumo de tokens.")
                .createdAt(now.minus(4, ChronoUnit.DAYS))
                .updatedAt(now.minus(1, ChronoUnit.DAYS))
                .build();

        IterationRun iter3 = IterationRun.builder()
                .id("v3-agentic-tools")
                .name("V3 - Flujo Agéntico con Herramientas")
                .description("Agente autónomo con Function Calling (web_search, calculator, db_lookup, python_repl).")
                .createdAt(now.minus(2, ChronoUnit.DAYS))
                .updatedAt(now)
                .build();

        List<IterationRun> iterations = List.of(iter1, iter2, iter3);
        iterationRepository.saveAll(iterations);

        // 2. Traces for V1 (Baseline, higher latency, no tools, some errors)
        List<InteractionTrace> allTraces = new ArrayList<>();
        allTraces.addAll(generateV1Traces(iter1, now));

        // 3. Traces for V2 (Optimized, ~30% faster, fewer tokens)
        allTraces.addAll(generateV2Traces(iter2, now));

        // 4. Traces for V3 (Agentic tools with waterfall breakdown)
        allTraces.addAll(generateV3Traces(iter3, now));

        traceRepository.saveAll(allTraces);

        log.info("Successfully seeded {} iterations and {} interaction traces.", iterations.size(), allTraces.size());

        return SampleDataSeedResponse.builder()
                .message("Datos de muestra inicializados exitosamente (3 iteraciones, " + allTraces.size() + " trazas con herramientas).")
                .seededIterations(iterations.size())
                .seededTraces(allTraces.size())
                .build();
    }

    private List<InteractionTrace> generateV1Traces(IterationRun iter, Instant baseTime) {
        List<InteractionTrace> traces = new ArrayList<>();
        String[] models = {"gpt-4o", "gpt-4-turbo", "claude-3-opus"};

        for (int i = 1; i <= 10; i++) {
            Instant start = baseTime.minus(6, ChronoUnit.DAYS).plus(i * 4, ChronoUnit.HOURS);
            long latency = 1800L + (i * 120L); // 1800ms to 3000ms
            Instant end = start.plusMillis(latency);

            int inTokens = 450 + (i * 35);
            int outTokens = 220 + (i * 15);
            double tps = Math.round((outTokens / (latency / 1000.0)) * 100.0) / 100.0;

            boolean isError = (i == 4); // 1 error scenario
            String status = isError ? "ERROR" : "SUCCESS";
            String errorMsg = isError ? "RateLimitError: Requests per minute limit exceeded on upstream LLM" : null;

            InteractionTrace trace = InteractionTrace.builder()
                    .id(UUID.randomUUID().toString())
                    .iteration(iter)
                    .clientTraceId("v1-trace-" + i)
                    .modelName(models[i % models.length])
                    .promptText("Prompt Baseline #" + i + ": Por favor analiza detalladamente el siguiente texto extenso con instrucciones redundantes y genera un resumen completo.")
                    .responseText(isError ? null : "Respuesta detallada generada con el modelo base sin optimizar. Contiene explicaciones estándar de prueba para la iteración 1.")
                    .inputTokens(inTokens)
                    .outputTokens(isError ? 0 : outTokens)
                    .totalTokens(isError ? inTokens : inTokens + outTokens)
                    .startedAt(start)
                    .endedAt(end)
                    .latencyMs(latency)
                    .tokensPerSecond(isError ? 0.0 : tps)
                    .status(status)
                    .errorMessage(errorMsg)
                    .createdAt(end)
                    .build();

            traces.add(trace);
        }

        return traces;
    }

    private List<InteractionTrace> generateV2Traces(IterationRun iter, Instant baseTime) {
        List<InteractionTrace> traces = new ArrayList<>();
        String[] models = {"gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"};

        for (int i = 1; i <= 11; i++) {
            Instant start = baseTime.minus(3, ChronoUnit.DAYS).plus(i * 3, ChronoUnit.HOURS);
            long latency = 950L + (i * 65L); // 950ms to 1665ms (~40% faster than v1)
            Instant end = start.plusMillis(latency);

            int inTokens = 210 + (i * 15); // ~50% fewer input tokens
            int outTokens = 160 + (i * 10);
            double tps = Math.round((outTokens / (latency / 1000.0)) * 100.0) / 100.0;

            InteractionTrace trace = InteractionTrace.builder()
                    .id(UUID.randomUUID().toString())
                    .iteration(iter)
                    .clientTraceId("v2-trace-" + i)
                    .modelName(models[i % models.length])
                    .promptText("Prompt Optimizado #" + i + " <system>Responde de forma concisa</system> <context>Datos precisos</context>")
                    .responseText("Respuesta directa y estructurada generada con la versión optimizada de prompts (few-shot template).")
                    .inputTokens(inTokens)
                    .outputTokens(outTokens)
                    .totalTokens(inTokens + outTokens)
                    .startedAt(start)
                    .endedAt(end)
                    .latencyMs(latency)
                    .tokensPerSecond(tps)
                    .status("SUCCESS")
                    .createdAt(end)
                    .build();

            traces.add(trace);
        }

        return traces;
    }

    private List<InteractionTrace> generateV3Traces(IterationRun iter, Instant baseTime) {
        List<InteractionTrace> traces = new ArrayList<>();
        String[] models = {"gpt-4o", "claude-3-5-sonnet"};

        for (int i = 1; i <= 12; i++) {
            Instant start = baseTime.minus(1, ChronoUnit.DAYS).plus(i * 2, ChronoUnit.HOURS);
            long latency = 1200L + (i * 90L); // 1200ms to 2280ms
            Instant end = start.plusMillis(latency);

            int inTokens = 320 + (i * 20);
            int outTokens = 190 + (i * 15);
            double tps = Math.round((outTokens / (latency / 1000.0)) * 100.0) / 100.0;

            boolean isTimeout = (i == 10);
            String status = isTimeout ? "TIMEOUT" : "SUCCESS";
            String errorMsg = isTimeout ? "ClientTimeoutException: Tool execution exceeded 5000ms threshold" : null;

            InteractionTrace trace = InteractionTrace.builder()
                    .id(UUID.randomUUID().toString())
                    .iteration(iter)
                    .clientTraceId("v3-trace-" + i)
                    .modelName(models[i % models.length])
                    .promptText("Consulta Agéntica #" + i + ": Localiza información actualizada de tipos de cambio y calcula el valor de la cartera.")
                    .responseText(isTimeout ? null : "La tasa actual es 19.82 USD/MXN. El valor total de su cartera es $29,730.00 MXN.")
                    .inputTokens(inTokens)
                    .outputTokens(isTimeout ? 0 : outTokens)
                    .totalTokens(isTimeout ? inTokens : inTokens + outTokens)
                    .startedAt(start)
                    .endedAt(end)
                    .latencyMs(latency)
                    .tokensPerSecond(isTimeout ? 0.0 : tps)
                    .status(status)
                    .errorMessage(errorMsg)
                    .createdAt(end)
                    .build();

            // Attach 1 to 2 tools
            ToolInvocation tool1 = ToolInvocation.builder()
                    .id(UUID.randomUUID().toString())
                    .trace(trace)
                    .toolName("web_search")
                    .inputArguments("{\"query\": \"usd to mxn exchange rate\"}")
                    .outputResult("{\"rate\": 19.82, \"timestamp\": \"2026-10-14T10:00:00Z\"}")
                    .startedAt(start.plusMillis(200))
                    .endedAt(start.plusMillis(520))
                    .durationMs(320L)
                    .status("SUCCESS")
                    .build();
            trace.getTools().add(tool1);

            if (i % 2 == 0) {
                ToolInvocation tool2 = ToolInvocation.builder()
                        .id(UUID.randomUUID().toString())
                        .trace(trace)
                        .toolName("calculator")
                        .inputArguments("{\"expression\": \"1500 * 19.82\"}")
                        .outputResult("{\"result\": 29730.0}")
                        .startedAt(start.plusMillis(550))
                        .endedAt(start.plusMillis(610))
                        .durationMs(60L)
                        .status("SUCCESS")
                        .build();
                trace.getTools().add(tool2);
            }

            traces.add(trace);
        }

        return traces;
    }
}
