package com.ems.patient.dto;

import com.ems.patient.Diagnosis;
import java.time.LocalDate;

public record DiagnosisResponse(
        Long id,
        Long patientId,
        String icdCode,
        String description,
        LocalDate diagnosedAt,
        Long diagnosedById,
        String diagnosedByName,
        Diagnosis.Status status,
        String notes) {
}
