package com.originador.analytics.controller;

import com.originador.analytics.dto.IterationComparisonDto;
import com.originador.analytics.dto.IterationSummary;
import com.originador.analytics.dto.UpdateIterationRequest;
import com.originador.analytics.service.IterationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/iterations")
@RequiredArgsConstructor
public class IterationController {

    private final IterationService iterationService;

    @GetMapping
    public ResponseEntity<List<IterationSummary>> listIterations() {
        return ResponseEntity.ok(iterationService.listIterations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IterationSummary> getIteration(@PathVariable("id") String id) {
        return ResponseEntity.ok(iterationService.getIteration(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IterationSummary> updateIteration(
            @PathVariable("id") String id,
            @RequestBody UpdateIterationRequest request) {
        return ResponseEntity.ok(iterationService.updateIteration(id, request));
    }

    @GetMapping("/compare")
    public ResponseEntity<IterationComparisonDto> compareIterations(
            @RequestParam("baseId") String baseId,
            @RequestParam("targetId") String targetId) {
        return ResponseEntity.ok(iterationService.compareIterations(baseId, targetId));
    }
}
