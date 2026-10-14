package com.originador.analytics.repository;

import com.originador.analytics.model.ToolInvocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToolInvocationRepository extends JpaRepository<ToolInvocation, String> {

    List<ToolInvocation> findByTraceIdOrderByStartedAtAsc(String traceId);

    @Query("SELECT ti.toolName AS toolName, COUNT(ti) AS callCount, AVG(ti.durationMs) AS avgDurationMs, SUM(ti.durationMs) AS totalDurationMs " +
           "FROM ToolInvocation ti JOIN ti.trace t " +
           "WHERE (:iterationId IS NULL OR t.iteration.id = :iterationId) " +
           "GROUP BY ti.toolName " +
           "ORDER BY COUNT(ti) DESC")
    List<ToolUsageStats> getToolUsageStats(@Param("iterationId") String iterationId);

    interface ToolUsageStats {
        String getToolName();
        long getCallCount();
        double getAvgDurationMs();
        long getTotalDurationMs();
    }
}
