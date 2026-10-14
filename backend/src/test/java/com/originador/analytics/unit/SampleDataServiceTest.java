package com.originador.analytics.unit;

import com.originador.analytics.dto.SampleDataSeedResponse;
import com.originador.analytics.model.InteractionTrace;
import com.originador.analytics.model.IterationRun;
import com.originador.analytics.repository.InteractionTraceRepository;
import com.originador.analytics.repository.IterationRunRepository;
import com.originador.analytics.repository.ToolInvocationRepository;
import com.originador.analytics.service.SampleDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Sample Data Service Unit Tests")
public class SampleDataServiceTest {

    @Mock
    private IterationRunRepository iterationRepository;

    @Mock
    private InteractionTraceRepository traceRepository;

    @Mock
    private ToolInvocationRepository toolRepository;

    @Captor
    private ArgumentCaptor<List<IterationRun>> iterationsCaptor;

    @Captor
    private ArgumentCaptor<List<InteractionTrace>> tracesCaptor;

    private SampleDataService sampleDataService;

    @BeforeEach
    void setUp() {
        sampleDataService = new SampleDataService(iterationRepository, traceRepository, toolRepository);
    }

    @Test
    @DisplayName("Seed sample data populates 3 iterations and 30+ traces with tools")
    void testSeedSampleData() {
        SampleDataSeedResponse response = sampleDataService.seedSampleData();

        assertNotNull(response);
        assertEquals(3, response.getSeededIterations(), "Should seed exactly 3 iterations");
        assertTrue(response.getSeededTraces() >= 30, "Should seed at least 30 interaction traces");

        verify(iterationRepository).saveAll(iterationsCaptor.capture());
        List<IterationRun> savedIterations = iterationsCaptor.getValue();
        assertEquals(3, savedIterations.size());
        assertTrue(savedIterations.stream().anyMatch(i -> i.getId().equals("v1-prompt-baseline")));
        assertTrue(savedIterations.stream().anyMatch(i -> i.getId().equals("v2-prompt-optimized")));
        assertTrue(savedIterations.stream().anyMatch(i -> i.getId().equals("v3-agentic-tools")));

        verify(traceRepository).saveAll(tracesCaptor.capture());
        List<InteractionTrace> savedTraces = tracesCaptor.getValue();
        assertTrue(savedTraces.size() >= 30);

        // Verify tool invocations exist in v3-agentic-tools traces
        boolean hasTools = savedTraces.stream().anyMatch(t -> !t.getTools().isEmpty());
        assertTrue(hasTools, "Sample traces should contain tool invocations");
    }

    @Test
    @DisplayName("Reset sample data cleans all repositories in cascade order")
    void testResetSampleData() {
        sampleDataService.resetSampleData();

        verify(toolRepository).deleteAllInBatch();
        verify(traceRepository).deleteAllInBatch();
        verify(iterationRepository).deleteAllInBatch();
    }
}
