package com.ems.common.filter;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.MDC;

import java.io.IOException;
import java.util.UUID;

@Provider
@Priority(Priorities.USER)
public class RequestLoggingFilter implements ContainerRequestFilter, ContainerResponseFilter {

    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_START_TIME = "requestStartTime";
    private static final String REQUEST_ID = "requestId";
    private static final String USER_ID = "userId";
    private static final String HOSPITAL_ID = "hospitalId";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String requestId = requestContext.getHeaderString(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isEmpty()) {
            requestId = UUID.randomUUID().toString();
        }

        requestContext.setProperty(REQUEST_ID, requestId);
        requestContext.setProperty(REQUEST_START_TIME, System.currentTimeMillis());

        MDC.put(REQUEST_ID, requestId);

        String path = requestContext.getUriInfo().getPath();
        String method = requestContext.getMethod();
        String queryParams = requestContext.getUriInfo().getRequestUri().getQuery();

        org.jboss.logging.Logger log = org.jboss.logging.Logger.getLogger("http.requests");
        log.infof("Request started: %s %s%s", method, path, queryParams != null ? "?" + queryParams : "");
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        String requestId = (String) requestContext.getProperty(REQUEST_ID);
        Long startTime = (Long) requestContext.getProperty(REQUEST_START_TIME);

        if (requestId != null) {
            responseContext.getHeaders().add(REQUEST_ID_HEADER, requestId);
        }

        long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;
        int status = responseContext.getStatus();

        org.jboss.logging.Logger log = org.jboss.logging.Logger.getLogger("http.requests");
        if (status >= 400) {
            log.warnf("Request completed: %s %s - %d (%dms)", requestContext.getMethod(),
                    requestContext.getUriInfo().getPath(), status, duration);
        } else {
            log.infof("Request completed: %s %s - %d (%dms)", requestContext.getMethod(),
                    requestContext.getUriInfo().getPath(), status, duration);
        }

        MDC.remove(REQUEST_ID);
        MDC.remove(USER_ID);
        MDC.remove(HOSPITAL_ID);
    }

    public static void setUserContext(String userId, String hospitalId) {
        if (userId != null) {
            MDC.put(USER_ID, userId);
        }
        if (hospitalId != null) {
            MDC.put(HOSPITAL_ID, hospitalId);
        }
    }
}
