package com.ems.patient.repository;

import com.ems.patient.Medication;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class MedicationRepository implements PanacheRepository<Medication> {

    public List<Medication> findByPatientId(Long patientId) {
        return list("patient.id", patientId);
    }
}
