package com.prospektai.demo.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;


// Stellt einstellung für Spring WebClient bereit, um mit der OpenAI API zu kommunizieren.
// Diese Konfiguration ermöglicht es, Anfragen an die OpenAI API
// zu senden, indem der API-Schlüssel aus den Anwendungseigenschaften verwendet wird.
@Configuration
public class WebClientConfig {

    @Value("${openai.api.key}")
    private String apiKey;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl("https://api.edeka.digital/ai-dev-models/gen/oai")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }
}