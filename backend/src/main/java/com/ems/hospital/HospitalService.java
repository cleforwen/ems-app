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
import org.jboss.logging.Logger;

@ApplicationScoped
public class HospitalService {

    @Inject
    HospitalRepository hospitalRepository;

    @Inject
    JsonWebToken jwt;

    @Inject
    Logger log;

    public HospitalResponse findById(Long id) {
        Hospital hospital = hospitalRepository.findByIdOptional(id)
                .orElseThrow(() -> {
                    log.warnf("Hospital not found: %d", id);
                    return new WebApplicationException("Hospital not found", Response.Status.NOT_FOUND);
                });
        log.debugf("Finding hospital by ID: %d", id);
        return toResponse(hospital);
    }

    @Transactional
    public HospitalResponse create(CreateHospitalRequest request) {
        if (hospitalRepository.findByCode(request.code()).isPresent()) {
            log.warnf("Hospital creation failed - code already exists: %s", request.code());
            throw new WebApplicationException("Hospital code already exists", Response.Status.CONFLICT);
        }

        Hospital hospital = new Hospital();
        hospital.setName(request.name());
        hospital.setCode(request.code());
        hospital.setAddress(request.address());
        hospital.setCity(request.city());
        hospital.setState(request.state());
        hospital.setZip(request.zip());
        hospital.setPhone(request.phone());
        hospital.setEmail(request.email());
        hospital.setWebsite(request.website());
        hospital.setCreatedBy(getCurrentUser());

        hospitalRepository.persist(hospital);
        log.infof("Created hospital: %s (Code: %s)", request.name(), request.code());
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
        if (request.city() != null)
            hospital.setCity(request.city());
        if (request.state() != null)
            hospital.setState(request.state());
        if (request.zip() != null)
            hospital.setZip(request.zip());
        if (request.phone() != null)
            hospital.setPhone(request.phone());
        if (request.email() != null)
            hospital.setEmail(request.email());
        if (request.website() != null)
            hospital.setWebsite(request.website());
        if (request.active() != null)
            hospital.setActive(request.active());
        if (request.appointmentsEnabled() != null)
            hospital.setAppointmentsEnabled(request.appointmentsEnabled());
        hospital.setModifiedBy(getCurrentUser());

        return toResponse(hospital);
    }

    private HospitalResponse toResponse(Hospital h) {
        return new HospitalResponse(
                h.getId(), h.getName(), h.getCode(), h.getAddress(), h.getCity(), h.getState(), h.getZip(),
                h.getPhone(), h.getEmail(), h.getWebsite(), h.getActive(), h.getAppointmentsEnabled());
    }

    private String getCurrentUser() {
        return jwt != null && jwt.getName() != null ? jwt.getName() : "system";
    }
}
