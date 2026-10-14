package com.originador.analytics.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardingController {

    /**
     * Forwards any client-side routes (e.g. /iterations, /traces, /compare) that do not contain a dot
     * (i.e., not a static file like .js, .css, .ico) and do not match /api/** to index.html for React Router.
     */
    @GetMapping(value = {
        "/{path:[^\\.]*}",
        "/**/{path:[^\\.]*}"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
