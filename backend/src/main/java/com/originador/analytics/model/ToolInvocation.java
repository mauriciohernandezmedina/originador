package com.originador.analytics.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tool_invocations", indexes = {
    @Index(name = "idx_tools_trace_id", columnList = "trace_id"),
    @Index(name = "idx_tools_name", columnList = "tool_name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolInvocation {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // UUID

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trace_id", nullable = false)
    private InteractionTrace trace;

    @Column(name = "tool_name", length = 128, nullable = false)
    private String toolName;

    @Column(name = "input_arguments", columnDefinition = "TEXT")
    private String inputArguments;

    @Column(name = "output_result", columnDefinition = "TEXT")
    private String outputResult;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at", nullable = false)
    private Instant endedAt;

    @Column(name = "duration_ms", nullable = false)
    private long durationMs;

    @Column(name = "status", length = 32, nullable = false)
    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS, ERROR

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
