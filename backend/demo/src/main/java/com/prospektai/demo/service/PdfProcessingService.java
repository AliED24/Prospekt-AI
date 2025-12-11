package com.prospektai.demo.service;
import com.prospektai.demo.Entity.OfferEntity;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(PdfProcessingService.class);

    private final PdfSplitter pdfSplitter;
    private final OpenAiClient openAiClient;
    private final OfferSaver offerSaver;

    @Transactional
    public void processPdf(List<MultipartFile> multipartFiles, int pagesPerChunk) throws Exception {
        for (MultipartFile multipartFile : multipartFiles) {
            logger.info("Verarbeite PDF-Datei: {}", multipartFile.getOriginalFilename());
            processSinglePdf(multipartFile, pagesPerChunk);
        }
    }

    private void processSinglePdf(MultipartFile multipartFile, int pagesPerChunk) throws Exception {
        Path tempFile = Files.createTempFile("upload-", "-" + multipartFile.getOriginalFilename());
        multipartFile.transferTo(tempFile.toFile());

        String originalFilename = multipartFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = tempFile.getFileName().toString();
        }

        try {
            List<Path> chunkPaths = pdfSplitter.split(tempFile, pagesPerChunk);
            for (Path chunkPath : chunkPaths) {
                List<Path> jpegPaths = convertPdfToJpeg(chunkPath);
                for (Path jpegPath : jpegPaths) {
                    try {
                        List<OfferEntity> offers = openAiClient.extractOffers(jpegPath);

                        for (OfferEntity offer : offers) {
                            offer.setAssociatedPdfFile(originalFilename);
                        }

                        offerSaver.saveAll(offers);
                    } catch (Exception e) {
                        logger.error("Fehler bei der Verarbeitung des Bildes {}: {}", jpegPath, e.getMessage(), e);
                        throw e;
                    } finally {
                        try {
                            Files.deleteIfExists(jpegPath);
                        } catch (IOException ex) {
                            logger.warn("Konnte temporäre Bilddatei nicht löschen: {}", jpegPath, ex);
                        }
                    }
                }
                try {
                    Files.deleteIfExists(chunkPath);
                } catch (IOException ex) {
                    logger.warn("Konnte temporäre Chunk-Datei nicht löschen: {}", chunkPath, ex);
                }
            }
        } catch (Exception e) {
            logger.error("Fehler bei der Verarbeitung der PDF-Datei {}: {}", originalFilename, e.getMessage(), e);
            throw e;
        } finally {
            try {
                Files.deleteIfExists(tempFile);
            } catch (IOException ex) {
                logger.warn("Konnte temporäre Upload-Datei nicht löschen: {}", tempFile, ex);
            }
        }
    }

    private List<Path> convertPdfToJpeg(Path pdfPath) throws IOException {
        List<Path> imagePaths = new ArrayList<>();
        try (PDDocument document = PDDocument.load(pdfPath.toFile())) {
            PDFRenderer renderer = new PDFRenderer(document);
            int pages = document.getNumberOfPages();
            for (int page = 0; page < pages; page++) {
                BufferedImage image = renderer.renderImageWithDPI(page, 300f, ImageType.RGB);
                Path imagePath = Files.createTempFile("chunk-image-" + page + "-", ".jpg");
                ImageIO.write(image, "JPEG", imagePath.toFile());
                imagePaths.add(imagePath);
            }
        }
        return imagePaths;
    }
}
