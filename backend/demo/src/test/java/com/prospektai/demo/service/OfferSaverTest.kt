package com.prospektai.demo.service

import com.prospektai.demo.model.OfferData
import com.prospektai.demo.repository.OfferDataRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations

class OfferSaverTest {

    @Mock
    private lateinit var repository: OfferDataRepository

    private lateinit var offerSaver: OfferSaver

    @BeforeEach
    fun setup() {
        MockitoAnnotations.openMocks(this)
        offerSaver = OfferSaver(repository)
    }

    @Test
    fun `should save offers successfully`() {
        val offers = listOf(
            OfferData(id = 1L, productName = "Test Produkt 1", price = "9.99€"),
            OfferData(id = 2L, productName = "Test Produkt 2", price = "19.99€")
        )

        offerSaver.saveAll(offers)

        verify(repository).saveAll(offers)
    }

    @Test
    fun `should not save anything for empty list`() {
        offerSaver.saveAll(emptyList<OfferData>())

        verify(repository, never()).saveAll(any<List<OfferData>>())
    }

    @Test
    fun `should not save anything for null list`() {
        offerSaver.saveAll(null)

        verify(repository, never()).saveAll(any<List<OfferData>>())
    }

    @Test
    fun `should delete all offers`() {
        offerSaver.deleteAll()

        verify(repository).deleteAll()
    }
}