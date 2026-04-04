package com.ems.patient.repository;

import com.ems.patient.Vital;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class VitalRepository implements PanacheRepository<Vital> {

    @Inject
    Logger log;

    public List<Vital> findByPatientId(Long patientId) {
        log.debugf("Finding vitals for patient %d", patientId);
        return list("patient.id", patientId);
    }
}
