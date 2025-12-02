package com.prospektai.demo.repository;

import com.prospektai.demo.model.OfferData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferDataRepository extends JpaRepository<OfferData, Long> {
}
