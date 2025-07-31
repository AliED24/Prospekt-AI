package com.prospektai.demo.service

import com.prospektai.demo.model.OfferData
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.mock.web.MockMultipartFile
import java.nio.file.Files
import java.nio.file.Path
import org.mockito.kotlin.*

@ExtendWith(MockitoExtension::class)
class PdfProcessingServiceTest {

    @Mock
    private lateinit var pdfSplitter: PdfSplitter

    @Mock
    private lateinit var openAiClient: OpenAiClient

    @Mock
    private lateinit var offerSaver: OfferSaver

    private lateinit var pdfProcessingService: PdfProcessingService
    private val tempFiles = mutableListOf<Path>()

    @BeforeEach
    fun setup() {
        pdfProcessingService = PdfProcessingService(pdfSplitter, openAiClient, offerSaver)
    }

    @AfterEach
    fun cleanup() {
        tempFiles.forEach { Files.deleteIfExists(it) }
    }

    @Test
    fun `should successfully process PDF`() {
        // Arrange
        val pdfContent = "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000061 00000 n\n0000000114 00000 n\n trailer\n<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"

        val mockFile = MockMultipartFile(
            "test.pdf",
            "test.pdf",
            "application/pdf",
            pdfContent.toByteArray()
        )

        val mockChunkPath = Files.createTempFile("test-chunk-", ".pdf").also {
            Files.write(it, pdfContent.toByteArray())
            tempFiles.add(it)
        }

        val mockOffers = listOf(
            OfferData(/* add necessary parameters here */)
        )

        whenever(pdfSplitter.split(any(), any())).thenReturn(listOf(mockChunkPath))
        whenever(openAiClient.extractOffers(any())).thenReturn(mockOffers)

        // Act
        pdfProcessingService.processPdf(mockFile, 1)

        // Assert
        verify(pdfSplitter).split(any(), eq(1))
        verify(openAiClient).extractOffers(any())
        verify(offerSaver).saveAll(mockOffers)
    }

    @Test
    fun `should handle empty PDF document`() {
        // Arrange
        val mockFile = MockMultipartFile(
            "empty.pdf",
            "empty.pdf",
            "application/pdf",
            ByteArray(0)
        )

        whenever(pdfSplitter.split(any(), any())).thenReturn(emptyList())

        // Act
        pdfProcessingService.processPdf(mockFile, 1)

        // Assert
        verify(pdfSplitter).split(any(), eq(1))
        verify(openAiClient, never()).extractOffers(any())
        verify(offerSaver, never()).saveAll(any())
    }

    @Test
    fun `should handle exceptions during processing`() {
        // Arrange
        val mockFile = MockMultipartFile(
            "test.pdf",
            "test.pdf",
            "application/pdf",
            "%PDF-1.4".toByteArray()
        )

        whenever(pdfSplitter.split(any(), any())).thenThrow(RuntimeException("Test exception"))

        // Act & Assert
        assertThrows<RuntimeException> {
            pdfProcessingService.processPdf(mockFile, 1)
        }

        verify(pdfSplitter).split(any(), eq(1))
        verify(openAiClient, never()).extractOffers(any())
        verify(offerSaver, never()).saveAll(any())
    }

    @Test
    fun `should process multiple pages`() {
        // Arrange
        val pdfContent = "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000015 00000 n\n0000000061 00000 n\n0000000114 00000 n\n trailer\n<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"

        val mockFile = MockMultipartFile(
            "test.pdf",
            "test.pdf",
            "application/pdf",
            pdfContent.toByteArray()
        )

        val mockChunkPaths = (1..3).map {
            Files.createTempFile("test-chunk-$it-", ".pdf").also { path ->
                Files.write(path, pdfContent.toByteArray())
                tempFiles.add(path)
            }
        }

        val mockOffers = listOf(
            OfferData(/* add necessary parameters here */)
        )

        whenever(pdfSplitter.split(any(), any())).thenReturn(mockChunkPaths)
        whenever(openAiClient.extractOffers(any())).thenReturn(mockOffers)

        // Act
        pdfProcessingService.processPdf(mockFile, 2)

        // Assert
        verify(pdfSplitter).split(any(), eq(2))
        verify(openAiClient, times(mockChunkPaths.size)).extractOffers(any())
        verify(offerSaver, times(mockChunkPaths.size)).saveAll(mockOffers)
    }
}