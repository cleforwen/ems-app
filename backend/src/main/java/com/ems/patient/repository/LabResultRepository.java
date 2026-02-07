package com.ems.patient.repository;

import com.ems.patient.LabResult;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class LabResultRepository implements PanacheRepository<LabResult> {

    public List<LabResult> findByPatientId(Long patientId) {
        return list("patient.id", patientId);
    }
}
