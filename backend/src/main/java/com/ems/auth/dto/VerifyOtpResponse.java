package com.ems.auth.dto;

public record VerifyOtpResponse(
        String token,
        boolean isNewUser,
        AuthResponse auth) {
}
