package com.prospektai.demo.repository;
import com.prospektai.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferDataRepository extends JpaRepository<OfferData, Long> {
}