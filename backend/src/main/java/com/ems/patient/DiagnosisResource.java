package com.ems.patient;

import com.ems.patient.dto.CreateDiagnosisRequest;
import com.ems.patient.dto.DiagnosisResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients/{patientId}/diagnoses")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiagnosisResource {

    @Inject
    DiagnosisService diagnosisService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<DiagnosisResponse> list(@PathParam("patientId") Long patientId) {
        List<DiagnosisResponse> diagnoses = diagnosisService.list(patientId);
        log.infof("Listed %d diagnoses for patient %d", diagnoses.size(), patientId);
        return diagnoses;
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateDiagnosisRequest request) {
        DiagnosisResponse response = diagnosisService.create(patientId, request);
        log.infof("Diagnosis recorded for patient %d: %s (ID: %d)", patientId, request.icdCode(), response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
