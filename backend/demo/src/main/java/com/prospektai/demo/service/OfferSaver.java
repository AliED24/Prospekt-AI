// java
package com.prospektai.demo.service;

import com.prospektai.demo.Entity.OfferEntity;
import com.prospektai.demo.repository.OfferDataRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class OfferSaver {

    private static final Logger log = LoggerFactory.getLogger(OfferSaver.class);

    private final OfferDataRepository repository;

    public void saveAll(List<OfferEntity> offers) {
        if (offers == null || offers.isEmpty()) {
            log.warn("Keine Angebote zum Speichern erhalten.");
            return;
        }
        repository.saveAll(offers);
        log.info("Insgesamt {} neue OfferData-Objekte gespeichert.", offers.size());
    }

    public void deleteAll() {
        repository.deleteAll();
        log.info("Alle OfferData-Objekte wurden gelöscht.");
    }
}
