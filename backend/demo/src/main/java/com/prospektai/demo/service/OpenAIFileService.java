package com.prospektai.demo.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.prospektai.demo.model.OfferData;
import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import com.prospektai.demo.repository.OfferDataRepository;

@Service
@RequiredArgsConstructor
public class OpenAIFileService {

    private final WebClient webClient;
    private final OfferDataRepository repository;

    @Value("${openai.prompt}")
    private String fixedPrompt;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Mono<String> uploadAndProcess(Path filePath) throws IOException {
        FileSystemResource fileResource = new FileSystemResource(filePath.toFile());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("purpose", "user_data");

        return webClient.post()
                .uri("/files")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(json -> json.get("id").asText())
                .flatMap(this::askOpenAI);
    }

    private Mono<String> askOpenAI(String fileId) {
        ObjectNode contentFile = objectMapper.createObjectNode();
        contentFile.put("type", "input_file");
        contentFile.put("file_id", fileId);

        ObjectNode contentText = objectMapper.createObjectNode();
        contentText.put("type", "input_text");
        contentText.put("text", fixedPrompt);

        ArrayNode contentArray = objectMapper.createArrayNode();
        contentArray.add(contentFile);
        contentArray.add(contentText);

        ObjectNode message = objectMapper.createObjectNode();
        message.put("role", "user");
        message.set("content", contentArray);

        ObjectNode request = objectMapper.createObjectNode();
        request.put("model", "gpt-4.1");
        request.set("input", objectMapper.createArrayNode().add(message));

        return webClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(json -> {
                    // Beispiel: JSON parsen und speichern (hier nur Dummy-Eintrag)
                    OfferData data = OfferData.builder()
                            .productName("Beispielprodukt")
                            .brand("Beispielmarke")
                            .quantity("500g")
                            .price("1.99€")
                            .offerDate("01.01.2025")
                            .build();
                    repository.save(data);
                    return json.get("output_text").asText();
                });
    }

    public List<OfferData> getAllOffers() {
        return repository.findAll();
    }
}