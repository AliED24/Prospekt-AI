package com.prospektai.demo.service

import com.prospektai.demo.model.OfferData
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.rendering.ImageType
import org.apache.pdfbox.rendering.PDFRenderer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.awt.image.BufferedImage
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import javax.imageio.ImageIO

@Service
open class PdfProcessingService(
        private val pdfSplitter: PdfSplitter,
        private val openAiClient: OpenAiClient,
        private val offerSaver: OfferSaver
) {
    private val logger = LoggerFactory.getLogger(PdfProcessingService::class.java)

    @Transactional
    @Throws(Exception::class)
    open fun processPdf(multipartFile: MultipartFile, pagesPerChunk: Int) {
        val tempFile = Files.createTempFile("upload-", "-${multipartFile.originalFilename}")
        multipartFile.transferTo(tempFile.toFile())
        try {
            val chunkPaths: List<Path> = pdfSplitter.split(tempFile, pagesPerChunk)
            for (chunkPathIndex in chunkPaths) {
                val jpegPaths: List<Path> = convertPdfToJpeg(chunkPathIndex)
                        for (jpegPath in jpegPaths) {
                            try {
                                val offers: List<OfferData> = openAiClient.extractOffers(jpegPath)
                                offerSaver.saveAll(offers)
                            }
                            catch (e: Exception) {
                                logger.error("Fehler bei der Verarbeitung des Bildes {}: {}", jpegPath, e.message, e)
                                throw e
                            }
                            finally {
                                Files.deleteIfExists(jpegPath)
                            }
                        }
                    Files.deleteIfExists(chunkPathIndex)
            }
        } catch (e: Exception) {
            logger.error("Fehler bei der Verarbeitung der PDF-Datei: {}", e.message, e)
            throw e
        } finally {
            Files.deleteIfExists(tempFile)
        }
    }

    @Throws(IOException::class)
    private fun convertPdfToJpeg(pdfPath: Path): List<Path> {
        val imagePaths = mutableListOf<Path>()
        PDDocument.load(pdfPath.toFile()).use{ document ->
                val renderer = PDFRenderer(document)
            for (page in 0 until document.numberOfPages) {
                val image: BufferedImage = renderer.renderImageWithDPI(page, 300F, ImageType.RGB)
                val imagePath = Files.createTempFile("chunk-image-$page-", ".jpg")
                ImageIO.write(image, "JPEG", imagePath.toFile())
                imagePaths.add(imagePath)
            }
        }
        return imagePaths
    }
}
