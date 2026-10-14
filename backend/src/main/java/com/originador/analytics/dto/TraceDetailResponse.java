package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraceDetailResponse {
    private String id;
    private String iterationId;
    private String modelName;
    private Long latencyMs;
    private Double tokensPerSecond;
    private String status;
    private Instant createdAt;
    private String promptText;
    private String responseText;
    private Integer inputTokens;
    private Integer outputTokens;
    private Integer totalTokens;
    private Instant startedAt;
    private Instant endedAt;
    private String errorMessage;
    private List<ToolInvocationDetailDto> tools;
}
