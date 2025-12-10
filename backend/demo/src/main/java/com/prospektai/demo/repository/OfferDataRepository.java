package com.prospektai.demo.repository;

import com.prospektai.demo.Entity.OfferEntity;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferDataRepository extends JpaRepository<OfferEntity, Long> {
    void deleteById(@NotNull Long id);

    @Modifying
    @Query("delete from OfferEntity offer where offer.associatedPdfFile = :filename")
    int deleteByAssociatedPdfFile(@Param("filename") @NotNull String filename);
}
