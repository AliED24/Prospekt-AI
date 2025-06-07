package ControllerTest;

import com.prospektai.demo.PdfAiApplication;
import com.prospektai.demo.controller.UploadController;
import com.prospektai.demo.model.OfferData;
import com.prospektai.demo.repository.OfferDataRepository;
import com.prospektai.demo.service.PdfProcessingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UploadController.class)
@ContextConfiguration(classes = PdfAiApplication.class)
class UploadControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Mock
    private PdfProcessingService pdfProcessingService;

    @Mock
    private OfferDataRepository offerDataRepository;

    @Test
    void uploadFile_shouldReturnSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "PDF content".getBytes()
        );

        mockMvc.perform(multipart("/api/upload")
                        .file(file)
                        .param("pagesPerChunk", "3"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllOffers_shouldReturnOffers() throws Exception {
        OfferData offer = OfferData.builder()
                .id(1L)
                .productName("Test Produkt")
                .price("9.99")
                .build();

        when(offerDataRepository.findAll()).thenReturn(List.of(offer));

        mockMvc.perform(get("/api/offers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productName").value("Test Produkt"));
    }
}