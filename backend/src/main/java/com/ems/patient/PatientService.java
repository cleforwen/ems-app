package com.ems.patient;

import com.ems.hospital.Hospital;
import com.ems.hospital.HospitalRepository;
import com.ems.patient.dto.CreatePatientRequest;
import com.ems.patient.dto.PatientResponse;
import com.ems.patient.dto.UpdatePatientRequest;
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
public class PatientService {

    @Inject
    PatientRepository patientRepository;
    @Inject
    HospitalRepository hospitalRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;

    public List<PatientResponse> list() {
        return patientRepository.list("hospital.id", getHospitalId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PatientResponse findById(Long id) {
        Patient patient = findPatientScoped(id);
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse create(CreatePatientRequest request) {
        Long hospitalId = getHospitalId();

        String generatedMrn = "MRN-"
                + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 24).toUpperCase();

        Hospital hospital = hospitalRepository.findById(hospitalId);

        Patient patient = new Patient();
        patient.setHospital(hospital);
        patient.setMrn(generatedMrn);
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setDateOfBirth(request.dateOfBirth());
        patient.setGender(request.gender());
        patient.setPhone(request.phone());
        patient.setEmail(request.email());
        patient.setAddress(request.address());
        patient.setEmergencyContact(request.emergencyContact());
        patient.setBloodType(request.bloodType());

        if (request.assignedDoctorId() != null) {
            User doctor = userRepository.findById(request.assignedDoctorId());
            if (doctor != null && doctor.getHospital().getId().equals(hospitalId)) {
                patient.setAssignedDoctor(doctor);
            }
        }

        patient.setCreatedBy(jwt.getName());
        patientRepository.persist(patient);
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse update(Long id, UpdatePatientRequest request) {
        Patient patient = findPatientScoped(id);

        if (request.firstName() != null)
            patient.setFirstName(request.firstName());
        if (request.lastName() != null)
            patient.setLastName(request.lastName());
        if (request.dateOfBirth() != null)
            patient.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null)
            patient.setGender(request.gender());
        if (request.phone() != null)
            patient.setPhone(request.phone());
        if (request.email() != null)
            patient.setEmail(request.email());
        if (request.address() != null)
            patient.setAddress(request.address());
        if (request.emergencyContact() != null)
            patient.setEmergencyContact(request.emergencyContact());
        if (request.bloodType() != null)
            patient.setBloodType(request.bloodType());
        if (request.active() != null)
            patient.setActive(request.active());

        if (request.assignedDoctorId() != null) {
            User doctor = userRepository.findById(request.assignedDoctorId());
            Long hospitalId = getHospitalId();
            if (doctor != null && doctor.getHospital().getId().equals(hospitalId)) {
                patient.setAssignedDoctor(doctor);
            }
        }

        patient.setModifiedBy(jwt.getName());
        return toResponse(patient);
    }

    @Transactional
    public void delete(Long id) {
        Patient patient = findPatientScoped(id);
        patient.setActive(false);
        patient.setModifiedBy(jwt.getName());
    }

    private Patient findPatientScoped(Long id) {
        Patient patient = patientRepository.findById(id);
        if (patient == null) {
            throw new WebApplicationException("Patient not found", Response.Status.NOT_FOUND);
        }
        if (!patient.getHospital().getId().equals(getHospitalId())) {
            throw new WebApplicationException("Access denied", Response.Status.FORBIDDEN);
        }
        return patient;
    }

    private Long getHospitalId() {
        Object claim = jwt.getClaim("hospitalId");
        if (claim == null) {
            throw new WebApplicationException("Invalid token: missing hospitalId", Response.Status.UNAUTHORIZED);
        }
        return Long.parseLong(claim.toString());
    }

    private PatientResponse toResponse(Patient p) {
        return new PatientResponse(
                p.getId(), p.getMrn(), p.getFirstName(), p.getLastName(), p.getDateOfBirth(),
                p.getGender(), p.getPhone(), p.getEmail(), p.getAddress(), p.getEmergencyContact(),
                p.getBloodType(),
                p.getAssignedDoctor() != null ? p.getAssignedDoctor().getId() : null,
                p.getAssignedDoctor() != null
                        ? p.getAssignedDoctor().getFirstName() + " " + p.getAssignedDoctor().getLastName()
                        : null,
                p.getActive());
    }
}
