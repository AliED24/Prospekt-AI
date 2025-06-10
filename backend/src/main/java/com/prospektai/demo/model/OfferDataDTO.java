package com.prospektai.demo.model;

import com.fasterxml.jackson.annotation.JsonClassDescription;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;
@RequiredArgsConstructor
@JsonClassDescription("Angebotsdaten aus Prospekt")
public class OfferDataDTO {
    @JsonPropertyDescription("Name des Geschäfts, z. B. 'Aldi'")
    public String storeName;
    @JsonPropertyDescription("Produktname")
    public String productName;
    @JsonPropertyDescription("Marke, falls vorhanden")
    public Optional<String> brand;
    @JsonPropertyDescription("Menge/Verpackungseinheit")
    public Optional<String> quantity;
    @JsonPropertyDescription("Angebotspreis als String, z. B. '2.99 €'")
    public String price;
    @JsonPropertyDescription("Originalpreis, falls vorhanden")
    public Optional<String> originalPrice;
    @JsonPropertyDescription("Startdatum im Format YYYY-MM-DD")
    public String offerDateStart;
    @JsonPropertyDescription("Enddatum im Format YYYY-MM-DD")
    public String offerDateEnd;
}

