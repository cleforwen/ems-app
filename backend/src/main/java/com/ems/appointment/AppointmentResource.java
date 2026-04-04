package com.ems.appointment;

import com.ems.appointment.dto.AppointmentResponse;
import com.ems.appointment.dto.CreateAppointmentRequest;
import com.ems.appointment.dto.UpdateAppointmentRequest;
import com.ems.appointment.dto.UpdateStatusRequest;
import com.ems.common.dto.PagedResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.List;

@Path("/api/v1/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentResource {

    @Inject
    AppointmentService appointmentService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public PagedResponse<AppointmentResponse> list(
            @QueryParam("doctorId") Long doctorId,
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @QueryParam("status") String status,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {

        LocalDate fromDate = from != null ? LocalDate.parse(from) : null;
        LocalDate toDate = to != null ? LocalDate.parse(to) : null;

        PagedResponse<AppointmentResponse> response = appointmentService.listPaginated(doctorId, fromDate, toDate, status, page, size);
        log.infof("Listed %d appointments (page %d, total %d)", response.data().size(), page, response.total());
        return response;
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public AppointmentResponse get(@PathParam("id") Long id) {
        AppointmentResponse appointment = appointmentService.findById(id);
        log.debugf("Retrieved appointment: %d", id);
        return appointment;
    }

    @POST
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public Response create(@Valid CreateAppointmentRequest request) {
        AppointmentResponse response = appointmentService.create(request);
        log.infof("Appointment created: %d for patient %d with doctor %d on %s",
                response.id(), response.patientId(), response.doctorId(), response.appointmentDate());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public AppointmentResponse update(@PathParam("id") Long id, @Valid UpdateAppointmentRequest request) {
        AppointmentResponse response = appointmentService.update(id, request);
        log.infof("Appointment updated: %d", id);
        return response;
    }

    @PUT
    @Path("/{id}/status")
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public AppointmentResponse updateStatus(@PathParam("id") Long id, UpdateStatusRequest request) {
        AppointmentResponse response = appointmentService.updateStatus(id, request.status());
        log.infof("Appointment %d status changed to %s", id, request.status());
        return response;
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({ "ADMIN", "DOCTOR" })
    public Response delete(@PathParam("id") Long id) {
        appointmentService.delete(id);
        log.infof("Appointment cancelled: %d", id);
        return Response.noContent().build();
    }
}
