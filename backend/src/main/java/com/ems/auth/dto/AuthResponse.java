package com.ems.auth.dto;

import java.util.Set;

public record AuthResponse(
        String token,
        Long userId,
        String firstName,
        String lastName,
        Long hospitalId,
        String hospitalName,
        Set<String> roles) {
}
