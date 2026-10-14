package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenMetrics {
    private long totalInputTokens;
    private long totalOutputTokens;
    private long totalTokens;
    private double avgTokensPerInteraction;
    private double avgTokensPerSecond;
}
