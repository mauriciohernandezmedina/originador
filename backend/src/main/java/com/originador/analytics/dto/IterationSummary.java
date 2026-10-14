package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IterationSummary {

    private String id;

    private String name;

    private String description;

    private long totalInteractions;

    private double avgLatencyMs;

    private double avgTokensPerSecond;

    private double successRate;

    private Instant firstSeenAt;

    private Instant lastSeenAt;
}
