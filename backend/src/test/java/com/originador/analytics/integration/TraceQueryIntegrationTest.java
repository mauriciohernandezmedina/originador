package com.originador.analytics.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.originador.analytics.dto.PaginatedTracesResponse;
import com.originador.analytics.dto.ToolInvocationDetailDto;
import com.originador.analytics.dto.TraceDetailResponse;
import com.originador.analytics.dto.TraceResponse;
import com.originador.analytics.service.TraceIngestionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Trace Query Integration Tests")
public class TraceQueryIntegrationTest {

    private static final String API_KEY = "originador-llm-secret-key-2026";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TraceIngestionService traceIngestionService;

    @Test
    @DisplayName("Reject traces query when X-API-Key is missing (401)")
    void testMissingApiKeyReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/traces")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Return paginated traces with filters when X-API-Key is provided (200)")
    void testListTracesWithFiltersReturns200() throws Exception {
        TraceResponse trace1 = TraceResponse.builder()
                .id("trace-1")
                .iterationId("v1-baseline")
                .modelName("gpt-4o")
                .latencyMs(350L)
                .tokensPerSecond(28.5)
                .status("SUCCESS")
                .createdAt(Instant.now())
                .build();

        PaginatedTracesResponse mockResponse = PaginatedTracesResponse.builder()
                .content(List.of(trace1))
                .page(0)
                .size(20)
                .totalElements(1L)
                .totalPages(1)
                .build();

        when(traceIngestionService.getTraces(
                eq("v1-baseline"), eq("gpt-4o"), eq("SUCCESS"), isNull(), isNull(), eq(0), eq(20)))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/traces")
                        .header("X-API-Key", API_KEY)
                        .param("iterationId", "v1-baseline")
                        .param("modelName", "gpt-4o")
                        .param("status", "SUCCESS")
                        .param("page", "0")
                        .param("size", "20")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value("trace-1"))
                .andExpect(jsonPath("$.content[0].modelName").value("gpt-4o"))
                .andExpect(jsonPath("$.content[0].latencyMs").value(350));
    }

    @Test
    @DisplayName("Return trace detail with tool waterfall breakdown (200)")
    void testGetTraceByIdReturns200() throws Exception {
        ToolInvocationDetailDto tool = ToolInvocationDetailDto.builder()
                .id("tool-1")
                .toolName("calculator")
                .inputArguments("{\"expr\": \"2+2\"}")
                .outputResult("{\"result\": 4}")
                .startedAt(Instant.now())
                .endedAt(Instant.now().plusMillis(50))
                .durationMs(50L)
                .status("SUCCESS")
                .build();

        TraceDetailResponse detailResponse = TraceDetailResponse.builder()
                .id("trace-detail-1")
                .iterationId("v2-tools")
                .modelName("claude-3-5-sonnet")
                .promptText("Calcula 2+2")
                .responseText("El resultado es 4")
                .inputTokens(12)
                .outputTokens(8)
                .totalTokens(20)
                .latencyMs(250L)
                .tokensPerSecond(32.0)
                .status("SUCCESS")
                .startedAt(Instant.now())
                .endedAt(Instant.now().plusMillis(250))
                .createdAt(Instant.now())
                .tools(List.of(tool))
                .build();

        when(traceIngestionService.getTraceById("trace-detail-1")).thenReturn(detailResponse);

        mockMvc.perform(get("/api/v1/traces/trace-detail-1")
                        .header("X-API-Key", API_KEY)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("trace-detail-1"))
                .andExpect(jsonPath("$.promptText").value("Calcula 2+2"))
                .andExpect(jsonPath("$.tools[0].toolName").value("calculator"))
                .andExpect(jsonPath("$.tools[0].durationMs").value(50));
    }

    @Test
    @DisplayName("Return 404 when trace id does not exist")
    void testGetTraceNotFoundReturns404() throws Exception {
        when(traceIngestionService.getTraceById("non-existent-id"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Traza no encontrada"));

        mockMvc.perform(get("/api/v1/traces/non-existent-id")
                        .header("X-API-Key", API_KEY)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
