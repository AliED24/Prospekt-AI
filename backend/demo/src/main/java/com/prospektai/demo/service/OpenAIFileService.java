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
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.system-prompt}")
    private String systemPrompt;

    @Value("${openai.user-prompt}")
    private String userPrompt;


    // Erster Schritt: Datei hochladen und verarbeiten
    /**
     * Lädt eine Datei hoch und verarbeitet sie mit OpenAI.
     *
     * @param filePath der Pfad zur Datei, die hochgeladen werden soll
     * @return ein Mono, das den Text der Antwort von OpenAI enthält
     * @throws IOException wenn ein Fehler beim Lesen der Datei auftritt
     */
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


    // Zweiter Schritt: OpenAI mit der hochgeladenen Datei anfragen
    /**
     * Fragt OpenAI mit der hochgeladenen Datei und dem Benutzer-Prompt an.
     *
     * @param fileId die ID der hochgeladenen Datei
     * @return ein Mono, das den Text der Antwort von OpenAI enthält
     */

    private Mono<String> askOpenAI(String fileId) {
        // System-Prompt
        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        // User-Prompt mit Datei
        ObjectNode contentFile = objectMapper.createObjectNode();
        contentFile.put("type", "input_file");
        contentFile.put("file_id", fileId);

        ObjectNode contentText = objectMapper.createObjectNode();
        contentText.put("type", "input_text");
        contentText.put("text", userPrompt);

        ArrayNode contentArray = objectMapper.createArrayNode();
        contentArray.add(contentFile);
        contentArray.add(contentText);

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.set("content", contentArray);

        ArrayNode inputArray = objectMapper.createArrayNode();
        inputArray.add(systemMessage);
        inputArray.add(userMessage);

        ObjectNode request = objectMapper.createObjectNode();
        request.put("model", "gpt-4o-mini");
        request.set("input", inputArray);

        return webClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(json -> {
                    String outputText = json.get("output_text").asText();
                    try {
                        // Erwartet, dass outputText ein JSON-Array ist
                        ArrayNode angebote = (ArrayNode) objectMapper.readTree(outputText);
                        for (JsonNode angebot : angebote) {
                            OfferData data = OfferData.builder()
                                    .productName(angebot.get("productName").asText())
                                    .brand(angebot.get("brand").asText())
                                    .quantity(angebot.get("quantity").asText())
                                    .price(angebot.get("price").asText())
                                    .offerDate(angebot.get("offerDate").asText())
                                    .build();
                            repository.save(data);
                        }
                    } catch (Exception e) {
                        // Fehler beim Parsen oder Speichern
                        e.printStackTrace();
                    }
                    return outputText; // Gibt den kompletten Response zurück
                });
    }

    public List<OfferData> getAllOffers() {
        return repository.findAll();
    }
}