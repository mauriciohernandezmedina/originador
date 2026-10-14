package com.originador.analytics.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraceIngestRequest {

    private String clientTraceId;

    @NotBlank(message = "iterationId es obligatorio")
    private String iterationId;

    @NotBlank(message = "modelName es obligatorio")
    private String modelName;

    @NotBlank(message = "promptText es obligatorio")
    private String promptText;

    private String responseText;

    @Min(value = 0, message = "inputTokens no puede ser negativo")
    private int inputTokens;

    @Min(value = 0, message = "outputTokens no puede ser negativo")
    private int outputTokens;

    @NotNull(message = "startedAt es obligatorio")
    private Instant startedAt;

    @NotNull(message = "endedAt es obligatorio")
    private Instant endedAt;

    @Builder.Default
    private String status = "SUCCESS";

    private String errorMessage;

    @Valid
    @Builder.Default
    private List<ToolInvocationDto> tools = new ArrayList<>();
}
