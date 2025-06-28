package com.prospektai.demo.model

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "offer_data")
data class OfferData(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Long? = null,
        var storeName: String? = null,
        var productName: String? = null,
        var brand: String? = null,
        var quantity: String? = null,
        var price: String? = null,
        var originalPrice: String? = null,

        @Column(columnDefinition = "DATE")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd.MM.yyyy")
        var offerDateStart: LocalDate? = null,

        @Column(columnDefinition = "DATE")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd.MM.yyyy")
        var offerDateEnd: LocalDate? = null
)