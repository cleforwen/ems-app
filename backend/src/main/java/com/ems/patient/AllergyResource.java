package com.ems.patient;

import com.ems.patient.dto.AllergyResponse;
import com.ems.patient.dto.CreateAllergyRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients/{patientId}/allergies")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AllergyResource {

    @Inject
    AllergyService allergyService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<AllergyResponse> list(@PathParam("patientId") Long patientId) {
        List<AllergyResponse> allergies = allergyService.list(patientId);
        log.infof("Listed %d allergies for patient %d", allergies.size(), patientId);
        return allergies;
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreateAllergyRequest request) {
        AllergyResponse response = allergyService.create(patientId, request);
        log.infof("Allergy recorded for patient %d: %s (ID: %d)", patientId, request.allergen(), response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
