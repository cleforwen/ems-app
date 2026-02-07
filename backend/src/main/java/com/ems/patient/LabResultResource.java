package com.ems.patient;

import com.ems.patient.dto.CreateLabResultRequest;
import com.ems.patient.dto.LabResultResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/patients/{patientId}/lab-results")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LabResultResource {

    @Inject
    LabResultService labResultService;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<LabResultResponse> list(@PathParam("patientId") Long patientId) {
        return labResultService.list(patientId);
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateLabResultRequest request) {
        LabResultResponse response = labResultService.create(patientId, request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
