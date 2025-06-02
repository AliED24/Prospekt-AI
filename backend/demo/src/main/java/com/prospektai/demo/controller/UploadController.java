package com.prospektai.demo.controller;
import com.prospektai.demo.model.*;
import com.prospektai.demo.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UploadController {

    private final OpenAIFileService fileService;

    @PostMapping("/upload")
    public Mono<ResponseEntity<String>> uploadFile(@RequestPart("file") MultipartFile file) throws IOException {
        Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
        file.transferTo(tempFile);

        return fileService.uploadAndProcess(tempFile)
                .map(ResponseEntity::ok)
                .doFinally(signal -> {
                    try { Files.deleteIfExists(tempFile); } catch (IOException ignored) {}
                });
    }

    @GetMapping("/offers")
    public ResponseEntity<List<OfferData>> getAllOffers() {
        return ResponseEntity.ok(fileService.getAllOffers());
    }
}