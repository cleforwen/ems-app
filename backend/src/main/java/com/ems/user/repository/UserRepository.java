package com.ems.user.repository;

import com.ems.user.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    @Inject
    Logger log;

    public List<User> listByEmail(String email) {
        log.debugf("Finding users by email: %s", email);
        return list("email", email);
    }

    public List<User> findByHospitalIdPaginated(Long hospitalId, int page, int size) {
        log.debug("Finding users for hospital " + hospitalId + " (page " + page + ", size " + size + ")");
        return find("hospital.id", Sort.by("lastName").and("firstName"), hospitalId)
                .page(Page.of(page, size))
                .list();
    }

    public long countByHospitalId(Long hospitalId) {
        return count("hospital.id", hospitalId);
    }

    public List<User> searchByHospitalId(Long hospitalId, String searchTerm, int page, int size) {
        log.debug("Searching users in hospital " + hospitalId + " with term '" + searchTerm + "'");
        String term = "%" + searchTerm.toLowerCase() + "%";
        return find(
                "hospital.id = ?1 and (lower(firstName) like ?2 or lower(lastName) like ?2 or lower(email) like ?2)",
                Sort.by("lastName").and("firstName"), hospitalId, term)
                .page(Page.of(page, size))
                .list();
    }

    public long countSearchByHospitalId(Long hospitalId, String searchTerm) {
        String term = "%" + searchTerm.toLowerCase() + "%";
        return count(
                "hospital.id = ?1 and (lower(firstName) like ?2 or lower(lastName) like ?2 or lower(email) like ?2)",
                hospitalId, term);
    }
}
