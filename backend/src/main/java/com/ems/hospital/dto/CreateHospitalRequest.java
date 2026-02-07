package com.ems.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateHospitalRequest(
        @NotBlank(message = "Name is required") String name,

        @NotBlank(message = "Code is required") @Pattern(regexp = "^[A-Z0-9]{3,}$", message = "Code must be at least 3 uppercase alphanumeric characters") String code,

        String address,
        String phone,
        String email) {
}
