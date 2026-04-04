package com.ems.patient;

import com.ems.patient.dto.CreatePatientNoteRequest;
import com.ems.patient.dto.PatientNoteResponse;
import com.ems.patient.dto.UpdatePatientNoteRequest;
import com.ems.patient.repository.PatientNoteRepository;
import com.ems.patient.repository.PatientRepository;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class PatientNoteService {

    @Inject
    PatientNoteRepository patientNoteRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;
    @Inject
    Logger log;

    public List<PatientNoteResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        List<PatientNoteResponse> notes = patientNoteRepository.findByPatientId(patientId).stream()
                .map(PatientNoteResponse::from)
                .collect(Collectors.toList());
        log.debugf("Listed %d notes for patient %d", notes.size(), patientId);
        return notes;
    }

    @Transactional
    public PatientNoteResponse create(Long patientId, CreatePatientNoteRequest request) {
        Patient patient = verifyPatientAccess(patientId);

        User creator = null;
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            creator = userRepository.findById(Long.parseLong(userIdClaim.toString()));
        }

        PatientNote note = new PatientNote();
        note.setPatient(patient);
        note.setContent(request.content());
        note.setCreatedByUser(creator);
        note.setCreatedBy(jwt.getName());

        patientNoteRepository.persist(note);
        log.debugf("Created note for patient %d", patientId);

        return PatientNoteResponse.from(note);
    }

    @Transactional
    public PatientNoteResponse update(Long noteId, Long patientId, UpdatePatientNoteRequest request) {
        verifyPatientAccess(patientId);
        PatientNote note = findNoteById(noteId);

        if (!note.getPatient().getId().equals(patientId)) {
            log.warnf("Note %d does not belong to patient %d", noteId, patientId);
            throw new WebApplicationException("Note not found", Response.Status.NOT_FOUND);
        }

        note.setContent(request.content());
        note.setModifiedBy(jwt.getName());
        log.debugf("Updated note %d for patient %d", noteId, patientId);

        return PatientNoteResponse.from(note);
    }

    private PatientNote findNoteById(Long noteId) {
        PatientNote note = patientNoteRepository.findById(noteId);
        if (note == null) {
            log.warnf("Note not found: %d", noteId);
            throw new WebApplicationException("Note not found", Response.Status.NOT_FOUND);
        }
        return note;
    }

    private Patient verifyPatientAccess(Long patientId) {
        Patient patient = patientRepository.findById(patientId);
        if (patient == null) {
            log.warnf("Patient not found: %d", patientId);
            throw new WebApplicationException("Patient not found", Response.Status.NOT_FOUND);
        }

        Object hospitalIdClaim = jwt.getClaim("hospitalId");
        if (hospitalIdClaim == null) {
            log.warn("Invalid token - missing hospitalId");
            throw new WebApplicationException("Invalid token", Response.Status.UNAUTHORIZED);
        }

        Long hospitalId = Long.parseLong(hospitalIdClaim.toString());
        if (!patient.getHospital().getId().equals(hospitalId)) {
            log.warnf("Access denied to patient: %d", patientId);
            throw new WebApplicationException("Access denied", Response.Status.FORBIDDEN);
        }
        return patient;
    }
}
