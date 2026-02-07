package com.ems.patient.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMedicationRequest(
        @NotBlank(message = "Medication name is required") String name,
        String dosage,
        String frequency,
        @NotNull(message = "Start date is required") LocalDate startDate,
        LocalDate endDate,
        String notes) {
}
