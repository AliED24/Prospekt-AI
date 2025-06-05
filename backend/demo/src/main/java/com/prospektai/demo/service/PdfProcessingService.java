package com.prospektai.demo.service;

import com.prospektai.demo.model.OfferData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfProcessingService {

    private final PdfSplitter pdfSplitter;
    private final OpenAiClient openAiClient;
    private final OfferSaver offerSaver;

    /**
     * 1) Speichert hochgeladene MultipartFile-PDF als temporäre Datei.
     * 2) Teilt in Chunks.
     * 3) Schickt jeden Chunk an OpenAI.
     * 4) Speichert die OfferData in der Datenba1nk.
     *
     * @param multipartFile die hochgeladene PDF.
     * @param pagesPerChunk Anzahl der Seiten pro Chunk.
     * @throws Exception bei allen Verarbeitungsfehlern.
     */
    @Transactional
    public void processPdf(MultipartFile multipartFile, int pagesPerChunk) throws Exception {
        // 1) Temporäre Datei anlegen
        Path tempFile = Files.createTempFile("upload-", "-" + multipartFile.getOriginalFilename());
        multipartFile.transferTo(tempFile.toFile());

        try {
            // 2) PDF in Chunks splitten
            List<Path> chunkPaths = pdfSplitter.split(tempFile, pagesPerChunk);

            // 3) Jeden Chunk an OpenAI schicken & Angebote speichern
            for (Path chunkPath : chunkPaths) {
                List<OfferData> offers = openAiClient.extractOffers(chunkPath);
                offerSaver.saveAll(offers);

                // Temp-Chunk löschen, sobald abgearbeitet
                Files.deleteIfExists(chunkPath);
            }
        } finally {
            // Ursprungs-PDF temporär löschen, egal ob Erfolg/Fehler
            Files.deleteIfExists(tempFile);
        }
    }
}
