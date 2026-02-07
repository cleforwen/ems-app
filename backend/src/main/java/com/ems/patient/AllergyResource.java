package com.ems.patient;

import com.ems.patient.dto.AllergyResponse;
import com.ems.patient.dto.CreateAllergyRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/patients/{patientId}/allergies")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AllergyResource {

    @Inject
    AllergyService allergyService;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<AllergyResponse> list(@PathParam("patientId") Long patientId) {
        return allergyService.list(patientId);
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateAllergyRequest request) {
        AllergyResponse response = allergyService.create(patientId, request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
