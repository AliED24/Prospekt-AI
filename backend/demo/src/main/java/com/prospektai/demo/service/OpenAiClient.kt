package com.prospektai.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prospektai.demo.model.OfferData;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OpenAiClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.openai.system-prompt}")
    private String systemPrompt;

    @Value("${spring.ai.openai.user-prompt}")
    private String userPrompt;

    @Value("${spring.ai.openai.model}")
    private String model;

    public List<OfferData> extractOffersImage(Path imagePath) throws Exception {
        byte[] bytes = Files.readAllBytes(imagePath);
        String base64 = Base64.getEncoder()
                .encodeToString(bytes)
                .replaceAll("\\s+", "");
        // === Data-URL jetzt korrekt als JPEG ===
        String dataUrl = "data:image/jpeg;base64," + base64;

        // --- System-Nachricht ---
        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        // --- Text-Teil ---
        ObjectNode textPart = objectMapper.createObjectNode();
        textPart.put("type", "text");
        textPart.put("content", userPrompt);

        // --- File-Teil mit JPEG ---
        ObjectNode filePart = objectMapper.createObjectNode();
        filePart.put("type", "image_url");
        ObjectNode imageUrl = filePart.putObject("image_url");
        imageUrl.put("format", "image/jpeg");
        imageUrl.put("url", dataUrl);

        // --- User-Message zusammenbauen ---
        ArrayNode contentArray = objectMapper.createArrayNode()
                .add(textPart)
                .add(filePart);

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.set("content", contentArray);

        // --- Alle Messages in ein Array ---
        ArrayNode messages = objectMapper.createArrayNode()
                .add(systemMessage)
                .add(userMessage);

        // --- JSON-Schema für response_format ---
        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_schema");
        ObjectNode jsonSchemaNode = responseFormat.putObject("json_schema");
        jsonSchemaNode.put("name", "extract_offers_response");
        jsonSchemaNode.put("strict", true);

        ObjectNode schemaNode = jsonSchemaNode.putObject("schema");
        schemaNode.put("type", "object");
        ObjectNode props = schemaNode.putObject("properties");

        // top-level "offers"
        ObjectNode offersProp = props.putObject("offers");
        offersProp.put("type", "array");

        // items-Schema
        ObjectNode itemsNode = offersProp.putObject("items");
        itemsNode.put("type", "object");
        ObjectNode itemProps = itemsNode.putObject("properties");

        itemProps.putObject("storeName").put("type", "string");
        itemProps.putObject("productName").put("type", "string");
        itemProps.putObject("brand").put("type", "string");
        itemProps.putObject("quantity").put("type", "string");
        itemProps.putObject("price").put("type", "number");
        itemProps.putObject("originalPrice").put("type", "number");
        itemProps.putObject("offerDateStart").put("type", "string");
        itemProps.putObject("offerDateEnd").put("type", "string");

        // Required-Felder für jedes Offer-Objekt
        ArrayNode itemRequired = itemsNode.putArray("required");
        itemRequired.add("storeName");
        itemRequired.add("productName");
        itemRequired.add("brand");
        itemRequired.add("quantity");
        itemRequired.add("price");
        itemRequired.add("originalPrice");
        itemRequired.add("offerDateStart");
        itemRequired.add("offerDateEnd");
        itemsNode.put("additionalProperties", false);

        // Required auf Top-Level und keine zusätzlichen Properties
        ArrayNode topRequired = schemaNode.putArray("required");
        topRequired.add("offers");
        schemaNode.put("additionalProperties", false);

        // --- Payload zusammenbauen ---
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", messages);
        payload.set("response_format", responseFormat);

        // Optional Debug-Log, um den Payload vorab zu prüfen
        log.debug("OpenAI Payload: {}", payload.toPrettyString());

        // --- Request senden mit Fehler-Logging ---
        JsonNode response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(payload)
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    log.error("OpenAI API Fehler – Status: {}, Body: {}",
                                            clientResponse.statusCode(), errorBody);
                                    return Mono.error(new RuntimeException(errorBody));
                                })
                )
                .bodyToMono(JsonNode.class)
                .block();

        // --- Antwort auswerten ---
        JsonNode choice = response.get("choices").get(0);
        JsonNode message = choice.get("message");

        String contentText = message.get("content").asText().trim();
        if (contentText.startsWith("```")) {
            contentText = contentText.replaceAll("^```json\\s*", "").replaceAll("\\s*```$", "");
        }

        JsonNode offersArrayNode = objectMapper.readTree(contentText).get("offers");
        List<OfferData> offers = objectMapper.readerFor(
                objectMapper.getTypeFactory()
                        .constructCollectionType(List.class, OfferData.class)
        ).readValue(offersArrayNode);

        log.info("Chunk {}: {} Angebote erhalten", imagePath.getFileName(), offers.size());
        return offers;
    }
}
