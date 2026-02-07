package com.ems.hospital;

import com.ems.hospital.dto.CreateHospitalRequest;
import com.ems.hospital.dto.HospitalResponse;
import com.ems.hospital.dto.UpdateHospitalRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class HospitalService {

    @Inject
    HospitalRepository hospitalRepository;

    @Inject
    JsonWebToken jwt;

    public HospitalResponse findById(Long id) {
        Hospital hospital = hospitalRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Hospital not found", Response.Status.NOT_FOUND));
        return toResponse(hospital);
    }

    @Transactional
    public HospitalResponse create(CreateHospitalRequest request) {
        if (hospitalRepository.findByCode(request.code()).isPresent()) {
            throw new WebApplicationException("Hospital code already exists", Response.Status.CONFLICT);
        }

        Hospital hospital = new Hospital();
        hospital.setName(request.name());
        hospital.setCode(request.code());
        hospital.setAddress(request.address());
        hospital.setPhone(request.phone());
        hospital.setEmail(request.email());
        hospital.setCreatedBy(getCurrentUser());

        hospitalRepository.persist(hospital);
        return toResponse(hospital);
    }

    @Transactional
    public HospitalResponse update(Long id, UpdateHospitalRequest request) {
        Hospital hospital = hospitalRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException("Hospital not found", Response.Status.NOT_FOUND));

        if (request.name() != null)
            hospital.setName(request.name());
        if (request.address() != null)
            hospital.setAddress(request.address());
        if (request.phone() != null)
            hospital.setPhone(request.phone());
        if (request.email() != null)
            hospital.setEmail(request.email());
        if (request.active() != null)
            hospital.setActive(request.active());
        hospital.setModifiedBy(getCurrentUser());

        return toResponse(hospital);
    }

    private HospitalResponse toResponse(Hospital h) {
        return new HospitalResponse(
                h.getId(), h.getName(), h.getCode(), h.getAddress(), h.getPhone(), h.getEmail(), h.getActive());
    }

    private String getCurrentUser() {
        return jwt != null && jwt.getName() != null ? jwt.getName() : "system";
    }
}
