package com.ems.patient.repository;

import com.ems.patient.Vital;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class VitalRepository implements PanacheRepository<Vital> {

    public List<Vital> findByPatientId(Long patientId) {
        return list("patient.id", patientId);
    }
}
