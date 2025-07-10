package com.prospektai.demo.controller

import com.prospektai.demo.model.OfferData
import com.prospektai.demo.repository.OfferDataRepository
import com.prospektai.demo.service.PdfProcessingService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api")
class UploadController(
    private val pdfProcessingService: PdfProcessingService,
    private val offerDataRepository: OfferDataRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostMapping("/upload")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam(value = "pagesPerChunk", defaultValue = "5") pagesPerChunk: Int
    ): ResponseEntity<String> {
        log.info("Upload-Endpoint aufgerufen mit Datei=${file.originalFilename}, Größe=${file.size} bytes")
        return try {
            pdfProcessingService.processPdf(file, pagesPerChunk)
            log.info("processPdf erfolgreich durchgelaufen für Datei=${file.originalFilename}")
            ResponseEntity.ok("Datei erfolgreich verarbeitet und Angebote gespeichert.")
        } catch (e: Exception) {
            log.error("Fehler bei der Verarbeitung der PDF:", e)
            ResponseEntity.internalServerError()
                .body("Fehler bei der Verarbeitung der PDF: ${e.message}")
        }
    }

    @GetMapping("/health")
    fun health(): ResponseEntity<Map<String, String>> {
        log.info("Health check endpoint called")
        return ResponseEntity.ok(mapOf(
            "status" to "UP",
            "timestamp" to java.time.Instant.now().toString(),
            "service" to "handzettelki-backend"
        ))
    }

    @GetMapping("/offers")
    fun getAllOffers(): ResponseEntity<MutableList<OfferData?>> {
        log.info("Get offers endpoint called")
        val allOffers = offerDataRepository.findAll()
        return ResponseEntity.ok(allOffers)
    }
}
