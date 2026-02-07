package com.ems.patient.dto;

import com.ems.patient.Diagnosis;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDiagnosisRequest(
        String icdCode,
        @NotBlank(message = "Description is required") String description,
        @NotNull(message = "Diagnosed date is required") LocalDate diagnosedAt,
        Diagnosis.Status status,
        String notes) {
}
