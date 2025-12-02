package com.prospektai.demo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class PdfAiApplication {

	private static final Logger log = LoggerFactory.getLogger(PdfAiApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(PdfAiApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(Environment env) {
		return args -> {
			log.info("--- Application Configuration Check ---");
			String dbUrl = env.getProperty("spring.datasource.url");
			log.info("Database URL configured: {}", dbUrl != null ? "✓" : "✗");
			String openAIApiKey = env.getProperty("spring.ai.openai.api-key");
			boolean hasOpenAIKey = openAIApiKey != null && !openAIApiKey.isEmpty() && !openAIApiKey.startsWith("${");
			log.info("OpenAI API Key configured: {}", hasOpenAIKey ? "✓" : "✗");
			String activeProfile = env.getProperty("spring.profiles.active");
			log.info("Active Profile: {}", activeProfile != null ? activeProfile : "default");
			log.info("--- Application Ready ---");
		};
	}
}