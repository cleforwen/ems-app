package com.ems.patient;

import com.ems.patient.dto.CreateLabResultRequest;
import com.ems.patient.dto.LabResultResponse;
import com.ems.patient.repository.LabResultRepository;
import com.ems.patient.repository.PatientRepository;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class LabResultService {

    @Inject
    LabResultRepository labResultRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;

    public List<LabResultResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        return labResultRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabResultResponse create(Long patientId, CreateLabResultRequest request) {
        Patient patient = verifyPatientAccess(patientId);

        User orderer = null;
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            orderer = userRepository.findById(Long.parseLong(userIdClaim.toString()));
        }

        LabResult labResult = new LabResult();
        labResult.setPatient(patient);
        labResult.setTestName(request.testName());
        labResult.setTestCode(request.testCode());
        labResult.setResult(request.result());
        labResult.setUnit(request.unit());
        labResult.setReferenceRange(request.referenceRange());
        labResult.setStatus(request.status());
        labResult.setPerformedAt(request.performedAt());
        labResult.setOrderedBy(orderer);
        labResult.setNotes(request.notes());

        labResult.setCreatedBy(jwt.getName());
        labResultRepository.persist(labResult);

        return toResponse(labResult);
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

    private LabResultResponse toResponse(LabResult l) {
        return new LabResultResponse(
                l.getId(),
                l.getPatient().getId(),
                l.getTestName(),
                l.getTestCode(),
                l.getResult(),
                l.getUnit(),
                l.getReferenceRange(),
                l.getStatus(),
                l.getPerformedAt(),
                l.getOrderedBy() != null ? l.getOrderedBy().getId() : null,
                l.getOrderedBy() != null ? l.getOrderedBy().getFirstName() + " " + l.getOrderedBy().getLastName()
                        : null,
                l.getNotes());
    }
}
