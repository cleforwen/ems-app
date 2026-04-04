package com.ems.patient;

import com.ems.patient.dto.CreateMedicationRequest;
import com.ems.patient.dto.MedicationResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients/{patientId}/medications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MedicationResource {

    @Inject
    MedicationService medicationService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<MedicationResponse> list(@PathParam("patientId") Long patientId) {
        List<MedicationResponse> medications = medicationService.list(patientId);
        log.infof("Listed %d medications for patient %d", medications.size(), patientId);
        return medications;
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateMedicationRequest request) {
        MedicationResponse response = medicationService.create(patientId, request);
        log.infof("Medication prescribed for patient %d: %s (ID: %d)", patientId, request.name(), response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
