package com.prospektai.demo;

import com.prospektai.demo.service.OpenAIFileService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import java.nio.file.Path;

@SpringBootApplication
public class PdfAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(PdfAiApplication.class, args);
	}

	@Bean
	CommandLineRunner testOpenAI(OpenAIFileService fileService) {
		return args -> {
			Path pfad = Path.of("Prospekt-AI/backend/aldi_prospekt.pdf"); // Passe den Pfad an!
			fileService.uploadAndProcess(pfad)
					.doOnNext(System.out::println)
					.block(); // Nur für Testzwecke synchron blockieren!
		};
	}
}