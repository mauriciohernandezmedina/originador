package com.originador.analytics.controller;

import com.originador.analytics.dto.PerformanceSummaryDto;
import com.originador.analytics.service.MetricsCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsCalculationService metricsService;

    @GetMapping("/summary")
    public ResponseEntity<PerformanceSummaryDto> getGlobalSummary(
            @RequestParam(name = "timeRange", defaultValue = "all", required = false) String timeRange,
            @RequestParam(name = "iterationId", required = false) String iterationId) {
        PerformanceSummaryDto summary = metricsService.getPerformanceSummary(iterationId, timeRange);
        return ResponseEntity.ok(summary);
    }
}
