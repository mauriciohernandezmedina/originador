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
public class TraceResponse {

    private String id;

    private String iterationId;

    private String modelName;

    private long latencyMs;

    private double tokensPerSecond;

    private String status;

    private Instant createdAt;
}
