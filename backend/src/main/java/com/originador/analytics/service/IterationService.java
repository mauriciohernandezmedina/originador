package com.originador.analytics.service;

import com.originador.analytics.dto.IterationComparisonDto;
import com.originador.analytics.dto.IterationSummary;
import com.originador.analytics.dto.PerformanceSummaryDto;
import com.originador.analytics.dto.UpdateIterationRequest;
import com.originador.analytics.model.IterationRun;
import com.originador.analytics.repository.InteractionTraceRepository;
import com.originador.analytics.repository.IterationRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IterationService {

    private final IterationRunRepository iterationRepository;
    private final InteractionTraceRepository traceRepository;
    private final MetricsCalculationService metricsCalculationService;

    @Transactional(readOnly = true)
    public List<IterationSummary> listIterations() {
        List<IterationRun> runs = iterationRepository.findAllByOrderByCreatedAtDesc();
        List<IterationSummary> summaries = new ArrayList<>();

        for (IterationRun run : runs) {
            summaries.add(buildIterationSummary(run));
        }

        return summaries;
    }

    @Transactional(readOnly = true)
    public IterationSummary getIteration(String id) {
        IterationRun run = iterationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Iteración no encontrada: " + id));
        return buildIterationSummary(run);
    }

    @Transactional
    public IterationSummary updateIteration(String id, UpdateIterationRequest request) {
        IterationRun run = iterationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Iteración no encontrada: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            run.setName(request.getName());
        }
        if (request.getDescription() != null) {
            run.setDescription(request.getDescription());
        }
        run.setUpdatedAt(Instant.now());

        IterationRun saved = iterationRepository.save(run);
        return buildIterationSummary(saved);
    }

    @Transactional(readOnly = true)
    public IterationComparisonDto compareIterations(String baseId, String targetId) {
        IterationRun baseRun = iterationRepository.findById(baseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Iteración base no encontrada: " + baseId));
        IterationRun targetRun = iterationRepository.findById(targetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Iteración objetivo no encontrada: " + targetId));

        PerformanceSummaryDto baseStats = metricsCalculationService.getPerformanceSummary(baseId, null);
        PerformanceSummaryDto targetStats = metricsCalculationService.getPerformanceSummary(targetId, null);

        IterationComparisonDto.IterationMetricsSummary baseSummary = IterationComparisonDto.IterationMetricsSummary.builder()
                .iterationId(baseId)
                .name(baseRun.getName())
                .avgLatencyMs(baseStats.getLatencyMetrics().getAvgMs())
                .avgTotalTokens(baseStats.getTokenMetrics().getAvgTokensPerInteraction())
                .avgTokensPerSecond(baseStats.getTokenMetrics().getAvgTokensPerSecond())
                .errorRatePercentage(baseStats.getErrorRatePercentage())
                .build();

        IterationComparisonDto.IterationMetricsSummary targetSummary = IterationComparisonDto.IterationMetricsSummary.builder()
                .iterationId(targetId)
                .name(targetRun.getName())
                .avgLatencyMs(targetStats.getLatencyMetrics().getAvgMs())
                .avgTotalTokens(targetStats.getTokenMetrics().getAvgTokensPerInteraction())
                .avgTokensPerSecond(targetStats.getTokenMetrics().getAvgTokensPerSecond())
                .errorRatePercentage(targetStats.getErrorRatePercentage())
                .build();

        IterationComparisonDto.ComparisonDeltas deltas = calculateDeltas(baseSummary, targetSummary);

        return IterationComparisonDto.builder()
                .baseIteration(baseSummary)
                .targetIteration(targetSummary)
                .deltas(deltas)
                .build();
    }

    public static IterationComparisonDto.ComparisonDeltas calculateDeltas(
            IterationComparisonDto.IterationMetricsSummary base,
            IterationComparisonDto.IterationMetricsSummary target) {

        double latencyDelta = calculatePercentageChange(base.getAvgLatencyMs(), target.getAvgLatencyMs());
        double tokensDelta = calculatePercentageChange(base.getAvgTotalTokens(), target.getAvgTotalTokens());
        double speedup = calculatePercentageChange(base.getAvgTokensPerSecond(), target.getAvgTokensPerSecond());
        double errorDelta = Math.round((target.getErrorRatePercentage() - base.getErrorRatePercentage()) * 100.0) / 100.0;

        return IterationComparisonDto.ComparisonDeltas.builder()
                .latencyDeltaPercentage(latencyDelta)
                .tokensDeltaPercentage(tokensDelta)
                .speedupPercentage(speedup)
                .errorRateDelta(errorDelta)
                .build();
    }

    private static double calculatePercentageChange(double baseVal, double targetVal) {
        if (baseVal <= 0.0) {
            return 0.0;
        }
        double change = ((targetVal - baseVal) / baseVal) * 100.0;
        return Math.round(change * 100.0) / 100.0;
    }

    private IterationSummary buildIterationSummary(IterationRun run) {
        long total = traceRepository.countTraces(run.getId());
        long success = traceRepository.countSuccessTraces(run.getId());
        double avgLatency = traceRepository.avgLatencyMs(run.getId());
        double avgTps = traceRepository.avgTokensPerSecond(run.getId());
        double successRate = total > 0 ? (double) success / total * 100.0 : 100.0;

        return IterationSummary.builder()
                .id(run.getId())
                .name(run.getName())
                .description(run.getDescription())
                .totalInteractions(total)
                .avgLatencyMs(Math.round(avgLatency * 10.0) / 10.0)
                .avgTokensPerSecond(Math.round(avgTps * 100.0) / 100.0)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .firstSeenAt(run.getCreatedAt())
                .lastSeenAt(run.getUpdatedAt())
                .build();
    }
}
