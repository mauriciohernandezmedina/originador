package com.originador.analytics.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interaction_traces", indexes = {
    @Index(name = "idx_traces_iteration", columnList = "iteration_id"),
    @Index(name = "idx_traces_created_at", columnList = "created_at DESC"),
    @Index(name = "idx_traces_latency", columnList = "latency_ms"),
    @Index(name = "idx_traces_model", columnList = "model_name"),
    @Index(name = "idx_traces_iter_created", columnList = "iteration_id, created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteractionTrace {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // UUID

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "iteration_id", nullable = false)
    private IterationRun iteration;

    @Column(name = "client_trace_id", length = 128)
    private String clientTraceId;

    @Column(name = "model_name", length = 128, nullable = false)
    private String modelName;

    @Column(name = "prompt_text", columnDefinition = "TEXT", nullable = false)
    private String promptText;

    @Column(name = "response_text", columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "input_tokens", nullable = false)
    private int inputTokens;

    @Column(name = "output_tokens", nullable = false)
    private int outputTokens;

    @Column(name = "total_tokens", nullable = false)
    private int totalTokens;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at", nullable = false)
    private Instant endedAt;

    @Column(name = "latency_ms", nullable = false)
    private long latencyMs;

    @Column(name = "tokens_per_second", nullable = false)
    private double tokensPerSecond;

    @Column(name = "status", length = 32, nullable = false)
    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS, ERROR, TIMEOUT, CANCELLED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "trace", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ToolInvocation> tools = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (totalTokens == 0 && (inputTokens > 0 || outputTokens > 0)) {
            totalTokens = inputTokens + outputTokens;
        }
    }
}
