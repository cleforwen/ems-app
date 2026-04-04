package com.ems.dashboard;

import com.ems.dashboard.dto.DashboardResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.jboss.logging.Logger;

@Path("/api/v1/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DashboardResource {

    @Inject
    DashboardService dashboardService;

    @Inject
    Logger log;

    @GET
    @RolesAllowed({ "ADMIN", "DOCTOR", "NURSE", "STAFF" })
    public DashboardResponse getDashboard() {
        DashboardResponse dashboard = dashboardService.getDashboard();
        log.infof("Dashboard fetched: %d patients, %d appointments today",
                dashboard.totalPatients(), dashboard.appointmentsToday());
        return dashboard;
    }
}
