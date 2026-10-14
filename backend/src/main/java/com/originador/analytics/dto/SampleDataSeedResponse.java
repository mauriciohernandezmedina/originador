package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SampleDataSeedResponse {
    private String message;
    private int seededIterations;
    private int seededTraces;
}
