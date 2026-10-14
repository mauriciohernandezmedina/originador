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
public class ToolInvocationDetailDto {
    private String id;
    private String toolName;
    private String inputArguments;
    private String outputResult;
    private Instant startedAt;
    private Instant endedAt;
    private Long durationMs;
    private String status;
    private String errorMessage;
}
