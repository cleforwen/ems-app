package com.ems.patient.repository;

import com.ems.patient.Medication;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class MedicationRepository implements PanacheRepository<Medication> {

    @Inject
    Logger log;

    public List<Medication> findByPatientId(Long patientId) {
        log.debugf("Finding medications for patient %d", patientId);
        return list("patient.id", patientId);
    }
}
