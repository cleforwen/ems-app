package com.ems.patient;

import com.ems.patient.dto.CreateVitalRequest;
import com.ems.patient.dto.VitalResponse;
import com.ems.patient.repository.PatientRepository;
import com.ems.patient.repository.VitalRepository;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class VitalService {

    @Inject
    VitalRepository vitalRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;

    public List<VitalResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        return vitalRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VitalResponse create(Long patientId, CreateVitalRequest request) {
        Patient patient = verifyPatientAccess(patientId);

        // Handle potential missing userId in token for system calls (though unlikely in
        // this flow)
        User recorder = null;
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            recorder = userRepository.findById(Long.parseLong(userIdClaim.toString()));
        }

        Vital vital = new Vital();
        vital.setPatient(patient);
        vital.setRecordedAt(LocalDateTime.now());
        vital.setRecordedBy(recorder);
        vital.setTemperature(request.temperature());
        vital.setBloodPressureSystolic(request.bloodPressureSystolic());
        vital.setBloodPressureDiastolic(request.bloodPressureDiastolic());
        vital.setHeartRate(request.heartRate());
        vital.setRespiratoryRate(request.respiratoryRate());
        vital.setOxygenSaturation(request.oxygenSaturation());
        vital.setWeight(request.weight());
        vital.setHeight(request.height());
        vital.setNotes(request.notes());

        vital.setCreatedBy(jwt.getName());
        vitalRepository.persist(vital);

        return toResponse(vital);
    }

    private Patient verifyPatientAccess(Long patientId) {
        Patient patient = patientRepository.findById(patientId);
        if (patient == null) {
            throw new WebApplicationException("Patient not found", Response.Status.NOT_FOUND);
        }

        Object hospitalIdClaim = jwt.getClaim("hospitalId");
        if (hospitalIdClaim == null) {
            throw new WebApplicationException("Invalid token", Response.Status.UNAUTHORIZED);
        }

        Long hospitalId = Long.parseLong(hospitalIdClaim.toString());
        if (!patient.getHospital().getId().equals(hospitalId)) {
            throw new WebApplicationException("Access denied", Response.Status.FORBIDDEN);
        }
        return patient;
    }

    private VitalResponse toResponse(Vital v) {
        return new VitalResponse(
                v.getId(),
                v.getPatient().getId(),
                v.getRecordedAt(),
                v.getRecordedBy() != null ? v.getRecordedBy().getId() : null,
                v.getRecordedBy() != null ? v.getRecordedBy().getFirstName() + " " + v.getRecordedBy().getLastName()
                        : null,
                v.getTemperature(),
                v.getBloodPressureSystolic(),
                v.getBloodPressureDiastolic(),
                v.getHeartRate(),
                v.getRespiratoryRate(),
                v.getOxygenSaturation(),
                v.getWeight(),
                v.getHeight(),
                v.getNotes());
    }
}
