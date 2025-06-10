package com.prospektai.demo.service;
import com.prospektai.demo.model.OfferData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.slf4j.Logger;

@Service
@RequiredArgsConstructor
public class PdfProcessingService {

    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(PdfProcessingService.class);
    private final PdfSplitter pdfSplitter;
    private final OpenAiClient openAiClient;
    private final OfferSaver offerSaver;

    // Diese Klasse verarbeitet eine hochgeladene PDF-Datei, indem sie sie in kleinere Chunks aufteilt,
    // die dann an OpenAI gesendet werden, um Angebote zu extrahieren, und schließlich in der Datenbank gespeichert werden.
    // Mit @Transactional wird sichergestellt, dass alle Datenbankoperationen in einer Transaktion ausgeführt werden.
    @Transactional
    public void processPdf(MultipartFile multipartFile, int pagesPerChunk) throws Exception {
        Path tempFile = Files.createTempFile("upload-", "-" + multipartFile.getOriginalFilename());
        multipartFile.transferTo(tempFile.toFile());
        try {
            List<Path> chunkPaths = pdfSplitter.split(tempFile, pagesPerChunk);
            for (Path chunkPath : chunkPaths) {
                List<OfferData> offers = openAiClient.extractOffers(chunkPath);
                offerSaver.saveAll(offers);
                Files.deleteIfExists(chunkPath);
            }
        } catch (Exception e) {
            logger.error("Fehler bei der Verarbeitung der PDF-Datei: {}", e.getMessage(), e);
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }
}
