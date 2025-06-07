package com.prospektai.demo.model;
import jakarta.persistence .*;
import lombok .*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class OfferData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String storeName;
    private String productName;
    private String brand;
    private String quantity;
    private String price;
    private String originalPrice;
    private String offerDateStart;
    private String offerDateEnd;
}


