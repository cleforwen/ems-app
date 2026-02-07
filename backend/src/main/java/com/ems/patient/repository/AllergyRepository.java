package com.ems.patient.repository;

import com.ems.patient.Allergy;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class AllergyRepository implements PanacheRepository<Allergy> {

    public List<Allergy> findByPatientId(Long patientId) {
        return list("patient.id", patientId);
    }
}
