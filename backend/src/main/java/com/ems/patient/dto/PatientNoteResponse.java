package com.ems.patient.dto;

import com.ems.patient.PatientNote;

import java.time.LocalDateTime;

public record PatientNoteResponse(
        Long id,
        Long patientId,
        String content,
        Long createdById,
        String createdByName,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt) {

    public static PatientNoteResponse from(PatientNote note) {
        return new PatientNoteResponse(
                note.getId(),
                note.getPatient().getId(),
                note.getContent(),
                note.getCreatedByUser() != null ? note.getCreatedByUser().getId() : null,
                note.getCreatedByUser() != null
                        ? note.getCreatedByUser().getFirstName() + " " + note.getCreatedByUser().getLastName()
                        : null,
                note.getCreatedAt(),
                note.getModifiedAt());
    }
}
