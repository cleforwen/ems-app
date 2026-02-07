package com.ems.patient.dto;

import java.time.LocalDate;

public record MedicationResponse(
        Long id,
        Long patientId,
        String name,
        String dosage,
        String frequency,
        LocalDate startDate,
        LocalDate endDate,
        Long prescribedById,
        String prescribedByName,
        Boolean active,
        String notes) {
}
