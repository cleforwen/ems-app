package com.ems.user;

import com.ems.common.dto.PagedResponse;
import com.ems.user.dto.CreateUserRequest;
import com.ems.user.dto.UpdateUserRequest;
import com.ems.user.dto.UserResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
public class UserResource {

    @Inject
    UserService userService;

    @Inject
    Logger log;

    @GET
    public PagedResponse<UserResponse> list(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("search") String search) {
        PagedResponse<UserResponse> response = userService.listPaginated(page, size, search);
        log.infof("Listed %d users (page %d, total %d)", response.data().size(), page, response.total());
        return response;
    }

    @GET
    @Path("/{id}")
    public UserResponse get(@PathParam("id") Long id) {
        UserResponse user = userService.findById(id);
        log.debugf("Retrieved user: %d", id);
        return user;
    }

    @POST
    public Response create(@Valid CreateUserRequest request) {
        UserResponse response = userService.create(request);
        log.infof("User created: %s %s (ID: %d)", request.firstName(), request.lastName(), response.id());
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    public UserResponse update(@PathParam("id") Long id, @Valid UpdateUserRequest request) {
        UserResponse response = userService.update(id, request);
        log.infof("User updated: %d", id);
        return response;
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        userService.delete(id);
        log.infof("User deactivated: %d", id);
        return Response.noContent().build();
    }
}
