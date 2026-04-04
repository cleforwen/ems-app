package com.ems.user;

import com.ems.common.dto.PagedResponse;
import com.ems.hospital.Hospital;
import com.ems.hospital.HospitalRepository;
import com.ems.user.dto.CreateUserRequest;
import com.ems.user.dto.UpdateUserRequest;
import com.ems.user.dto.UserResponse;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;
    @Inject
    HospitalRepository hospitalRepository;
    @Inject
    JsonWebToken jwt;
    @Inject
    Logger log;

    public List<UserResponse> list() {
        List<UserResponse> users = userRepository.list("hospital.id", getHospitalId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        log.debugf("Listed %d users for hospital %d", Integer.valueOf(users.size()), getHospitalId());
        return users;
    }

    public PagedResponse<UserResponse> listPaginated(int page, int size, String search) {
        Long hospitalId = getHospitalId();
        List<User> users;
        long total;

        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.searchByHospitalId(hospitalId, search.trim(), page, size);
            total = userRepository.countSearchByHospitalId(hospitalId, search.trim());
        } else {
            users = userRepository.findByHospitalIdPaginated(hospitalId, page, size);
            total = userRepository.countByHospitalId(hospitalId);
        }

        List<UserResponse> data = users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        log.debug("Listed " + data.size() + " users for hospital " + hospitalId + " (total: " + total + ")");
        return PagedResponse.of(data, total, page, size);
    }

    public UserResponse findById(Long id) {
        User user = findUserScoped(id);
        log.debugf("Finding user by ID: %d", id);
        return toResponse(user);
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        Long hospitalId = getHospitalId();

        if (userRepository.find("email", request.email()).count() > 0) {
            log.warnf("User creation failed - email already exists: %s", request.email());
            throw new WebApplicationException("Email already exists", Response.Status.CONFLICT);
        }

        Hospital hospital = hospitalRepository.findById(hospitalId);
        if (hospital == null) {
            log.warnf("User creation failed - invalid hospital context: %d", hospitalId);
            throw new WebApplicationException("Hospital context invalid", Response.Status.BAD_REQUEST);
        }

        User user = new User();
        user.setHospital(hospital);
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());

        user.setRoles(request.roles() != null ? request.roles() : java.util.Collections.emptySet());
        user.setCreatedBy(jwt.getName());

        userRepository.persist(user);
        log.infof("Created user: %s %s with roles %s", request.firstName(), request.lastName(), request.roles());
        return toResponse(user);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = findUserScoped(id);

        if (request.firstName() != null)
            user.setFirstName(request.firstName());
        if (request.lastName() != null)
            user.setLastName(request.lastName());

        if (request.roles() != null)
            user.setRoles(request.roles());
        if (request.active() != null)
            user.setActive(request.active());

        user.setModifiedBy(jwt.getName());
        return toResponse(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = findUserScoped(id);
        user.setActive(false);
        user.setModifiedBy(jwt.getName());
    }

    private User findUserScoped(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            log.warnf("User not found: %d", id);
            throw new WebApplicationException("User not found", Response.Status.NOT_FOUND);
        }
        if (!user.getHospital().getId().equals(getHospitalId())) {
            log.warnf("Access denied to user: %d", id);
            throw new WebApplicationException("Access denied", Response.Status.FORBIDDEN);
        }
        return user;
    }

    private Long getHospitalId() {
        Object claim = jwt.getClaim("hospitalId");
        if (claim == null) {
            throw new WebApplicationException("Invalid token: missing hospitalId", Response.Status.UNAUTHORIZED);
        }
        return Long.parseLong(claim.toString());
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(), u.getRoles(), u.getActive());
    }
}
