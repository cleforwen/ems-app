package com.ems.patient.dto;

import com.ems.patient.LabResult;
import java.time.LocalDateTime;

public record LabResultResponse(
        Long id,
        Long patientId,
        String testName,
        String testCode,
        String result,
        String unit,
        String referenceRange,
        LabResult.Status status,
        LocalDateTime performedAt,
        Long orderedById,
        String orderedByName,
        String notes,
        String imageUrl) {
}
