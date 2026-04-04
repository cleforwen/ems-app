package com.ems.patient;

import com.ems.common.dto.PagedResponse;
import com.ems.patient.dto.CreatePatientRequest;
import com.ems.patient.dto.PatientResponse;
import com.ems.patient.dto.UpdatePatientRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PatientResource {

    @Inject
    PatientService patientService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public PagedResponse<PatientResponse> list(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("search") String search) {
        PagedResponse<PatientResponse> response = patientService.listPaginated(page, size, search);
        log.infof("Listed %d patients (page %d, total %d)", response.data().size(), page, response.total());
        return response;
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public PatientResponse get(@PathParam("id") Long id) {
        PatientResponse patient = patientService.findById(id);
        log.debugf("Retrieved patient: %d", id);
        return patient;
    }

    @POST
    @RolesAllowed({ "ADMIN", "STAFF", "DOCTOR", "NURSE" })
    public Response create(@Valid CreatePatientRequest request) {
        PatientResponse response = patientService.create(request);
        log.infof("Patient created: %s %s (MRN: %s)", request.firstName(), request.lastName(), response.mrn());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "STAFF", "DOCTOR", "NURSE" })
    public PatientResponse update(@PathParam("id") Long id, @Valid UpdatePatientRequest request) {
        PatientResponse response = patientService.update(id, request);
        log.infof("Patient updated: %d", id);
        return response;
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR" })
    public Response delete(@PathParam("id") Long id) {
        patientService.delete(id);
        log.infof("Patient deactivated: %d", id);
        return Response.noContent().build();
    }
}
