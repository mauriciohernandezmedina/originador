package com.originador.analytics.controller;

import com.originador.analytics.dto.BatchIngestResponse;
import com.originador.analytics.dto.PaginatedTracesResponse;
import com.originador.analytics.dto.TraceDetailResponse;
import com.originador.analytics.dto.TraceIngestRequest;
import com.originador.analytics.dto.TraceResponse;
import com.originador.analytics.service.TraceIngestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/traces")
@RequiredArgsConstructor
public class TraceController {

    private final TraceIngestionService traceIngestionService;

    @PostMapping
    public ResponseEntity<TraceResponse> ingestTrace(@Valid @RequestBody TraceIngestRequest request) {
        TraceResponse response = traceIngestionService.ingestTrace(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<BatchIngestResponse> ingestBatch(@Valid @RequestBody List<TraceIngestRequest> requests) {
        BatchIngestResponse response = traceIngestionService.ingestBatch(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PaginatedTracesResponse> listTraces(
            @RequestParam(value = "iterationId", required = false) String iterationId,
            @RequestParam(value = "modelName", required = false) String modelName,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "minLatency", required = false) Long minLatency,
            @RequestParam(value = "maxLatency", required = false) Long maxLatency,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        PaginatedTracesResponse response = traceIngestionService.getTraces(
                iterationId, modelName, status, minLatency, maxLatency, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TraceDetailResponse> getTraceById(@PathVariable("id") String id) {
        TraceDetailResponse response = traceIngestionService.getTraceById(id);
        return ResponseEntity.ok(response);
    }
}

