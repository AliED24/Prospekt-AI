package com.prospektai.demo.repository

import com.prospektai.demo.model.OfferData
import org.springframework.data.jpa.repository.JpaRepository

interface OfferDataRepository : JpaRepository<OfferData?, Long?>