package com.ems.patient;

import com.ems.common.service.FileUploadService;
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
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
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
    @Inject
    Logger log;
    @Inject
    FileUploadService fileUploadService;

    public List<LabResultResponse> list(Long patientId) {
        verifyPatientAccess(patientId);
        List<LabResultResponse> results = labResultRepository.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        log.debugf("Listed %d lab results for patient %d", Integer.valueOf(results.size()), patientId);
        return results;
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
        labResult.setImageUrl(request.imageUrl());

        labResult.setCreatedBy(jwt.getName());
        labResultRepository.persist(labResult);
        log.debugf("Created lab result for patient %d: %s", patientId, request.testName());

        return toResponse(labResult);
    }

    @Transactional
    public LabResultResponse createWithImage(Long patientId, CreateLabResultRequest request, FileUpload file) throws IOException {
        Patient patient = verifyPatientAccess(patientId);

        User orderer = null;
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            orderer = userRepository.findById(Long.parseLong(userIdClaim.toString()));
        }

        String imageUrl = null;
        if (file != null && file.fileName() != null) {
            try (InputStream inputStream = Files.newInputStream(file.uploadedFile())) {
                imageUrl = fileUploadService.uploadFile(inputStream, file.fileName(), "lab-results");
            }
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
        labResult.setImageUrl(imageUrl);

        labResult.setCreatedBy(jwt.getName());
        labResultRepository.persist(labResult);
        log.debugf("Created lab result with image for patient %d: %s", patientId, request.testName());

        return toResponse(labResult);
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
                l.getNotes(),
                l.getImageUrl());
    }
}
