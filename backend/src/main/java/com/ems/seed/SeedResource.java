package com.ems.seed;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/seed")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SeedResource {

    @Inject
    SeedService seedService;

    @POST
    @Path("/generate")
    @RolesAllowed("ADMIN")
    public Response generate() {
        SeedService.SeedResult result = seedService.generate();
        return Response.ok(result).build();
    }
}
