package com.originador.analytics.service;

import com.originador.analytics.dto.LatencyMetrics;
import com.originador.analytics.dto.PerformanceSummaryDto;
import com.originador.analytics.dto.TimeSeriesPointDto;
import com.originador.analytics.dto.TokenMetrics;
import com.originador.analytics.dto.ToolUsageStat;
import com.originador.analytics.model.InteractionTrace;
import com.originador.analytics.repository.InteractionTraceRepository;
import com.originador.analytics.repository.ToolInvocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MetricsCalculationService {

    private final InteractionTraceRepository traceRepository;
    private final ToolInvocationRepository toolRepository;

    @Transactional(readOnly = true)
    public PerformanceSummaryDto getPerformanceSummary(String iterationId, String timeRange) {
        Instant since = calculateSinceTimestamp(timeRange);

        List<Long> sortedLatencies;
        if (since != null) {
            sortedLatencies = traceRepository.findLatenciesSortedSince(since);
        } else {
            sortedLatencies = traceRepository.findLatenciesSorted(iterationId);
        }

        long total = traceRepository.countTraces(iterationId);
        long success = traceRepository.countSuccessTraces(iterationId);
        long errors = traceRepository.countErrorTraces(iterationId);

        long inputTokens = traceRepository.sumInputTokens(iterationId);
        long outputTokens = traceRepository.sumOutputTokens(iterationId);
        long totalTokens = inputTokens + outputTokens;

        double avgTps = traceRepository.avgTokensPerSecond(iterationId);
        double avgTokensPerInteraction = total > 0 ? (double) totalTokens / total : 0.0;

        LatencyMetrics latencyMetrics = calculateLatencyMetrics(sortedLatencies);
        double errorRate = calculateErrorRate(total, errors);

        TokenMetrics tokenMetrics = TokenMetrics.builder()
                .totalInputTokens(inputTokens)
                .totalOutputTokens(outputTokens)
                .totalTokens(totalTokens)
                .avgTokensPerInteraction(Math.round(avgTokensPerInteraction * 10.0) / 10.0)
                .avgTokensPerSecond(Math.round(avgTps * 100.0) / 100.0)
                .build();

        List<ToolInvocationRepository.ToolUsageStats> toolStats = toolRepository.getToolUsageStats(iterationId);
        List<ToolUsageStat> toolUsageList = new ArrayList<>();
        if (toolStats != null) {
            for (ToolInvocationRepository.ToolUsageStats stat : toolStats) {
                toolUsageList.add(ToolUsageStat.builder()
                        .toolName(stat.getToolName())
                        .callCount(stat.getCallCount())
                        .avgDurationMs(Math.round(stat.getAvgDurationMs() * 10.0) / 10.0)
                        .totalDurationMs(stat.getTotalDurationMs())
                        .build());
            }
        }

        List<InteractionTrace> timeSeriesTraces;
        if (iterationId != null && !iterationId.isBlank() && since != null) {
            timeSeriesTraces = traceRepository.findTracesForTimeSeriesByIterationAndSince(iterationId, since);
        } else if (since != null) {
            timeSeriesTraces = traceRepository.findTracesForTimeSeriesSince(since);
        } else {
            timeSeriesTraces = traceRepository.findTracesForTimeSeries(iterationId);
        }
        List<TimeSeriesPointDto> timeSeriesPoints = new ArrayList<>();
        if (timeSeriesTraces != null) {
            for (InteractionTrace t : timeSeriesTraces) {
                timeSeriesPoints.add(TimeSeriesPointDto.builder()
                        .traceId(t.getId())
                        .timestamp(t.getStartedAt() != null ? t.getStartedAt() : t.getCreatedAt())
                        .latencyMs(t.getLatencyMs())
                        .tokensPerSecond(t.getTokensPerSecond())
                        .totalTokens(t.getTotalTokens())
                        .modelName(t.getModelName())
                        .status(t.getStatus())
                        .build());
            }
        }

        return PerformanceSummaryDto.builder()
                .iterationId(iterationId)
                .totalInteractions(total)
                .successCount(success)
                .errorCount(errors)
                .errorRatePercentage(errorRate)
                .latencyMetrics(latencyMetrics)
                .tokenMetrics(tokenMetrics)
                .toolUsage(toolUsageList)
                .timeSeries(timeSeriesPoints)
                .build();
    }

    public static LatencyMetrics calculateLatencyMetrics(List<Long> sortedLatencies) {
        if (sortedLatencies == null || sortedLatencies.isEmpty()) {
            return LatencyMetrics.builder()
                    .minMs(0L)
                    .avgMs(0.0)
                    .p50Ms(0L)
                    .p90Ms(0L)
                    .p95Ms(0L)
                    .maxMs(0L)
                    .build();
        }

        long min = sortedLatencies.get(0);
        long max = sortedLatencies.get(sortedLatencies.size() - 1);

        double sum = 0;
        for (long val : sortedLatencies) {
            sum += val;
        }
        double avg = Math.round((sum / sortedLatencies.size()) * 10.0) / 10.0;

        long p50 = getPercentile(sortedLatencies, 0.50);
        long p90 = getPercentile(sortedLatencies, 0.90);
        long p95 = getPercentile(sortedLatencies, 0.95);

        return LatencyMetrics.builder()
                .minMs(min)
                .avgMs(avg)
                .p50Ms(p50)
                .p90Ms(p90)
                .p95Ms(p95)
                .maxMs(max)
                .build();
    }

    public static long getPercentile(List<Long> sortedValues, double percentile) {
        if (sortedValues == null || sortedValues.isEmpty()) {
            return 0L;
        }
        int index = (int) Math.ceil(percentile * sortedValues.size()) - 1;
        index = Math.max(0, Math.min(index, sortedValues.size() - 1));
        return sortedValues.get(index);
    }

    public static double calculateErrorRate(long total, long errors) {
        if (total <= 0) {
            return 0.0;
        }
        double rate = ((double) errors / total) * 100.0;
        return Math.round(rate * 100.0) / 100.0;
    }

    private Instant calculateSinceTimestamp(String timeRange) {
        if (timeRange == null || timeRange.isBlank() || "all".equalsIgnoreCase(timeRange)) {
            return null;
        }
        Instant now = Instant.now();
        return switch (timeRange.toLowerCase()) {
            case "1h" -> now.minus(Duration.ofHours(1));
            case "24h" -> now.minus(Duration.ofHours(24));
            case "7d" -> now.minus(Duration.ofDays(7));
            case "30d" -> now.minus(Duration.ofDays(30));
            default -> null;
        };
    }
}
