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
        log.debug("Upload-Endpoint aufgerufen mit Datei=${file.originalFilename}")
        return try {
            pdfProcessingService.processPdf(file, pagesPerChunk)
            log.debug("processPdf erfolgreich durchgelaufen")
            ResponseEntity.ok("Datei erfolgreich verarbeitet und Angebote gespeichert.")
        } catch (e: Exception) {
            log.error("Fehler bei der Verarbeitung der PDF:", e)
            ResponseEntity.internalServerError()
                .body("Fehler bei der Verarbeitung der PDF: ${e.message}")
        }
    }

    @GetMapping("/offers")
    fun getAllOffers(): ResponseEntity<MutableList<OfferData?>> {
        val allOffers = offerDataRepository.findAll()
        return ResponseEntity.ok(allOffers)
    }
}
