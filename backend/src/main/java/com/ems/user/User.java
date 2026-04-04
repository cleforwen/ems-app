package com.ems.user;

import com.ems.common.entity.TenantEntity;
import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends TenantEntity {

    @Column(nullable = false, unique = true)
    private String email;

    // Password authentication is replaced by OTP

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false)
    private Boolean active = true;

}
