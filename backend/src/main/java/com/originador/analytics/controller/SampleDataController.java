package com.originador.analytics.controller;

import com.originador.analytics.dto.SampleDataSeedResponse;
import com.originador.analytics.service.SampleDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sample-data")
@RequiredArgsConstructor
public class SampleDataController {

    private final SampleDataService sampleDataService;

    @PostMapping("/seed")
    public ResponseEntity<SampleDataSeedResponse> seedSampleData() {
        SampleDataSeedResponse response = sampleDataService.seedSampleData();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Void> resetSampleData() {
        sampleDataService.resetSampleData();
        return ResponseEntity.ok().build();
    }
}
