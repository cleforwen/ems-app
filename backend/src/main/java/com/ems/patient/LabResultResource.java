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
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
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

    @POST
    @Path("/with-image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response createWithImage(
            @PathParam("patientId") Long patientId,
            @RestForm("testName") String testName,
            @RestForm("testCode") String testCode,
            @RestForm("result") String result,
            @RestForm("unit") String unit,
            @RestForm("referenceRange") String referenceRange,
            @RestForm("status") String status,
            @RestForm("performedAt") String performedAt,
            @RestForm("notes") String notes,
            @RestForm("file") FileUpload file) throws IOException {
        
        CreateLabResultRequest request = new CreateLabResultRequest(
                testName,
                testCode,
                result,
                unit,
                referenceRange,
                status != null ? LabResult.Status.valueOf(status) : null,
                java.time.LocalDateTime.parse(performedAt),
                notes,
                null
        );
        
        LabResultResponse response = labResultService.createWithImage(patientId, request, file);
        log.infof("Lab result with image recorded for patient %d: %s (ID: %d)", patientId, testName, response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
