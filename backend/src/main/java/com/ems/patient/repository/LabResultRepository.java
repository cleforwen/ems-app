package com.ems.patient.repository;

import com.ems.patient.LabResult;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class LabResultRepository implements PanacheRepository<LabResult> {

    @Inject
    Logger log;

    public List<LabResult> findByPatientId(Long patientId) {
        log.debugf("Finding lab results for patient %d", patientId);
        return list("patient.id", patientId);
    }
}
