package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LatencyMetrics {
    private long minMs;
    private double avgMs;
    private long p50Ms;
    private long p90Ms;
    private long p95Ms;
    private long maxMs;
}
