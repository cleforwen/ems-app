package com.ems.patient;

import com.ems.patient.dto.CreateDiagnosisRequest;
import com.ems.patient.dto.DiagnosisResponse;
import com.ems.patient.repository.DiagnosisRepository;
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
public class DiagnosisService {

    @Inject
    DiagnosisRepository diagnosisRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;
    @Inject
    Logger log;

    public List<DiagnosisResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        List<DiagnosisResponse> diagnoses = diagnosisRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        log.debugf("Listed %d diagnoses for patient %d", Integer.valueOf(diagnoses.size()), patientId);
        return diagnoses;
    }

    @Transactional
    public DiagnosisResponse create(Long patientId, CreateDiagnosisRequest request) {
        Patient patient = verifyPatientAccess(patientId);

        User doctor = null;
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            doctor = userRepository.findById(Long.parseLong(userIdClaim.toString()));
        }

        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setPatient(patient);
        diagnosis.setIcdCode(request.icdCode());
        diagnosis.setDescription(request.description());
        diagnosis.setDiagnosedAt(request.diagnosedAt());
        diagnosis.setDiagnosedBy(doctor);
        diagnosis.setStatus(request.status());
        diagnosis.setNotes(request.notes());

        diagnosis.setCreatedBy(jwt.getName());
        diagnosisRepository.persist(diagnosis);
        log.debugf("Created diagnosis for patient %d: %s", patientId, request.icdCode());

        return toResponse(diagnosis);
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

    private DiagnosisResponse toResponse(Diagnosis d) {
        return new DiagnosisResponse(
                d.getId(),
                d.getPatient().getId(),
                d.getIcdCode(),
                d.getDescription(),
                d.getDiagnosedAt(),
                d.getDiagnosedBy() != null ? d.getDiagnosedBy().getId() : null,
                d.getDiagnosedBy() != null ? d.getDiagnosedBy().getFirstName() + " " + d.getDiagnosedBy().getLastName()
                        : null,
                d.getStatus(),
                d.getNotes());
    }
}
