package com.ems.patient.dto;

import com.ems.patient.Allergy;

public record AllergyResponse(
        Long id,
        Long patientId,
        String allergen,
        String reaction,
        Allergy.Severity severity,
        String notes) {
}
