package com.prospektai.demo.controller

import com.prospektai.demo.model.OfferData
import com.prospektai.demo.repository.OfferDataRepository
import com.prospektai.demo.service.PdfProcessingService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.InjectMocks
import org.mockito.MockitoAnnotations
import org.mockito.Mockito.*
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

class UploadControllerTest {

    private lateinit var mockMvc: MockMvc

    @Mock
    private lateinit var pdfProcessingService: PdfProcessingService

    @Mock
    private lateinit var offerDataRepository: OfferDataRepository

    @InjectMocks
    private lateinit var uploadController: UploadController

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)
        mockMvc = MockMvcBuilders.standaloneSetup(uploadController).build()
    }

    @Test
    fun `sollte PDF-Datei erfolgreich hochladen`() {
        val file = MockMultipartFile(
            "file",
            "test.pdf",
            MediaType.APPLICATION_PDF_VALUE,
            "PDF content".toByteArray()
        )

        mockMvc.perform(multipart("/api/upload")
            .file(file)
            .param("pagesPerChunk", "5"))
            .andExpect(status().isOk)
            .andExpect(content().string("Datei erfolgreich verarbeitet und Angebote gespeichert."))

        verify(pdfProcessingService).processPdf(file, 5)
    }

    @Test
    fun `sollte Health-Check erfolgreich durchführen`() {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.service").value("handzettelki-backend"))
    }

    @Test
    fun `sollte alle Angebote zurückgeben`() {
        val testOffers = mutableListOf<OfferData?>(
            OfferData(id = 1L, productName = "Test Angebot", price = "9.99€"),
            OfferData(id = 2L, productName = "Test Angebot 2", price = "19.99€")
        )

        `when`(offerDataRepository.findAll()).thenReturn(testOffers)

        mockMvc.perform(get("/api/offers"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].productName").value("Test Angebot"))
            .andExpect(jsonPath("$[1].productName").value("Test Angebot 2"))
    }

    @Test
    fun `sollte Fehler bei PDF-Verarbeitung behandeln`() {
        val file = MockMultipartFile(
            "file",
            "test.pdf",
            MediaType.APPLICATION_PDF_VALUE,
            "PDF content".toByteArray()
        )

        doThrow(RuntimeException("Verarbeitungsfehler"))
            .`when`(pdfProcessingService).processPdf(file, 5)

        mockMvc.perform(multipart("/api/upload")
            .file(file)
            .param("pagesPerChunk", "5"))
            .andExpect(status().isInternalServerError)
            .andExpect(content().string("Fehler bei der Verarbeitung der PDF: Verarbeitungsfehler"))
    }
}