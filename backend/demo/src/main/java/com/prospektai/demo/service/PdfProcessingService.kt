package com.prospektai.demo.service;

import com.prospektai.demo.model.OfferData;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;

import javax.imageio.ImageIO;

@Service
@RequiredArgsConstructor
public class PdfProcessingService {

    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(PdfProcessingService.class);
    private final PdfSplitter pdfSplitter;
    private final OpenAiClient openAiClient;
    private final OfferSaver offerSaver;

    @Transactional
    public void processPdf(MultipartFile multipartFile, int pagesPerChunk) throws Exception {
        Path tempFile = Files.createTempFile("upload-", "-" + multipartFile.getOriginalFilename());
        multipartFile.transferTo(tempFile.toFile());
        try {
            List<Path> chunkPaths = pdfSplitter.split(tempFile, pagesPerChunk);
            for (Path chunkPath : chunkPaths) {
                List<Path> jpegPaths = convertPdfToJpeg(chunkPath);

                for (Path jpegPath : jpegPaths) {
                    try {
                        List<OfferData> offers = openAiClient.extractOffersImage(jpegPath);
                        offerSaver.saveAll(offers);
                    } finally {
                        Files.deleteIfExists(jpegPath);
                    }
                }
                Files.deleteIfExists(chunkPath);
            }
        } catch (Exception e) {
            logger.error("Fehler bei der Verarbeitung der PDF-Datei: {}", e.getMessage(), e);
            throw e;
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private List<Path> convertPdfToJpeg(Path pdfPath) throws IOException {
        List<Path> imagePaths = new ArrayList<>();
        try (PDDocument document = PDDocument.load(pdfPath.toFile())) {
            PDFRenderer renderer = new PDFRenderer(document);
            for (int page = 0; page < document.getNumberOfPages(); page++) {
                BufferedImage image = renderer.renderImageWithDPI(page, 300, ImageType.RGB);
                Path imagePath = Files.createTempFile("chunk-image-" + page + "-", ".jpg");
                ImageIO.write(image, "JPEG", imagePath.toFile());
                imagePaths.add(imagePath);
            }
            return imagePaths;
        }
    }
}