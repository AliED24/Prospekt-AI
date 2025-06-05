// src/main/java/com/prospektai/demo/service/OfferSaver.java
package com.prospektai.demo.service;

import com.prospektai.demo.model.OfferData;
import com.prospektai.demo.repository.OfferDataRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OfferSaver {

    private static final Logger log = LoggerFactory.getLogger(OfferSaver.class);

    private final OfferDataRepository repository;

    /**
     * Speichert alle OfferData-Objekte in der DB.
     * @param offers Liste von OfferData
     */
    public void saveAll(List<OfferData> offers) {
        if (offers == null || offers.isEmpty()) {
            log.warn("Keine Angebote zum Speichern erhalten.");
            return;
        }
        repository.saveAll(offers);
        log.info("Insgesamt {} OfferData-Objekte gespeichert.", offers.size());
    }
}
