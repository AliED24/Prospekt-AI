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

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.set("messages", messages);

        JsonNode response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        String content = response.get("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText()
                .replace("```json\n", "")
                .replace("\n```", "");

        @SuppressWarnings("unchecked")
        List<OfferData> offers = objectMapper.readValue(content, objectMapper.getTypeFactory().constructCollectionType(List.class, OfferData.class));

        log.info("Chunk {}: {} Angebote erhalten", chunkPath.getFileName(), offers.size());
        return offers;
    }
}
