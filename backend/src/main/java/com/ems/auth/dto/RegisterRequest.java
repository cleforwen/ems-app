package com.ems.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
                @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,

                @NotBlank(message = "Global token is required") String globalToken,

                @NotBlank(message = "Hospital name is required") String hospitalName,

                String firstName,
                String lastName) {
}
