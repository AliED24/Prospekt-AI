package com.prospektai.demo.controller;

import com.prospektai.demo.model.OfferData;
import com.prospektai.demo.repository.OfferDataRepository;
import com.prospektai.demo.service.PdfProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UploadController {

    private static final Logger log = LoggerFactory.getLogger(UploadController.class);

    private final PdfProcessingService pdfProcessingService;
    private final OfferDataRepository offerDataRepository;

    public UploadController(PdfProcessingService pdfProcessingService, OfferDataRepository offerDataRepository) {
        this.pdfProcessingService = pdfProcessingService;
        this.offerDataRepository = offerDataRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "pagesPerChunk", defaultValue = "5") int pagesPerChunk) {

        log.info("Upload-Endpoint aufgerufen mit Datei={}, Größe={} bytes", file.getOriginalFilename(), file.getSize());
        try {
            pdfProcessingService.processPdf(file, pagesPerChunk);
            log.info("processPdf erfolgreich durchgelaufen für Datei={}", file.getOriginalFilename());
            return ResponseEntity.ok("Datei erfolgreich verarbeitet und Angebote gespeichert.");
        } catch (Exception e) {
            log.error("Fehler bei der Verarbeitung der PDF:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler bei der Verarbeitung der PDF: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.info("Health check endpoint called");
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "service", "handzettelki-backend"
        ));
    }

    @GetMapping("/offers")
    public ResponseEntity<List<OfferData>> getAllOffers() {
        log.info("Get offers endpoint called");
        List<OfferData> allOffers = offerDataRepository.findAll();
        return ResponseEntity.ok(allOffers);
    }
}
