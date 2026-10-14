package com.originador.analytics.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;

/**
 * Resolves 404s for client-side SPA routes (e.g. /iterations, /traces, /compare)
 * by forwarding them to index.html for React Router.
 */
@Configuration
public class SpaForwardingController implements ErrorViewResolver {

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        if (status == HttpStatus.NOT_FOUND) {
            String uri = request.getRequestURI();
            if (!uri.startsWith("/api") && !uri.startsWith("/actuator") && !uri.contains(".")) {
                return new ModelAndView("forward:/index.html");
            }
        }
        return null;
    }
}

