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

@Path("/api/v1/hospitals")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HospitalResource {

    @Inject
    HospitalService hospitalService;

    @GET
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public HospitalResponse get(@PathParam("id") Long id) {
        return hospitalService.findById(id);
    }

    @POST
    @RolesAllowed("ADMIN")
    public Response create(@Valid CreateHospitalRequest request) {
        HospitalResponse response = hospitalService.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public HospitalResponse update(@PathParam("id") Long id, @Valid UpdateHospitalRequest request) {
        return hospitalService.update(id, request);
    }
}
