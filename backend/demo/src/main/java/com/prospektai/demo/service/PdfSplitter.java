package com.prospektai.demo.service;

import org.apache.pdfbox.multipdf.Splitter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class PdfSplitter {

    public List<Path> split(Path source, int pagesPerChunk) throws IOException {
        List<Path> chunkPaths = new ArrayList<>();

        try (PDDocument document = PDDocument.load(source.toFile())) {
            Splitter splitter = new Splitter();
            splitter.setSplitAtPage(pagesPerChunk);

            List<PDDocument> parts = splitter.split(document);

            for (int i = 0; i < parts.size(); i++) {
            PDDocument chunkDoc = parts.get(i);
            Path tempFile = Files.createTempFile("pdf_chunk_" + i + "_", ".pdf");
            try {
                chunkDoc.save(tempFile.toFile());
            } finally {
                chunkDoc.close();
            }
            chunkPaths.add(tempFile);
        }
        }

            return chunkPaths;
        }
}
