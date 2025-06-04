package com.prospektai.demo;

import com.prospektai.demo.service.OpenAIFileService;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.slf4j.Logger;


import java.nio.file.Path;

@SpringBootApplication
public class PdfAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(PdfAiApplication.class, args);
	}

	@Bean
	CommandLineRunner testOpenAI(OpenAIFileService fileService) {
		Logger logger = LoggerFactory.getLogger(PdfAiApplication.class);

		return args -> {
			try {
				Path pfad = Path.of("uploads", "Seite1.pdf");
				fileService.uploadAndProcess(pfad)
						.doOnNext(System.out::println)
						.block();
			} catch (Exception e) {
				logger.error("Fehler beim Verarbeiten der Datei", e);
			}
		};
	}
}