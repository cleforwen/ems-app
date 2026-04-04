package com.ems.patient;

import com.ems.common.entity.TenantEntity;
import com.ems.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "patients")
public class Patient extends TenantEntity {

    @Column(nullable = false, unique = true)
    private String mrn;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String phone;
    private String email;
    private String address;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "blood_type")
    private String bloodType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_doctor_id")
    private User assignedDoctor;

    @Column(nullable = false)
    private Boolean active = true;

    public enum Gender {
        MALE, FEMALE, OTHER
    }

}
