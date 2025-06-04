package com.prospektai.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.prospektai.demo.model.OfferData;
import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import com.prospektai.demo.repository.OfferDataRepository;

@RequiredArgsConstructor
@Service
public class OpenAIFileService {

    private final WebClient webClient;
    private final OfferDataRepository repository;
    private ObjectMapper objectMapper = new ObjectMapper();
    Logger log = org.slf4j.LoggerFactory.getLogger(OpenAIFileService.class);

    @Value("${spring.ai.openai.system-prompt}")
    private String systemPrompt;

    @Value("${spring.ai.openai.user-prompt}")
    private String userPrompt;

    public Mono<String> uploadAndProcess(Path filePath) throws IOException {
        byte[] fileBytes = java.nio.file.Files.readAllBytes(filePath);
        String base64 = Base64.getEncoder().encodeToString(fileBytes);
        base64 = base64.replaceAll("\\s+", "");
        String dataUrl = String.format("data:application/pdf;base64,%s", base64);

        // System-Prompt
        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        // User Message: Text
        ObjectNode textPart = objectMapper.createObjectNode();
        textPart.put("type", "text");
        textPart.put("content", userPrompt);

        // User Message: PDF als "image_url" mit data-URL
        ObjectNode filePart = objectMapper.createObjectNode();
        filePart.put("type", "image_url");
        ObjectNode fileUrl = filePart.putObject("image_url");
        fileUrl.put("format", "application/pdf");
        fileUrl.put("url", dataUrl);

        // Array von Content-Bausteinen
        ArrayNode contentArray = objectMapper.createArrayNode();
        contentArray.add(textPart);
        contentArray.add(filePart);

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.set("content", contentArray);

        // Full message array
        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(systemMessage);
        messages.add(userMessage);

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", "gemini-2.0-flash");
        payload.set("messages", messages);
//
//        // Vollständige Payload mit gekürztem Base64
//        ObjectNode fullPreview = payload.deepCopy();
//        ObjectNode fullPreviewUserMessage = (ObjectNode) ((ArrayNode) fullPreview.get("messages")).get(1);
//        ArrayNode fullPreviewContentArray = (ArrayNode) fullPreviewUserMessage.get("content");
//        ObjectNode fullPreviewFilePart = (ObjectNode) fullPreviewContentArray.get(1);
//        ObjectNode fullPreviewImageUrl = (ObjectNode) fullPreviewFilePart.get("image_url");
//        String fullUrl = fullPreviewImageUrl.get("url").asText();
//        String truncatedUrl = fullUrl.substring(0, Math.min(30, fullUrl.length())) + "...";
//        fullPreviewImageUrl.put("url", truncatedUrl);
//        System.out.println("Vollständiger Payload (Base64 gekürzt):\n" + fullPreview.toPrettyString());

        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(payload)
                .exchangeToMono(response -> {
                    if (response.statusCode().isError()) {
                        return response.bodyToMono(String.class)
                                .flatMap(bodyText -> {
                                    log.error("API-Fehler: HTTP {} – Response-Body:\n{}", response.statusCode(), bodyText);
                                    return Mono.error(new RuntimeException("OpenAI-API-Fehler: " + bodyText));});
                    } else {
                        return response.bodyToMono(JsonNode.class)
                                .map(jsonNode -> {
                                    try {
                                        String content = jsonNode.get("choices").get(0)
                                                .get("message").get("content").asText()
                                                .replace("```json\n", "")
                                                .replace("\n```", "");

                                        List<OfferData> offers = objectMapper.readValue(content,
                                                objectMapper.getTypeFactory().constructCollectionType(
                                                        List.class, OfferData.class));

                                        repository.saveAll(offers);
                                        log.info("{} Angebote gespeichert", offers.size());

                                        return jsonNode.toPrettyString();
                                    } catch (Exception e) {
                                        log.error("Fehler beim Speichern der Angebote", e);
                                        return jsonNode.toPrettyString();
                                    }
                                });
                    }
                });
    }

    public List<OfferData> getAllOffers() {
        return repository.findAll();
    }
}