package com.prospektai.demo.controller;

import com.prospektai.demo.model.OfferData;
import com.prospektai.demo.repository.OfferDataRepository;
import com.prospektai.demo.service.PdfProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UploadController {

    private final PdfProcessingService pdfProcessingService;
    private final OfferDataRepository offerDataRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestPart("file") MultipartFile file, @RequestParam(value = "pagesPerChunk", defaultValue = "3") int pagesPerChunk) {
        try {
            pdfProcessingService.processPdf(file, pagesPerChunk);
            return ResponseEntity.ok("Datei erfolgreich verarbeitet und Angebote gespeichert.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Fehler bei der Verarbeitung: " + e.getMessage());
        }
    }
    @GetMapping("/offers")
    public ResponseEntity<List<OfferData>> getAllOffers() {
        List<OfferData> allOffers = offerDataRepository.findAll();
        return ResponseEntity.ok(allOffers);
    }
}
