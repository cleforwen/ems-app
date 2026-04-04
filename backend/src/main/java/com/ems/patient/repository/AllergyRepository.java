package com.ems.patient.repository;

import com.ems.patient.Allergy;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class AllergyRepository implements PanacheRepository<Allergy> {

    @Inject
    Logger log;

    public List<Allergy> findByPatientId(Long patientId) {
        log.debugf("Finding allergies for patient %d", patientId);
        return list("patient.id", patientId);
    }
}
