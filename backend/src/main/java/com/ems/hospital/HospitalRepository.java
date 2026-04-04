package com.ems.hospital;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.Optional;

@ApplicationScoped
public class HospitalRepository implements PanacheRepository<Hospital> {

    @Inject
    Logger log;

    public Optional<Hospital> findByCode(String code) {
        log.debugf("Finding hospital by code: %s", code);
        return find("code", code).firstResultOptional();
    }
}
