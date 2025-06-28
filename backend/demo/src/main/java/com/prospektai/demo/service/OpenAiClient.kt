package com.prospektai.demo.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.prospektai.demo.model.OfferData
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties
import org.springframework.http.HttpStatusCode
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.nio.file.Files
import java.nio.file.Path
import java.util.Base64

@Component
class OpenAiClient(
    private val webClient: WebClient,
    private val objectMapper: ObjectMapper,
    private val springDataWebProperties: SpringDataWebProperties
) {
    private val log = LoggerFactory.getLogger(OpenAiClient::class.java)

    @Value("\${spring.ai.openai.system-prompt}")
    lateinit var systemPrompt: String

    @Value("\${spring.ai.openai.user-prompt}")
    lateinit var userPrompt: String

    @Value("\${spring.ai.openai.model}")
    lateinit var model: String

    @Throws(Exception::class)
    fun extractOffers(imagePath: Path): List<OfferData> {
        val bytes = Files.readAllBytes(imagePath)
        val base64 = Base64.getEncoder()
            .encodeToString(bytes)
        val dataUrl = "data:image/jpeg;base64,$base64"
        // System message
        val systemMessage: ObjectNode = objectMapper.createObjectNode().apply {
            put("role", "system")
            put("content", systemPrompt)
        }
        // Text part
        val textPart: ObjectNode = objectMapper.createObjectNode().apply {
            put("type", "text")
            put("content", userPrompt)
        }

        // File part with JPEG
        val filePart: ObjectNode = objectMapper.createObjectNode().apply {
            put("type", "image_url")
            putObject("image_url").apply {
                put("format", "image/jpeg")
                put("url", dataUrl)
            }
        }

        // User message
        val contentArray: ArrayNode = objectMapper.createArrayNode().apply {
            add(textPart)
            add(filePart)
        }
        val userMessage: ObjectNode = objectMapper.createObjectNode().apply {
            put("role", "user")
            set<JsonNode>("content", contentArray)
        }

        // All messages
        val messages: ArrayNode = objectMapper.createArrayNode().apply {
            add(systemMessage)
            add(userMessage)
        }

        // JSON schema for response_format
        val responseFormat: ObjectNode = objectMapper.createObjectNode().apply {
            put("type", "json_schema")
            putObject("json_schema").apply {
                put("name", "extract_offers_response")
                put("strict", true)
                putObject("schema").apply {
                    put("type", "object")
                    putObject("properties").apply {
                        putObject("offers").apply {
                            put("type", "array")
                            putObject("items").apply {
                                put("type", "object")
                                putObject("properties").apply {
                                    putObject("storeName").put("type", "string")
                                    putObject("productName").put("type", "string")
                                    putObject("brand").put("type", "string").put("nullable", true)
                                    putObject("quantity").put("type", "string")
                                    putObject("price").put("type", "number")
                                    putObject("originalPrice").put("type", "string").put("nullable", true)
                                    putObject("offerDateStart").put("type", "string")
                                    putObject("offerDateEnd").put("type", "string")
                                }
                                putArray("required").apply {
                                    add("storeName")
                                    add("productName")
                                    add("quantity")
                                    add("brand")
                                    add("originalPrice")
                                    add("price")
                                    add("offerDateStart")
                                    add("offerDateEnd")
                                }
                                put("additionalProperties", false)
                            }
                        }
                    }
                    putArray("required").add("offers")
                    put("additionalProperties", false)
                }
            }
        }

        // Payload
        val payload: ObjectNode = objectMapper.createObjectNode().apply {
            put("model", model)
            set<JsonNode>("messages", messages)
            set<JsonNode>("response_format", responseFormat)
        }

        log.debug("OpenAI Payload: {}", payload.toPrettyString())

        // Send request
        val response: JsonNode? = webClient.post()
            .uri("/chat/completions")
            .bodyValue(payload)
            .retrieve()
            .onStatus(HttpStatusCode::isError) { clientResponse ->
                clientResponse.bodyToMono(String::class.java)
                    .flatMap { errorBody ->
                        log.error("OpenAI API Fehler – Status: {}, Body: {}",
                            clientResponse.statusCode(), errorBody)
                        Mono.error(RuntimeException(errorBody))
                    }
            }
            .bodyToMono(JsonNode::class.java)
            .block()

        // Process response
        val contentText = response
            ?.get("choices")
            ?.get(0)
            ?.get("message")
            ?.get("content")
            ?.asText()
            ?.trim()
            ?.removePrefix("```json")
            ?.removeSuffix("```") ?: throw RuntimeException("Keine gültige Antwort erhalten")

        val offersArrayNode: JsonNode = objectMapper.readTree(contentText).get("offers")
        val offers: List<OfferData> = objectMapper.readerFor(
            objectMapper.typeFactory.constructCollectionType(List::class.java, OfferData::class.java)
        ).readValue(offersArrayNode)

        log.info("Chunk {}: {} Angebote erhalten", imagePath.fileName, offers.size)
        return offers
    }
}
