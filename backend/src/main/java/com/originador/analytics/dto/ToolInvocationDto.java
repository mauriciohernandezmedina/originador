package com.originador.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolInvocationDto {

    @NotBlank(message = "toolName es obligatorio")
    private String toolName;

    private String inputArguments;

    private String outputResult;

    @NotNull(message = "startedAt es obligatorio")
    private Instant startedAt;

    @NotNull(message = "endedAt es obligatorio")
    private Instant endedAt;

    @Builder.Default
    private String status = "SUCCESS";

    private String errorMessage;
}
