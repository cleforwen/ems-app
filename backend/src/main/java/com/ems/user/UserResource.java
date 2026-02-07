package com.ems.user;

import com.ems.user.dto.CreateUserRequest;
import com.ems.user.dto.UpdateUserRequest;
import com.ems.user.dto.UserResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
public class UserResource {

    @Inject
    UserService userService;

    @GET
    public List<UserResponse> list() {
        return userService.list();
    }

    @GET
    @Path("/{id}")
    public UserResponse get(@PathParam("id") Long id) {
        return userService.findById(id);
    }

    @POST
    public Response create(@Valid CreateUserRequest request) {
        UserResponse response = userService.create(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/{id}")
    public UserResponse update(@PathParam("id") Long id, @Valid UpdateUserRequest request) {
        return userService.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        userService.delete(id);
        return Response.noContent().build();
    }
}
