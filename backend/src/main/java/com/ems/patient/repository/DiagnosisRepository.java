package com.ems.patient.repository;

import com.ems.patient.Diagnosis;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class DiagnosisRepository implements PanacheRepository<Diagnosis> {

    public List<Diagnosis> findByPatientId(Long patientId) {
        return list("patient.id", patientId);
    }
}
