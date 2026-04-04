package com.ems.patient;

import com.ems.patient.dto.CreateMedicationRequest;
import com.ems.patient.dto.MedicationResponse;
import com.ems.patient.repository.MedicationRepository;
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
public class MedicationService {

    @Inject
    MedicationRepository medicationRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;
    @Inject
    Logger log;

    public List<MedicationResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        List<MedicationResponse> medications = medicationRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        log.debugf("Listed %d medications for patient %d", Integer.valueOf(medications.size()), patientId);
        return medications;
    }

    @Transactional
    public MedicationResponse create(Long patientId, CreateMedicationRequest request) {
        Patient patient = verifyPatientAccess(patientId);

        User prescriber = null;
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            prescriber = userRepository.findById(Long.parseLong(userIdClaim.toString()));
        }

        Medication medication = new Medication();
        medication.setPatient(patient);
        medication.setName(request.name());
        medication.setDosage(request.dosage());
        medication.setFrequency(request.frequency());
        medication.setStartDate(request.startDate());
        medication.setEndDate(request.endDate());
        medication.setPrescribedBy(prescriber);
        medication.setActive(true);
        medication.setNotes(request.notes());

        medication.setCreatedBy(jwt.getName());
        medicationRepository.persist(medication);
        log.debugf("Created medication for patient %d: %s", patientId, request.name());

        return toResponse(medication);
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

    private MedicationResponse toResponse(Medication m) {
        return new MedicationResponse(
                m.getId(),
                m.getPatient().getId(),
                m.getName(),
                m.getDosage(),
                m.getFrequency(),
                m.getStartDate(),
                m.getEndDate(),
                m.getPrescribedBy() != null ? m.getPrescribedBy().getId() : null,
                m.getPrescribedBy() != null
                        ? m.getPrescribedBy().getFirstName() + " " + m.getPrescribedBy().getLastName()
                        : null,
                m.getActive(),
                m.getNotes());
    }
}
