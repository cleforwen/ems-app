package com.ems.patient.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePatientNoteRequest(
        @NotBlank(message = "Note content is required") String content) {
}
