package com.prospektai.demo.service

import com.prospektai.demo.model.OfferData
import com.prospektai.demo.repository.OfferDataRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class OfferSaver(
    private val repository: OfferDataRepository
) {
    private val log = LoggerFactory.getLogger(OfferSaver::class.java)

    fun saveAll(offers: List<OfferData>?) {
        if (offers.isNullOrEmpty()) {
            log.warn("Keine Angebote zum Speichern erhalten.")
            return
        }
         else repository.saveAll(offers)
            log.info("Insgesamt {} neue OfferData-Objekte gespeichert.", offers.size)
        }
    }

