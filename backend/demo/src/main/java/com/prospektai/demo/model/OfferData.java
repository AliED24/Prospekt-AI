package com.prospektai.demo.model;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence .*;
import lombok .*;

import java.time.LocalDate;

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

    @Column(columnDefinition = "DATE")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd.MM.yyyy")
    private LocalDate offerDateStart;

    @Column(columnDefinition = "DATE")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd.MM.yyyy")
    private LocalDate offerDateEnd;
}
