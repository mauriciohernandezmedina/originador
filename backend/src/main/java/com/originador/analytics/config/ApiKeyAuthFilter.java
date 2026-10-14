package com.originador.analytics.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

    @Value("${app.api-key:originador-llm-secret-key-2026}")
    private String configuredApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        // Do not filter static resources, swagger/actuator, or root SPA endpoints
        return !path.startsWith("/api/") || path.startsWith("/actuator/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestApiKey = request.getHeader(API_KEY_HEADER);

        if (requestApiKey == null || !requestApiKey.trim().equals(configuredApiKey.trim())) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("timestamp", Instant.now().toString());
            errorDetails.put("status", HttpStatus.UNAUTHORIZED.value());
            errorDetails.put("error", "Unauthorized");
            errorDetails.put("message", "Clave de API ausente o no válida en encabezado " + API_KEY_HEADER);

            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
