package com.ems.patient;

import com.ems.patient.dto.CreateVitalRequest;
import com.ems.patient.dto.VitalResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients/{patientId}/vitals")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VitalResource {

    @Inject
    VitalService vitalService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<VitalResponse> list(@PathParam("patientId") Long patientId) {
        List<VitalResponse> vitals = vitalService.list(patientId);
        log.infof("Listed %d vitals for patient %d", vitals.size(), patientId);
        return vitals;
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateVitalRequest request) {
        VitalResponse response = vitalService.create(patientId, request);
        log.infof("Vital recorded for patient %d (ID: %d)", patientId, response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
