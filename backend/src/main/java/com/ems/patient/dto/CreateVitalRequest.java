package com.ems.patient.dto;

import java.math.BigDecimal;

public record CreateVitalRequest(
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
