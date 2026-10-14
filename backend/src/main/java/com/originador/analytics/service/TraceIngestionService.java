package com.originador.analytics.service;

import com.originador.analytics.dto.BatchIngestResponse;
import com.originador.analytics.dto.PaginatedTracesResponse;
import com.originador.analytics.dto.ToolInvocationDetailDto;
import com.originador.analytics.dto.ToolInvocationDto;
import com.originador.analytics.dto.TraceDetailResponse;
import com.originador.analytics.dto.TraceIngestRequest;
import com.originador.analytics.dto.TraceResponse;
import com.originador.analytics.model.InteractionTrace;
import com.originador.analytics.model.IterationRun;
import com.originador.analytics.model.ToolInvocation;
import com.originador.analytics.repository.InteractionTraceRepository;
import com.originador.analytics.repository.IterationRunRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TraceIngestionService {

    private final InteractionTraceRepository traceRepository;
    private final IterationRunRepository iterationRepository;

    @Transactional
    public TraceResponse ingestTrace(TraceIngestRequest request) {
        IterationRun iteration = resolveOrCreateIteration(request.getIterationId());

        // Check idempotency if clientTraceId is present
        if (request.getClientTraceId() != null && !request.getClientTraceId().isBlank()) {
            Optional<InteractionTrace> existing = traceRepository.findByIterationIdAndClientTraceId(
                    request.getIterationId(), request.getClientTraceId());
            if (existing.isPresent()) {
                log.info("Idempotent trace ingestion: trace {} already exists for iteration {}",
                        request.getClientTraceId(), request.getIterationId());
                return mapToResponse(existing.get());
            }
        }

        InteractionTrace trace = mapToEntity(request, iteration);
        InteractionTrace savedTrace = traceRepository.save(trace);
        return mapToResponse(savedTrace);
    }

    @Transactional
    public BatchIngestResponse ingestBatch(List<TraceIngestRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return BatchIngestResponse.builder()
                    .receivedCount(0)
                    .savedCount(0)
                    .errorsCount(0)
                    .build();
        }

        int savedCount = 0;
        int errorsCount = 0;
        List<InteractionTrace> tracesToSave = new ArrayList<>();
        Map<String, IterationRun> iterationCache = new HashMap<>();

        for (TraceIngestRequest req : requests) {
            try {
                String iterId = req.getIterationId();
                IterationRun iteration = iterationCache.computeIfAbsent(iterId, this::resolveOrCreateIteration);

                if (req.getClientTraceId() != null && !req.getClientTraceId().isBlank()) {
                    if (traceRepository.existsByIterationIdAndClientTraceId(iterId, req.getClientTraceId())) {
                        continue; // Skip duplicate idempotent trace
                    }
                }

                InteractionTrace trace = mapToEntity(req, iteration);
                tracesToSave.add(trace);
                savedCount++;
            } catch (Exception ex) {
                log.error("Error preparing trace in batch: {}", ex.getMessage(), ex);
                errorsCount++;
            }
        }

        if (!tracesToSave.isEmpty()) {
            traceRepository.saveAll(tracesToSave);
        }

        return BatchIngestResponse.builder()
                .receivedCount(requests.size())
                .savedCount(savedCount)
                .errorsCount(errorsCount)
                .build();
    }

    @Transactional(readOnly = true)
    public PaginatedTracesResponse getTraces(
            String iterationId,
            String modelName,
            String status,
            Long minLatency,
            Long maxLatency,
            int page,
            int size) {

        int validPage = Math.max(0, page);
        int validSize = Math.min(100, Math.max(1, size));
        Pageable pageable = PageRequest.of(validPage, validSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<InteractionTrace> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (iterationId != null && !iterationId.isBlank()) {
                predicates.add(cb.equal(root.get("iteration").get("id"), iterationId));
            }
            if (modelName != null && !modelName.isBlank()) {
                predicates.add(cb.equal(root.get("modelName"), modelName));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (minLatency != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("latencyMs"), minLatency));
            }
            if (maxLatency != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("latencyMs"), maxLatency));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<InteractionTrace> result = traceRepository.findAll(spec, pageable);

        List<TraceResponse> content = result.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PaginatedTracesResponse.builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public TraceDetailResponse getTraceById(String id) {
        InteractionTrace trace = traceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Traza no encontrada: " + id));

        List<ToolInvocationDetailDto> tools = trace.getTools().stream()
                .map(t -> ToolInvocationDetailDto.builder()
                        .id(t.getId())
                        .toolName(t.getToolName())
                        .inputArguments(t.getInputArguments())
                        .outputResult(t.getOutputResult())
                        .startedAt(t.getStartedAt())
                        .endedAt(t.getEndedAt())
                        .durationMs(t.getDurationMs())
                        .status(t.getStatus())
                        .errorMessage(t.getErrorMessage())
                        .build())
                .toList();

        return TraceDetailResponse.builder()
                .id(trace.getId())
                .iterationId(trace.getIteration().getId())
                .modelName(trace.getModelName())
                .latencyMs(trace.getLatencyMs())
                .tokensPerSecond(trace.getTokensPerSecond())
                .status(trace.getStatus())
                .createdAt(trace.getCreatedAt())
                .promptText(trace.getPromptText())
                .responseText(trace.getResponseText())
                .inputTokens(trace.getInputTokens())
                .outputTokens(trace.getOutputTokens())
                .totalTokens(trace.getTotalTokens())
                .startedAt(trace.getStartedAt())
                .endedAt(trace.getEndedAt())
                .errorMessage(trace.getErrorMessage())
                .tools(tools)
                .build();
    }

    private IterationRun resolveOrCreateIteration(String iterationId) {
        return iterationRepository.findById(iterationId)
                .orElseGet(() -> {
                    log.info("Dynamically creating iteration with tag id: {}", iterationId);
                    IterationRun newRun = IterationRun.builder()
                            .id(iterationId)
                            .name(iterationId)
                            .description("Auto-creado por ingesta de telemetría")
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    return iterationRepository.save(newRun);
                });
    }

    private InteractionTrace mapToEntity(TraceIngestRequest req, IterationRun iteration) {
        long latencyMs = calculateLatencyMs(req.getStartedAt(), req.getEndedAt());
        double tokensPerSecond = calculateTokensPerSecond(req.getOutputTokens(), latencyMs);

        String traceId = UUID.randomUUID().toString();
        InteractionTrace trace = InteractionTrace.builder()
                .id(traceId)
                .iteration(iteration)
                .clientTraceId(req.getClientTraceId())
                .modelName(req.getModelName())
                .promptText(req.getPromptText())
                .responseText(req.getResponseText())
                .inputTokens(req.getInputTokens())
                .outputTokens(req.getOutputTokens())
                .totalTokens(req.getInputTokens() + req.getOutputTokens())
                .startedAt(req.getStartedAt())
                .endedAt(req.getEndedAt())
                .latencyMs(latencyMs)
                .tokensPerSecond(tokensPerSecond)
                .status(req.getStatus() != null ? req.getStatus() : "SUCCESS")
                .errorMessage(req.getErrorMessage())
                .createdAt(Instant.now())
                .build();

        if (req.getTools() != null && !req.getTools().isEmpty()) {
            for (ToolInvocationDto toolDto : req.getTools()) {
                long toolDuration = calculateLatencyMs(toolDto.getStartedAt(), toolDto.getEndedAt());
                ToolInvocation tool = ToolInvocation.builder()
                        .id(UUID.randomUUID().toString())
                        .trace(trace)
                        .toolName(toolDto.getToolName())
                        .inputArguments(toolDto.getInputArguments())
                        .outputResult(toolDto.getOutputResult())
                        .startedAt(toolDto.getStartedAt())
                        .endedAt(toolDto.getEndedAt())
                        .durationMs(toolDuration)
                        .status(toolDto.getStatus() != null ? toolDto.getStatus() : "SUCCESS")
                        .errorMessage(toolDto.getErrorMessage())
                        .build();
                trace.getTools().add(tool);
            }
        }

        return trace;
    }

    private TraceResponse mapToResponse(InteractionTrace trace) {
        return TraceResponse.builder()
                .id(trace.getId())
                .iterationId(trace.getIteration().getId())
                .modelName(trace.getModelName())
                .latencyMs(trace.getLatencyMs())
                .tokensPerSecond(trace.getTokensPerSecond())
                .status(trace.getStatus())
                .createdAt(trace.getCreatedAt())
                .build();
    }

    public static long calculateLatencyMs(Instant startedAt, Instant endedAt) {
        if (startedAt == null || endedAt == null) {
            return 0L;
        }
        return Math.max(0L, Duration.between(startedAt, endedAt).toMillis());
    }

    public static double calculateTokensPerSecond(int outputTokens, long latencyMs) {
        if (outputTokens <= 0 || latencyMs <= 0) {
            return 0.0;
        }
        double seconds = latencyMs / 1000.0;
        double tps = outputTokens / seconds;
        return Math.round(tps * 100.0) / 100.0;
    }
}
