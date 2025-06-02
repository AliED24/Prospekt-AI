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
	CommandLineRunner testOpenAI(OpenAIFileService fileService)  {
		return args -> {
			Path pfad = Path.of("uploads", "aldi_prospekt.pdf");
			fileService.uploadAndProcess(pfad)
					.doOnNext(System.out::println)
					.block();
		};
	}
}