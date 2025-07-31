package com.prospektai.demo.service

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.io.TempDir
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PdfSplitterTest {

    private lateinit var pdfSplitter: PdfSplitter
    private val tempFiles = mutableListOf<Path>()

    @TempDir
    lateinit var tempDir: Path

    @BeforeEach
    fun setup() {
        pdfSplitter = PdfSplitter()
    }

    @AfterEach
    fun cleanup() {
        tempFiles.forEach { Files.deleteIfExists(it) }
    }

    @Test
    fun `should split single page PDF into one chunk`() {
        // Arrange
        val singlePagePdfContent = """
            %PDF-1.4
            %âãÏÓ
            1 0 obj
            <</Type/Catalog/Pages 2 0 R>>
            endobj
            2 0 obj
            <</Type/Pages/Kids[3 0 R]/Count 1>>
            endobj
            3 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            xref
            0 4
            0000000000 65535 f
            0000000015 00000 n
            0000000061 00000 n
            0000000114 00000 n
            trailer
            <</Size 4/Root 1 0 R>>
            startxref
            190
            %%EOF
        """.trimIndent()

        val sourcePath = tempDir.resolve("single_page.pdf")
        Files.write(sourcePath, singlePagePdfContent.toByteArray())
        tempFiles.add(sourcePath)

        // Act
        val resultPaths = pdfSplitter.split(sourcePath, 1)
        tempFiles.addAll(resultPaths)

        // Assert
        assertEquals(1, resultPaths.size)
        assertTrue(Files.exists(resultPaths[0]))
        assertTrue(resultPaths[0].toString().contains("pdf_chunk_0_"))
    }

    @Test
    fun `should split multi-page PDF into multiple chunks`() {
        // Arrange
        val multiPagePdfContent = """
            %PDF-1.4
            %âãÏÓ
            1 0 obj
            <</Type/Catalog/Pages 2 0 R>>
            endobj
            2 0 obj
            <</Type/Pages/Kids[3 0 R 4 0 R]/Count 2>>
            endobj
            3 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            4 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            xref
            0 5
            0000000000 65535 f
            0000000015 00000 n
            0000000061 00000 n
            0000000123 00000 n
            0000000176 00000 n
            trailer
            <</Size 5/Root 1 0 R>>
            startxref
            229
            %%EOF
        """.trimIndent()

        val sourcePath = tempDir.resolve("multi_page.pdf")
        Files.write(sourcePath, multiPagePdfContent.toByteArray())
        tempFiles.add(sourcePath)

        // Act
        val resultPaths = pdfSplitter.split(sourcePath, 1)
        tempFiles.addAll(resultPaths)

        // Assert
        assertEquals(2, resultPaths.size)
        resultPaths.forEachIndexed { index, path ->
            assertTrue(Files.exists(path))
            assertTrue(path.toString().contains("pdf_chunk_${index}_"))
        }
    }

    @Test
    fun `should handle empty PDF file`() {
        // Arrange
        val sourcePath = tempDir.resolve("empty.pdf")
        Files.write(sourcePath, ByteArray(0))
        tempFiles.add(sourcePath)

        // Act & Assert
        assertThrows<IOException> {
            pdfSplitter.split(sourcePath, 1)
        }
    }

    @Test
    fun `should handle non-existent file`() {
        // Arrange
        val nonExistentPath = tempDir.resolve("non_existent.pdf")

        // Act & Assert
        assertThrows<IOException> {
            pdfSplitter.split(nonExistentPath, 1)
        }
    }


    @Test
    fun `should split PDF with specified pages per chunk`() {
        // Arrange
        val fourPagePdfContent = """
            %PDF-1.4
            %âãÏÓ
            1 0 obj
            <</Type/Catalog/Pages 2 0 R>>
            endobj
            2 0 obj
            <</Type/Pages/Kids[3 0 R 4 0 R 5 0 R 6 0 R]/Count 4>>
            endobj
            3 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            4 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            5 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            6 0 obj
            <</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 595 842]>>
            endobj
            xref
            0 7
            0000000000 65535 f
            0000000015 00000 n
            0000000061 00000 n
            0000000134 00000 n
            0000000187 00000 n
            0000000240 00000 n
            0000000293 00000 n
            trailer
            <</Size 7/Root 1 0 R>>
            startxref
            346
            %%EOF
        """.trimIndent()

        val sourcePath = tempDir.resolve("four_pages.pdf")
        Files.write(sourcePath, fourPagePdfContent.toByteArray())
        tempFiles.add(sourcePath)

        // Act
        val resultPaths = pdfSplitter.split(sourcePath, 2)
        tempFiles.addAll(resultPaths)

        // Assert
        assertEquals(2, resultPaths.size) // Should create 2 chunks with 2 pages each
        resultPaths.forEachIndexed { index, path ->
            assertTrue(Files.exists(path))
            assertTrue(path.toString().contains("pdf_chunk_${index}_"))
        }
    }
}