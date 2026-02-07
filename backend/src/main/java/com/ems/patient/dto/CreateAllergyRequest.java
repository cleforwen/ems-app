package com.ems.patient.dto;

import com.ems.patient.Allergy;
import jakarta.validation.constraints.NotBlank;

public record CreateAllergyRequest(
        @NotBlank(message = "Allergen is required") String allergen,
        String reaction,
        Allergy.Severity severity,
        String notes) {
}
