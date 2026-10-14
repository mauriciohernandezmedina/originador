package com.originador.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchIngestResponse {

    private int receivedCount;

    private int savedCount;

    private int errorsCount;
}
