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
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
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

    public List<OfferData> extractOffers(Path chunkPath) throws Exception {
        byte[] bytes = Files.readAllBytes(chunkPath);
        String base64 = Base64.getEncoder().encodeToString(bytes).replaceAll("\\s+", "");
        String dataUrl = "data:application/pdf;base64," + base64;

        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        ObjectNode textPart = objectMapper.createObjectNode();
        textPart.put("type", "text");
        textPart.put("content", userPrompt);

        ObjectNode filePart = objectMapper.createObjectNode();
        filePart.put("type", "image_url");
        ObjectNode imageUrl = filePart.putObject("image_url");
        imageUrl.put("format", "application/pdf");
        imageUrl.put("url", dataUrl);

        ArrayNode contentArray = objectMapper.createArrayNode();
        contentArray.add(textPart);
        contentArray.add(filePart);

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.set("content", contentArray);

        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(systemMessage);
        messages.add(userMessage);

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_schema");
        ObjectNode jsonSchemaNode = responseFormat.putObject("json_schema");
        jsonSchemaNode.put("name", "extract_offers_response");
        jsonSchemaNode.put("strict", true);
        ObjectNode schemaNode = jsonSchemaNode.putObject("schema");
        schemaNode.put("type", "object");
        ObjectNode props = schemaNode.putObject("properties");
        ObjectNode offersProp = props.putObject("offers");
        offersProp.put("type", "array");
        ObjectNode itemsNode = offersProp.putObject("items");
        itemsNode.put("type", "object");
        ObjectNode itemProps = itemsNode.putObject("properties");


        itemProps.putObject("storeName").put("type", "string");
        itemProps.putObject("productName").put("type", "string");
        // brand und quantity optional (kann null sein)
        ObjectNode brandProp = itemProps.putObject("brand");
        brandProp.put("type", "string"); // JSON-Schema erlaubt null, aber Typ hier string; null wird als fehlendes Feld behandelt
        ObjectNode quantityProp = itemProps.putObject("quantity");
        quantityProp.put("type", "string");
        itemProps.putObject("price").put("type", "number");
        ObjectNode origProp = itemProps.putObject("originalPrice");
        origProp.put("type", "number");
        itemProps.putObject("offerDateStart").put("type", "string").put("format", "date");
        itemProps.putObject("offerDateEnd").put("type", "string").put("format", "date");

        ArrayNode itemRequired = itemsNode.putArray("required");
        itemRequired.add("storeName");
        itemRequired.add("productName");
        itemRequired.add("price");
        itemRequired.add("offerDateStart");
        itemRequired.add("offerDateEnd");
        // top-level required:
        ArrayNode topRequired = schemaNode.putArray("required");
        topRequired.add("offers");
        schemaNode.put("additionalProperties", false);

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", messages);
        payload.set("response_format", responseFormat);


        // 5. Request senden
        JsonNode response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        JsonNode choice = response.get("choices").get(0);
        JsonNode message = choice.get("message");
        if (message.has("content")) {
            String contentText = message.get("content").asText().trim();

            if (contentText.startsWith("```")) {
                contentText = contentText.replaceAll("^```json\\s*", "").replaceAll("\\s*```$", "");
            }
            JsonNode rootNode = objectMapper.readTree(contentText);
            JsonNode offersArrayNode = rootNode.get("offers");
            List<OfferData> offers = objectMapper.readerFor(
                    objectMapper.getTypeFactory().constructCollectionType(List.class, OfferData.class)
            ).readValue(offersArrayNode);
            log.info("Chunk {}: {} Angebote erhalten (structured)", chunkPath.getFileName(), offers.size());
            return offers;
        } else {
            log.warn("Keine strukturierte Antwort im content, nutze Fallback-Pfad");
            String contentText = message.get("content").asText();
            contentText = contentText.replaceAll("^```json\\s*", "").replaceAll("\\s*```$", "");
            @SuppressWarnings("unchecked")
            List<OfferData> offers = objectMapper.readValue(
                    contentText,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, OfferData.class)
            );
            log.info("Chunk {}: {} Angebote erhalten (fallback)", chunkPath.getFileName(), offers.size());
            return offers;
        }
    }

}