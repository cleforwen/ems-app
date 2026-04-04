package com.ems.patient;

import com.ems.patient.dto.AllergyResponse;
import com.ems.patient.dto.CreateAllergyRequest;
import com.ems.patient.repository.AllergyRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AllergyService {

    @Inject
    AllergyRepository allergyRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;
    @Inject
    Logger log;

    public List<AllergyResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        List<AllergyResponse> allergies = allergyRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        log.debugf("Listed %d allergies for patient %d", Integer.valueOf(allergies.size()), patientId);
        return allergies;
    }

    @Transactional
    public AllergyResponse create(Long patientId, CreateAllergyRequest request) {
        Patient patient = verifyPatientAccess(patientId);

        Allergy allergy = new Allergy();
        allergy.setPatient(patient);
        allergy.setAllergen(request.allergen());
        allergy.setReaction(request.reaction());
        allergy.setSeverity(request.severity());
        allergy.setNotes(request.notes());

        allergy.setCreatedBy(jwt.getName());
        allergyRepository.persist(allergy);
        log.debugf("Created allergy for patient %d: %s", patientId, request.allergen());

        return toResponse(allergy);
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

    private AllergyResponse toResponse(Allergy a) {
        return new AllergyResponse(
                a.getId(),
                a.getPatient().getId(),
                a.getAllergen(),
                a.getReaction(),
                a.getSeverity(),
                a.getNotes());
    }
}
