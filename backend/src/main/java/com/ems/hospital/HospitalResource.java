package com.ems.hospital;

import com.ems.hospital.dto.CreateHospitalRequest;
import com.ems.hospital.dto.HospitalResponse;
import com.ems.hospital.dto.UpdateHospitalRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

@Path("/api/v1/hospitals")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HospitalResource {

    @Inject
    HospitalService hospitalService;

    @Inject
    Logger log;

    @GET
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public HospitalResponse get(@PathParam("id") Long id) {
        HospitalResponse hospital = hospitalService.findById(id);
        log.debugf("Retrieved hospital: %d", id);
        return hospital;
    }

    @POST
    @RolesAllowed("ADMIN")
    public Response create(@Valid CreateHospitalRequest request) {
        HospitalResponse response = hospitalService.create(request);
        log.infof("Hospital created: %s (ID: %d, Code: %s)", request.name(), response.id(), request.code());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public HospitalResponse update(@PathParam("id") Long id, @Valid UpdateHospitalRequest request) {
        HospitalResponse response = hospitalService.update(id, request);
        log.infof("Hospital updated: %d", id);
        return response;
    }
}
