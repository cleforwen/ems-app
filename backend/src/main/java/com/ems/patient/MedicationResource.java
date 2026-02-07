package com.ems.patient;

import com.ems.patient.dto.CreateMedicationRequest;
import com.ems.patient.dto.MedicationResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/patients/{patientId}/medications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MedicationResource {

    @Inject
    MedicationService medicationService;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<MedicationResponse> list(@PathParam("patientId") Long patientId) {
        return medicationService.list(patientId);
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateMedicationRequest request) {
        MedicationResponse response = medicationService.create(patientId, request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
