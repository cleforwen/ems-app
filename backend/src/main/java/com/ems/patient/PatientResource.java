package com.ems.patient;

import com.ems.patient.dto.CreatePatientRequest;
import com.ems.patient.dto.PatientResponse;
import com.ems.patient.dto.UpdatePatientRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/patients")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PatientResource {

    @Inject
    PatientService patientService;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<PatientResponse> list() {
        return patientService.list();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public PatientResponse get(@PathParam("id") Long id) {
        return patientService.findById(id);
    }

    @POST
    @RolesAllowed({ "ADMIN", "STAFF", "DOCTOR", "NURSE" })
    public Response create(@Valid CreatePatientRequest request) {
        PatientResponse response = patientService.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "STAFF", "DOCTOR", "NURSE" })
    public PatientResponse update(@PathParam("id") Long id, @Valid UpdatePatientRequest request) {
        return patientService.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR" })
    public Response delete(@PathParam("id") Long id) {
        patientService.delete(id);
        return Response.noContent().build();
    }
}
