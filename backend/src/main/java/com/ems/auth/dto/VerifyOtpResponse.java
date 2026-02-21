package com.ems.auth.dto;

import java.util.List;

public record VerifyOtpResponse(
        String globalToken,
        boolean isNewUser,
        String email,
        List<HospitalInfo> hospitals) {
}
