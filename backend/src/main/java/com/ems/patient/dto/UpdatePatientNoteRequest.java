package com.ems.patient.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePatientNoteRequest(
        @NotBlank(message = "Note content is required") String content) {
}
