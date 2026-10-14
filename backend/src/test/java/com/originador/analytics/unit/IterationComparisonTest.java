package com.originador.analytics.unit;

import com.originador.analytics.dto.IterationComparisonDto;
import com.originador.analytics.service.IterationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Iteration Comparison Unit Tests")
public class IterationComparisonTest {

    @Test
    @DisplayName("Calculate latency, token, and speedup deltas accurately")
    void testDeltasCalculation() {
        IterationComparisonDto.IterationMetricsSummary base = IterationComparisonDto.IterationMetricsSummary.builder()
                .iterationId("v1-baseline")
                .name("Baseline Prompt")
                .avgLatencyMs(2000.0)
                .avgTotalTokens(500.0)
                .avgTokensPerSecond(25.0)
                .errorRatePercentage(5.0)
                .build();

        IterationComparisonDto.IterationMetricsSummary target = IterationComparisonDto.IterationMetricsSummary.builder()
                .iterationId("v2-optimized")
                .name("Optimized Prompt")
                .avgLatencyMs(1500.0) // 25% faster (latency reduced)
                .avgTotalTokens(350.0) // 30% fewer tokens
                .avgTokensPerSecond(35.0) // 40% speedup
                .errorRatePercentage(2.0) // -3% absolute error drop
                .build();

        IterationComparisonDto.ComparisonDeltas deltas = IterationService.calculateDeltas(base, target);

        assertEquals(-25.0, deltas.getLatencyDeltaPercentage(), 0.01, "Latency delta should be -25%");
        assertEquals(-30.0, deltas.getTokensDeltaPercentage(), 0.01, "Tokens delta should be -30%");
        assertEquals(40.0, deltas.getSpeedupPercentage(), 0.01, "Throughput speedup should be +40%");
        assertEquals(-3.0, deltas.getErrorRateDelta(), 0.01, "Error rate delta should be -3.0");
    }

    @Test
    @DisplayName("Handle zero baseline values safely without NaN or Infinity")
    void testZeroBaselineHandling() {
        IterationComparisonDto.IterationMetricsSummary base = IterationComparisonDto.IterationMetricsSummary.builder()
                .avgLatencyMs(0.0)
                .avgTotalTokens(0.0)
                .avgTokensPerSecond(0.0)
                .errorRatePercentage(0.0)
                .build();

        IterationComparisonDto.IterationMetricsSummary target = IterationComparisonDto.IterationMetricsSummary.builder()
                .avgLatencyMs(100.0)
                .avgTotalTokens(50.0)
                .avgTokensPerSecond(10.0)
                .errorRatePercentage(0.0)
                .build();

        IterationComparisonDto.ComparisonDeltas deltas = IterationService.calculateDeltas(base, target);

        assertEquals(0.0, deltas.getLatencyDeltaPercentage());
        assertEquals(0.0, deltas.getTokensDeltaPercentage());
        assertEquals(0.0, deltas.getSpeedupPercentage());
        assertEquals(0.0, deltas.getErrorRateDelta());
    }
}
