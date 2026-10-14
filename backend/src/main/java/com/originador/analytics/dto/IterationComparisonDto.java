package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IterationComparisonDto {

    private IterationMetricsSummary baseIteration;

    private IterationMetricsSummary targetIteration;

    private ComparisonDeltas deltas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IterationMetricsSummary {
        private String iterationId;
        private String name;
        private double avgLatencyMs;
        private double avgTotalTokens;
        private double avgTokensPerSecond;
        private double errorRatePercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonDeltas {
        private double latencyDeltaPercentage;
        private double tokensDeltaPercentage;
        private double speedupPercentage;
        private double errorRateDelta;
    }
}
