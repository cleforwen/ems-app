package com.ems.hospital;

import com.ems.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "hospitals")
public class Hospital extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String address;
    private String city;
    private String state;
    private String zip;
    private String phone;
    private String email;
    private String website;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "appointments_enabled", nullable = false)
    private Boolean appointmentsEnabled = true;


}
