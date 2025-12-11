package com.prospektai.demo.controller;
import com.prospektai.demo.Entity.OfferEntity;
import com.prospektai.demo.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OfferController {

    private static final Logger log = LoggerFactory.getLogger(OfferController.class);

    private final OfferService offerService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "pagesPerChunk", defaultValue = "5") int pagesPerChunk) {
        offerService.uploadFile(files, pagesPerChunk);
        return ResponseEntity.ok("Datei erfolgreich hochgeladen");
    }

    @GetMapping("/offers")
    public ResponseEntity<List<OfferEntity>> getAllOffers() {
        List<OfferEntity> offers = offerService.getAllOffers();
        return ResponseEntity.ok(offers);
    }

    @DeleteMapping("/offers/{id}")
    public ResponseEntity<String> deleteSingleOffer(@PathVariable Long id) {
        offerService.deleteSingleOffer(id);
        return ResponseEntity.ok("Angebot mit id " + id + " gelöscht");
    }

    @DeleteMapping("/offers/file")
    public ResponseEntity<String> deleteOffersByFile(@RequestBody Map<String, String> payload) {
        String filename = payload.get("filename");
        offerService.deleteOffersByFile(filename);
        return ResponseEntity.ok("Angebote mit Datei " + filename + " gelöscht");
    }

}
