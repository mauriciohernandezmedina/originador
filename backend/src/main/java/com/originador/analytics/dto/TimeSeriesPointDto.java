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
public class TimeSeriesPointDto {

    private String traceId;

    private Instant timestamp;

    private long latencyMs;

    private double tokensPerSecond;

    private int totalTokens;

    private String modelName;

    private String status;
}
