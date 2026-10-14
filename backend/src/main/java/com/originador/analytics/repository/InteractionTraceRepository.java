package com.originador.analytics.repository;

import com.originador.analytics.model.InteractionTrace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface InteractionTraceRepository extends JpaRepository<InteractionTrace, String>, JpaSpecificationExecutor<InteractionTrace> {

    boolean existsByIterationIdAndClientTraceId(String iterationId, String clientTraceId);

    Optional<InteractionTrace> findByIterationIdAndClientTraceId(String iterationId, String clientTraceId);

    Page<InteractionTrace> findByIterationId(String iterationId, Pageable pageable);

    @Query("SELECT t.latencyMs FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId) ORDER BY t.latencyMs ASC")
    List<Long> findLatenciesSorted(@Param("iterationId") String iterationId);

    @Query("SELECT t.latencyMs FROM InteractionTrace t WHERE t.startedAt >= :since ORDER BY t.latencyMs ASC")
    List<Long> findLatenciesSortedSince(@Param("since") Instant since);

    @Query("SELECT COUNT(t) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId)")
    long countTraces(@Param("iterationId") String iterationId);

    @Query("SELECT COUNT(t) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId) AND t.status = 'SUCCESS'")
    long countSuccessTraces(@Param("iterationId") String iterationId);

    @Query("SELECT COUNT(t) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId) AND t.status != 'SUCCESS'")
    long countErrorTraces(@Param("iterationId") String iterationId);

    @Query("SELECT COALESCE(SUM(t.inputTokens), 0) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId)")
    long sumInputTokens(@Param("iterationId") String iterationId);

    @Query("SELECT COALESCE(SUM(t.outputTokens), 0) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId)")
    long sumOutputTokens(@Param("iterationId") String iterationId);

    @Query("SELECT COALESCE(AVG(t.tokensPerSecond), 0.0) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId) AND t.status = 'SUCCESS'")
    double avgTokensPerSecond(@Param("iterationId") String iterationId);

    @Query("SELECT COALESCE(AVG(t.latencyMs), 0.0) FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId)")
    double avgLatencyMs(@Param("iterationId") String iterationId);

    @Query("SELECT t FROM InteractionTrace t WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId) ORDER BY t.startedAt ASC")
    List<InteractionTrace> findTracesForTimeSeries(@Param("iterationId") String iterationId);

    @Query("SELECT t FROM InteractionTrace t WHERE t.startedAt >= :since ORDER BY t.startedAt ASC")
    List<InteractionTrace> findTracesForTimeSeriesSince(@Param("since") Instant since);

    @Query("SELECT t FROM InteractionTrace t WHERE t.iteration.id = :iterationId AND t.startedAt >= :since ORDER BY t.startedAt ASC")
    List<InteractionTrace> findTracesForTimeSeriesByIterationAndSince(@Param("iterationId") String iterationId, @Param("since") Instant since);
}
