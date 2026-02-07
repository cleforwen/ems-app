package com.ems.hospital;

import com.ems.common.entity.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

@Entity
@Table(name = "workspace_settings")
public class WorkspaceSettings extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(name = "doctor_patient_assignment")
    private AssignmentMode doctorPatientAssignment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> settings;

    public enum AssignmentMode {
        ASSIGNED_ONLY, ALL_PATIENTS
    }

    // Getters and Setters
    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public AssignmentMode getDoctorPatientAssignment() {
        return doctorPatientAssignment;
    }

    public void setDoctorPatientAssignment(AssignmentMode doctorPatientAssignment) {
        this.doctorPatientAssignment = doctorPatientAssignment;
    }

    public Map<String, Object> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, Object> settings) {
        this.settings = settings;
    }
}
