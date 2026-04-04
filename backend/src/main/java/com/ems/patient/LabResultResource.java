package com.ems.patient;

import com.ems.patient.dto.CreateLabResultRequest;
import com.ems.patient.dto.LabResultResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients/{patientId}/lab-results")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LabResultResource {

    @Inject
    LabResultService labResultService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<LabResultResponse> list(@PathParam("patientId") Long patientId) {
        List<LabResultResponse> results = labResultService.list(patientId);
        log.infof("Listed %d lab results for patient %d", results.size(), patientId);
        return results;
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateLabResultRequest request) {
        LabResultResponse response = labResultService.create(patientId, request);
        log.infof("Lab result recorded for patient %d: %s (ID: %d)", patientId, request.testName(), response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
