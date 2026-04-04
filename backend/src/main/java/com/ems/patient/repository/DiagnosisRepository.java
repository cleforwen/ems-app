package com.ems.patient.repository;

import com.ems.patient.Diagnosis;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class DiagnosisRepository implements PanacheRepository<Diagnosis> {

    @Inject
    Logger log;

    public List<Diagnosis> findByPatientId(Long patientId) {
        log.debugf("Finding diagnoses for patient %d", patientId);
        return list("patient.id", patientId);
    }
}
