package com.ems.auth.dto;

public record AuthConfigResponse(
        boolean googleEnabled,
        String googleClientId) {
}
