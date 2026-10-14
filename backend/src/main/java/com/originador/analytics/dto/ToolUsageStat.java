package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolUsageStat {
    private String toolName;
    private long callCount;
    private double avgDurationMs;
    private long totalDurationMs;
}
