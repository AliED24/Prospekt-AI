package com.prospektai.demo.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.springframework.http.HttpStatusCode
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDate

class OpenAiClientTest {

    @Mock
    private lateinit var webClient: WebClient

    @Mock
    private lateinit var webClientRequestBodyUriSpec: WebClient.RequestBodyUriSpec

    @Mock
    private lateinit var webClientResponseSpec: WebClient.ResponseSpec

    private lateinit var objectMapper: ObjectMapper
    private lateinit var openAiClient: OpenAiClient

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)
        objectMapper = ObjectMapper().apply {
            registerModule(JavaTimeModule())
        }
        openAiClient = OpenAiClient(webClient, objectMapper)
        openAiClient.systemPrompt = "Test System Prompt"
        openAiClient.userPrompt = "Test User Prompt"
        openAiClient.model = "gpt-4-vision-preview"

        `when`(webClient.post()).thenReturn(webClientRequestBodyUriSpec)
        `when`(webClientRequestBodyUriSpec.uri("/chat/completions")).thenReturn(webClientRequestBodyUriSpec)
        `when`(webClientRequestBodyUriSpec.bodyValue(any())).thenReturn(webClientRequestBodyUriSpec)
        `when`(webClientRequestBodyUriSpec.retrieve()).thenReturn(webClientResponseSpec)
        `when`(webClientResponseSpec.onStatus(any<(HttpStatusCode) -> Boolean>(), any())).thenReturn(webClientResponseSpec)
    }

    @Test
    fun `should extract offers from image successfully`(@TempDir tempDir: Path) {
        // Test-Bild erstellen
        val imagePath = tempDir.resolve("test.jpg")
        Files.write(imagePath, "fake-image-data".toByteArray())

        // Mock-Antwort vorbereiten
        val responseJson = """
        {
            "choices": [{
                "message": {
                    "content": "{\"offers\":[{\"storeName\":\"TestStore\",\"productName\":\"TestProduct\",\"brand\":\"TestBrand\",\"quantity\":\"1 Stück\",\"price\":9.99,\"originalPrice\":\"12.99\",\"offerDateStart\":\"2024-01-01\",\"offerDateEnd\":\"2024-01-31\"}]}"
                }
            }]
        }
        """.trimIndent()
        val mockResponse = objectMapper.readTree(responseJson)

        `when`(webClientResponseSpec.bodyToMono(JsonNode::class.java))
            .thenReturn(Mono.just(mockResponse))

        // Test ausführen
        val result = openAiClient.extractOffers(imagePath)

        // Überprüfungen
        assert(result.isNotEmpty())
        with(result[0]) {
            assert(storeName == "TestStore")
            assert(productName == "TestProduct")
            assert(brand == "TestBrand")
            assert(quantity == "1 Stück")
            assert(price == "9.99")
            assert(originalPrice == "12.99")
            assert(offerDateStart == LocalDate.parse("2024-01-01"))
            assert(offerDateEnd == LocalDate.parse("2024-01-31"))
        }

        // Verify-Aufrufe
        verify(webClient).post()
        verify(webClientRequestBodyUriSpec).uri("/chat/completions")
        verify(webClientRequestBodyUriSpec).bodyValue(any())
    }

    @Test
    fun `should throw exception if no offers found`(@TempDir tempDir: Path) {
        val imagePath = tempDir.resolve("test.jpg")
        Files.write(imagePath, "fake-image-data".toByteArray())

        `when`(webClientResponseSpec.bodyToMono(JsonNode::class.java))
            .thenReturn(Mono.just(objectMapper.createObjectNode()))

        org.junit.jupiter.api.assertThrows<RuntimeException> {
            openAiClient.extractOffers(imagePath)
        }
    }

    @Test
    fun `should throw exception if API call fails`(@TempDir tempDir: Path) {
        val imagePath = tempDir.resolve("test.jpg")
        Files.write(imagePath, "fake-image-data".toByteArray())

        `when`(webClientResponseSpec.bodyToMono(JsonNode::class.java))
            .thenReturn(Mono.error(RuntimeException("API Error")))

        org.junit.jupiter.api.assertThrows<RuntimeException> {
            openAiClient.extractOffers(imagePath)
        }
    }
}