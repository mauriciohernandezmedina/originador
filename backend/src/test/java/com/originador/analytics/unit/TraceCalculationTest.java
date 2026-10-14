package com.originador.analytics.unit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Trace Calculation Unit Tests")
public class TraceCalculationTest {

    public static long calculateLatencyMs(Instant startedAt, Instant endedAt) {
        if (startedAt == null || endedAt == null) {
            return 0L;
        }
        long ms = Duration.between(startedAt, endedAt).toMillis();
        return Math.max(0L, ms);
    }

    public static double calculateTokensPerSecond(int outputTokens, long latencyMs) {
        if (outputTokens <= 0 || latencyMs <= 0) {
            return 0.0;
        }
        double seconds = latencyMs / 1000.0;
        double tps = outputTokens / seconds;
        return Math.round(tps * 100.0) / 100.0; // Round to 2 decimal places
    }

    @Test
    @DisplayName("Calculate latency correctly between timestamps")
    void testLatencyCalculation() {
        Instant start = Instant.parse("2026-10-14T10:00:00.000Z");
        Instant end = Instant.parse("2026-10-14T10:00:01.250Z");

        long latency = calculateLatencyMs(start, end);

        assertEquals(1250L, latency, "Latency should be 1250 milliseconds");
    }

    @Test
    @DisplayName("Calculate throughput (tokens/second) accurately")
    void testTokensPerSecondCalculation() {
        int outputTokens = 125;
        long latencyMs = 2500L; // 2.5 seconds

        double tps = calculateTokensPerSecond(outputTokens, latencyMs);

        assertEquals(50.0, tps, "125 tokens in 2.5s should yield 50.0 tokens/second");
    }

    @Test
    @DisplayName("Handle edge cases: zero latency and negative tokens gracefully")
    void testEdgeCases() {
        Instant start = Instant.now();
        Instant end = start; // 0 ms latency

        long latency = calculateLatencyMs(start, end);
        double tps = calculateTokensPerSecond(50, latency);

        assertEquals(0L, latency);
        assertEquals(0.0, tps, "Zero latency should prevent division by zero and return 0.0");

        double zeroTokensTps = calculateTokensPerSecond(0, 1000L);
        assertEquals(0.0, zeroTokensTps, "Zero tokens should yield 0.0 tokens/second");
    }
}
