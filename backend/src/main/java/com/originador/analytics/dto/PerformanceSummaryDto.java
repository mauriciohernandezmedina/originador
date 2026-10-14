package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceSummaryDto {

    private String iterationId;

    private long totalInteractions;

    private long successCount;

    private long errorCount;

    private double errorRatePercentage;

    private LatencyMetrics latencyMetrics;

    private TokenMetrics tokenMetrics;

    @Builder.Default
    private List<ToolUsageStat> toolUsage = new ArrayList<>();

    @Builder.Default
    private List<TimeSeriesPointDto> timeSeries = new ArrayList<>();
}
