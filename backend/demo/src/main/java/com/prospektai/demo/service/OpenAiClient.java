package com.prospektai.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.prospektai.demo.Entity.OfferEntity;
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

    public List<OfferEntity> extractOffers(Path imagePath) throws Exception {
        byte[] bytes = Files.readAllBytes(imagePath);
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String dataUrl = "data:image/jpeg;base64," + base64;


        ObjectNode systemMessage = objectMapper.createObjectNode()
                .put("role", "system")
                .put("content", systemPrompt);


        ObjectNode textPart = objectMapper.createObjectNode()
                .put("type", "text")
                .put("content", userPrompt);

        ObjectNode filePart = objectMapper.createObjectNode()
                .put("type", "image_url");
        ObjectNode imageUrlNode = filePart.putObject("image_url");
        imageUrlNode.put("format", "image/jpeg");
        imageUrlNode.put("url", dataUrl);

        ArrayNode contentArray = objectMapper.createArrayNode()
                .add(textPart)
                .add(filePart);

        ObjectNode userMessage = objectMapper.createObjectNode()
                .put("role", "user")
                .set("content", contentArray);

        ArrayNode messages = objectMapper.createArrayNode()
                .add(systemMessage)
                .add(userMessage);

        ObjectNode responseFormat = objectMapper.createObjectNode()
                .put("type", "json_schema");
        ObjectNode jsonSchema = responseFormat.putObject("json_schema");
        jsonSchema.put("name", "extract_offers_response");
        jsonSchema.put("strict", true);
        ObjectNode schema = jsonSchema.putObject("schema");
        schema.put("type", "object");
        ObjectNode properties = schema.putObject("properties");
        ObjectNode offersProp = properties.putObject("offers");
        offersProp.put("type", "array");
        ObjectNode items = offersProp.putObject("items");
        items.put("type", "object");
        ObjectNode itemProps = items.putObject("properties");
        itemProps.putObject("storeName").put("type", "string");
        itemProps.putObject("productName").put("type", "string");
        itemProps.putObject("brand").put("type", "string").put("nullable", true);
        itemProps.putObject("quantity").put("type", "string");
        itemProps.putObject("price").put("type", "number");
        itemProps.putObject("originalPrice").put("type", "string").put("nullable", true);
        itemProps.putObject("offerDateStart").put("type", "string");
        itemProps.putObject("offerDateEnd").put("type", "string");
        ArrayNode itemRequired = items.putArray("required");
        itemRequired.add("storeName").add("productName").add("quantity").add("brand")
                .add("originalPrice").add("price").add("offerDateStart").add("offerDateEnd");
        items.put("additionalProperties", false);
        schema.putArray("required").add("offers");
        schema.put("additionalProperties", false);


        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", messages);
        payload.set("response_format", responseFormat);

        log.debug("OpenAI Payload: {}", payload.toPrettyString());

        JsonNode response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(payload)
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    log.error("OpenAI API Fehler – Status: {}, Body: {}",
                                            clientResponse.statusCode(), errorBody);
                                    return Mono.error(new RuntimeException(errorBody));
                                })
                )
                .bodyToMono(JsonNode.class)
                .block();

        if (response == null) {
            throw new RuntimeException("Keine Antwort von OpenAI erhalten");
        }

        String contentText = null;
        JsonNode contentNode = response.path("choices")
                .path(0)
                .path("message")
                .path("content");
        if (!contentNode.isMissingNode()) {
            contentText = contentNode.asText().trim();

            contentText = contentText.replaceFirst("^```json\\s*", "").replaceAll("```\\s*$", "").trim();
        }

        if (contentText == null || contentText.isEmpty()) {
            throw new RuntimeException("Keine gültige Antwort erhalten");
        }

        JsonNode offersArrayNode = objectMapper.readTree(contentText).get("offers");
        if (offersArrayNode == null) {
            throw new RuntimeException("Antwort enthält kein 'offers' Feld");
        }

        List<OfferEntity> offers = objectMapper.convertValue(
                offersArrayNode,
                objectMapper.getTypeFactory().constructCollectionType(List.class, OfferEntity.class)
        );

        log.info("Chunk {}: {} Angebote erhalten", imagePath.getFileName(), offers.size());
        return offers;
    }
}
