package com.ems.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,

        @NotBlank(message = "OTP is required") String otp,

        @NotBlank(message = "Hospital name is required") String hospitalName,

        String firstName,
        String lastName) {
}
