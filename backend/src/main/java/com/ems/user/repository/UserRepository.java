package com.ems.user.repository;

import com.ems.user.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    public List<User> listByEmail(String email) {
        return list("email", email);
    }
}
