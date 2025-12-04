package com.prospektai.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prospektai.demo.Entity.OfferEntity;
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
import java.util.Map;

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
        String dataUrl = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(bytes);

        var messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", List.of(
                        Map.of("type", "text", "content", userPrompt),
                        Map.of("type", "image_url", "image_url", Map.of("format", "image/jpeg", "url", dataUrl))
                ))
        );

        var responseFormat = Map.of(
                "type", "json_schema",
                "json_schema", Map.of(
                        "name", "extract_offers_response",
                        "strict", true,
                        "schema", Map.of(
                                "type", "object",
                                "properties", Map.of("offers", Map.of(
                                        "type", "array",
                                        "items", Map.of(
                                                "type", "object",
                                                "properties", Map.of(
                                                        "storeName", Map.of("type", "string"),
                                                        "productName", Map.of("type", "string"),
                                                        "brand", Map.of("type", "string", "nullable", true),
                                                        "quantity", Map.of("type", "string"),
                                                        "price", Map.of("type", "number"),
                                                        "originalPrice", Map.of("type", "string", "nullable", true),
                                                        "offerDateStart", Map.of("type", "string"),
                                                        "offerDateEnd", Map.of("type", "string")
                                                ),
                                                "required", List.of("storeName","productName","quantity","brand","originalPrice","price","offerDateStart","offerDateEnd"),
                                                "additionalProperties", false
                                        )
                                )),
                                "required", List.of("offers"),
                                "additionalProperties", false
                        )
                )
        );

        var payload = Map.of(
                "model", model,
                "messages", messages,
                "response_format", responseFormat
        );

        log.debug(" Payload (kurz): model={}, messagesCount={}", model, messages.size());

        JsonNode response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        if (response == null) throw new RuntimeException("Keine Antwort von LLM erhalten");

        String contentText = response.path("choices").path(0).path("message").path("content").asText("");
        contentText = contentText.replaceFirst("^```json\\s*", "").replaceAll("```\\s*$", "").trim();
        if (contentText.isEmpty()) throw new RuntimeException("Keine gültige Antwort erhalten");

        JsonNode offersNode = objectMapper.readTree(contentText).get("offers");
        if (offersNode == null) throw new RuntimeException("Antwort enthält kein 'offers' Feld");

        return objectMapper.convertValue(
                offersNode,
                objectMapper.getTypeFactory().constructCollectionType(List.class, OfferEntity.class)
        );
    }
}
