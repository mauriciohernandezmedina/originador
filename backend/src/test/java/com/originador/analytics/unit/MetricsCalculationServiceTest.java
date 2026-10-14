package com.originador.analytics.unit;

import com.originador.analytics.dto.LatencyMetrics;
import com.originador.analytics.service.MetricsCalculationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Metrics Calculation Service Unit Tests")
public class MetricsCalculationServiceTest {

    @Test
    @DisplayName("Calculate percentiles accurately for a known distribution")
    void testPercentileCalculation() {
        // 10 sorted values: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000
        List<Long> latencies = List.of(100L, 200L, 300L, 400L, 500L, 600L, 700L, 800L, 900L, 1000L);

        LatencyMetrics metrics = MetricsCalculationService.calculateLatencyMetrics(latencies);

        assertEquals(100L, metrics.getMinMs());
        assertEquals(1000L, metrics.getMaxMs());
        assertEquals(550.0, metrics.getAvgMs(), 0.01);
        assertEquals(500L, metrics.getP50Ms(), "Median (p50) should be 500ms");
        assertEquals(900L, metrics.getP90Ms(), "90th percentile should be 900ms");
        assertEquals(1000L, metrics.getP95Ms(), "95th percentile should be 1000ms");
    }

    @Test
    @DisplayName("Handle empty latency list gracefully")
    void testEmptyLatencyList() {
        LatencyMetrics metrics = MetricsCalculationService.calculateLatencyMetrics(Collections.emptyList());

        assertEquals(0L, metrics.getMinMs());
        assertEquals(0L, metrics.getMaxMs());
        assertEquals(0.0, metrics.getAvgMs());
        assertEquals(0L, metrics.getP50Ms());
        assertEquals(0L, metrics.getP90Ms());
        assertEquals(0L, metrics.getP95Ms());
    }

    @Test
    @DisplayName("Calculate error rate percentage correctly")
    void testErrorRatePercentage() {
        long total = 200;
        long errors = 10;

        double rate = MetricsCalculationService.calculateErrorRate(total, errors);

        assertEquals(5.0, rate, 0.01, "10 errors in 200 requests should be 5.0%");

        assertEquals(0.0, MetricsCalculationService.calculateErrorRate(0, 0));
    }
}
