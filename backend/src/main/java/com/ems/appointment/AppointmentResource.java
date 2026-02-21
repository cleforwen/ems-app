package com.ems.appointment;

import com.ems.appointment.dto.AppointmentResponse;
import com.ems.appointment.dto.CreateAppointmentRequest;
import com.ems.appointment.dto.UpdateAppointmentRequest;
import com.ems.appointment.dto.UpdateStatusRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.List;

@Path("/api/v1/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentResource {

    @Inject
    AppointmentService appointmentService;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public List<AppointmentResponse> list(
            @QueryParam("doctorId") Long doctorId,
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @QueryParam("status") String status) {

        LocalDate fromDate = from != null ? LocalDate.parse(from) : null;
        LocalDate toDate = to != null ? LocalDate.parse(to) : null;

        return appointmentService.list(doctorId, fromDate, toDate, status);
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public AppointmentResponse get(@PathParam("id") Long id) {
        return appointmentService.findById(id);
    }

    @POST
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public Response create(@Valid CreateAppointmentRequest request) {
        AppointmentResponse response = appointmentService.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public AppointmentResponse update(@PathParam("id") Long id, @Valid UpdateAppointmentRequest request) {
        return appointmentService.update(id, request);
    }

    @PUT
    @Path("/{id}/status")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public AppointmentResponse updateStatus(@PathParam("id") Long id, UpdateStatusRequest request) {
        return appointmentService.updateStatus(id, request.status());
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR" })
    public Response delete(@PathParam("id") Long id) {
        appointmentService.delete(id);
        return Response.noContent().build();
    }
}
