package com.ems.patient.dto;

import com.ems.patient.LabResult;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateLabResultRequest(
        @NotBlank(message = "Test name is required") String testName,
        String testCode,
        @NotBlank(message = "Result is required") String result,
        String unit,
        String referenceRange,
        LabResult.Status status,
        @NotNull(message = "Performed at timestamp is required") LocalDateTime performedAt,
        String notes) {
}
