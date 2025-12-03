package com.prospektai.demo.repository;

import com.prospektai.demo.Entity.OfferEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferDataRepository extends JpaRepository<OfferEntity, Long> {
    void deleteById(Long id);
}
