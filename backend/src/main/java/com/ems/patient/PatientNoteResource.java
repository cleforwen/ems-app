package com.ems.patient;

import com.ems.patient.dto.CreatePatientNoteRequest;
import com.ems.patient.dto.PatientNoteResponse;
import com.ems.patient.dto.UpdatePatientNoteRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/patients/{patientId}/notes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PatientNoteResource {

    @Inject
    PatientNoteService patientNoteService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<PatientNoteResponse> list(@PathParam("patientId") Long patientId) {
        List<PatientNoteResponse> notes = patientNoteService.list(patientId);
        log.infof("Listed %d notes for patient %d", notes.size(), patientId);
        return notes;
    }

    @POST
    @RolesAllowed({ "DOCTOR", "NURSE", "STAFF" })
    public Response create(@PathParam("patientId") Long patientId, @Valid CreatePatientNoteRequest request) {
        PatientNoteResponse response = patientNoteService.create(patientId, request);
        log.infof("Note created for patient %d (ID: %d)", patientId, response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{noteId}")
    @RolesAllowed({ "DOCTOR", "NURSE", "STAFF" })
    public PatientNoteResponse update(
            @PathParam("patientId") Long patientId,
            @PathParam("noteId") Long noteId,
            @Valid UpdatePatientNoteRequest request) {
        PatientNoteResponse response = patientNoteService.update(noteId, patientId, request);
        log.infof("Note %d updated for patient %d", noteId, patientId);
        return response;
    }
}
