// java
package com.prospektai.demo.service;

import com.prospektai.demo.repository.OfferDataRepository;
import com.prospektai.demo.Entity.OfferEntity;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class OfferService {

    private static final Logger log = LoggerFactory.getLogger(OfferService.class);
    private final OfferDataRepository offerDataRepository;
    private final PdfProcessingService pdfProcessingService;

    public void uploadFile(MultipartFile file, int pagesPerChunk) {
        log.info("Upload-Endpoint aufgerufen mit Datei={}, Größe={} bytes", file.getOriginalFilename(), file.getSize());
        try {
            pdfProcessingService.processPdf(file, pagesPerChunk);
            log.info("processPdf erfolgreich durchgelaufen für Datei={}", file.getOriginalFilename());
        } catch (Exception e) {
            log.error("Fehler bei der Verarbeitung der PDF:", e);
        }
    }

    public List<OfferEntity> getAllOffers() {
        log.info("getAllOffers Endpoint Called()");
        try {
            return offerDataRepository.findAll();
        } catch (Exception e) {
            log.error("Fehler beim Laden aller Angebote:", e);
            return Collections.emptyList();
        }
    }

    public void deleteSingleOffer(Long id) {
        try {
            offerDataRepository.deleteById(id);
            log.info("Angebot mit id {} gelöscht", id);
        } catch (Exception e) {
            log.error("Fehler beim Löschen des Angebots mit id {}:", id, e);
        }
    }

    @Transactional
    public void deleteOffersByFile(String filename) {
        String decoded = URLDecoder.decode(filename, StandardCharsets.UTF_8);
        String normalized = Normalizer.normalize(decoded, Normalizer.Form.NFC);
        log.info("Versuche Angebote zu löschen für Datei='{}' (normalisiert='{}')", filename, normalized);
        try {
            offerDataRepository.deleteByAssociatedPdfFile(normalized);
            log.info("Löschvorgang abgeschlossen für Datei='{}'", normalized);
        } catch (Exception e) {
            log.error("Fehler bei der Löschung der Angebote:", e);
        }
    }
}
