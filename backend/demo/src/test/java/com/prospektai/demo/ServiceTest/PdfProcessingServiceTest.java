package com.prospektai.demo.ServiceTest;

import com.prospektai.demo.model.OfferData;
import com.prospektai.demo.service.OfferSaver;
import com.prospektai.demo.service.OpenAiClient;
import com.prospektai.demo.service.PdfProcessingService;
import com.prospektai.demo.service.PdfSplitter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PdfProcessingServiceTest {
    @Mock
    private PdfSplitter pdfSplitter;

    @Mock
    private OpenAiClient openAiClient;

    @Mock
    private OfferSaver offerSaver;

    @InjectMocks
    private PdfProcessingService pdfProcessingService;

    @Test
    void processPdf_shouldProcessAndSaveOffers() throws Exception {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "test.pdf",
                "test.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "PDF content".getBytes()
        );

        Path mockPath = Paths.get("test.pdf");
        List<Path> mockChunks = List.of(mockPath);
        OfferData offer = OfferData.builder()
                .productName("Test")
                .build();

        when(pdfSplitter.split(any(), eq(3))).thenReturn(mockChunks);
        when(openAiClient.extractOffers(any())).thenReturn(List.of(offer));

        // Act
        pdfProcessingService.processPdf(file, 3);

        // Assert
        verify(offerSaver).saveAll(anyList());
        verify(pdfSplitter).split(any(), eq(3));
        verify(openAiClient).extractOffers(any());
    }
}