package com.prospektai.demo.service

import org.apache.pdfbox.multipdf.Splitter
import org.apache.pdfbox.pdmodel.PDDocument
import org.springframework.stereotype.Component
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path

@Component
class PdfSplitter {
    @Throws(IOException::class)
    fun split(source: Path, pagesPerChunk: Int): List<Path> {
        val document = PDDocument.load(source.toFile())
        val splitter = Splitter()
        splitter.setSplitAtPage(pagesPerChunk)

        val parts = splitter.split(document)
        val chunkPaths: MutableList<Path> = ArrayList()

        for (i in parts.indices) {
            val chunkDoc = parts[i]
            val tempFile = Files.createTempFile("pdf_chunk_" + i + "_", ".pdf")
            chunkDoc.save(tempFile.toFile())
            chunkDoc.close()
            chunkPaths.add(tempFile)
        }

        document.close()
        return chunkPaths
    }
}
