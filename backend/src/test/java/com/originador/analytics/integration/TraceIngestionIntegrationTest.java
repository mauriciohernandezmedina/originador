package com.originador.analytics.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.originador.analytics.dto.BatchIngestResponse;
import com.originador.analytics.dto.TraceIngestRequest;
import com.originador.analytics.dto.TraceResponse;
import com.originador.analytics.service.TraceIngestionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Trace Ingestion Integration Tests")
public class TraceIngestionIntegrationTest {

    private static final String API_KEY = "originador-llm-secret-key-2026";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TraceIngestionService traceIngestionService;

    @Test
    @DisplayName("Reject request when X-API-Key header is missing (401)")
    void testMissingApiKeyReturns401() throws Exception {
        TraceIngestRequest request = TraceIngestRequest.builder()
                .iterationId("test-iter")
                .modelName("gpt-4o")
                .promptText("Hola mundo")
                .inputTokens(10)
                .outputTokens(20)
                .startedAt(Instant.now())
                .endedAt(Instant.now().plusMillis(500))
                .build();

        mockMvc.perform(post("/api/v1/traces")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Accept valid trace ingestion when X-API-Key is provided (201)")
    void testValidTraceIngestionReturns201() throws Exception {
        TraceIngestRequest request = TraceIngestRequest.builder()
                .iterationId("test-iter")
                .modelName("gpt-4o")
                .promptText("¿Cuál es la capital de España?")
                .responseText("Madrid")
                .inputTokens(15)
                .outputTokens(5)
                .startedAt(Instant.now())
                .endedAt(Instant.now().plusMillis(400))
                .build();

        TraceResponse mockResponse = TraceResponse.builder()
                .id("trace-uuid-1")
                .iterationId("test-iter")
                .modelName("gpt-4o")
                .latencyMs(400L)
                .tokensPerSecond(12.5)
                .status("SUCCESS")
                .createdAt(Instant.now())
                .build();

        when(traceIngestionService.ingestTrace(any(TraceIngestRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/traces")
                        .header("X-API-Key", API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("trace-uuid-1"))
                .andExpect(jsonPath("$.iterationId").value("test-iter"))
                .andExpect(jsonPath("$.latencyMs").value(400))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Reject invalid request with missing mandatory fields (400)")
    void testInvalidTracePayloadReturns400() throws Exception {
        TraceIngestRequest invalidRequest = TraceIngestRequest.builder()
                .modelName("") // Blank model
                .promptText("") // Blank prompt
                .inputTokens(-5) // Negative tokens
                .build();

        mockMvc.perform(post("/api/v1/traces")
                        .header("X-API-Key", API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    @DisplayName("Reject invalid request where endedAt is before startedAt (400)")
    void testInvertedDatesReturns400() throws Exception {
        Instant now = Instant.now();
        TraceIngestRequest requestWithInvertedDates = TraceIngestRequest.builder()
                .iterationId("test-iter")
                .modelName("gpt-4o")
                .promptText("Prompt de prueba")
                .inputTokens(10)
                .outputTokens(20)
                .startedAt(now)
                .endedAt(now.minusSeconds(30)) // endedAt is before startedAt
                .build();

        mockMvc.perform(post("/api/v1/traces")
                        .header("X-API-Key", API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestWithInvertedDates)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Process batch ingestion successfully (201)")
    void testBatchIngestionReturns201() throws Exception {
        TraceIngestRequest request1 = TraceIngestRequest.builder()
                .iterationId("batch-iter")
                .modelName("claude-3-5-sonnet")
                .promptText("Prompt 1")
                .inputTokens(20)
                .outputTokens(30)
                .startedAt(Instant.now())
                .endedAt(Instant.now().plusMillis(600))
                .build();

        BatchIngestResponse batchResponse = BatchIngestResponse.builder()
                .receivedCount(1)
                .savedCount(1)
                .errorsCount(0)
                .build();

        when(traceIngestionService.ingestBatch(any())).thenReturn(batchResponse);

        mockMvc.perform(post("/api/v1/traces/batch")
                        .header("X-API-Key", API_KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(request1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.receivedCount").value(1))
                .andExpect(jsonPath("$.savedCount").value(1))
                .andExpect(jsonPath("$.errorsCount").value(0));
    }
}
