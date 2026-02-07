package com.ems.hospital;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class HospitalRepository implements PanacheRepository<Hospital> {

    public Optional<Hospital> findByCode(String code) {
        return find("code", code).firstResultOptional();
    }
}
