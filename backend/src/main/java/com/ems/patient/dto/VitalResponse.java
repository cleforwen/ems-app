package com.ems.patient.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VitalResponse(
        Long id,
        Long patientId,
        LocalDateTime recordedAt,
        Long recordedById,
        String recordedByName,
        BigDecimal temperature,
        Integer bloodPressureSystolic,
        Integer bloodPressureDiastolic,
        Integer heartRate,
        Integer respiratoryRate,
        BigDecimal oxygenSaturation,
        BigDecimal weight,
        BigDecimal height,
        String notes) {
}
