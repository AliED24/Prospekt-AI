package com.prospektai.demo.model;

import com.fasterxml.jackson.annotation.JsonClassDescription;
import lombok.RequiredArgsConstructor;

import java.util.List;

@JsonClassDescription("Wrapper für eine Liste von Angeboten")
public class OffersWrapper {
    public List<OfferDataDTO> offers;


    public List<OfferDataDTO> getOffers() {
        return offers;
    }

    public void setOffers(List<OfferDataDTO> offers) {
        this.offers = offers;
    }
}