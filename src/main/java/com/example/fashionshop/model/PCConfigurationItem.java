package com.example.fashionshop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "pc_configuration_items")
public class PCConfigurationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuration_id", nullable = false)
    private PCConfiguration configuration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "price_at_selection", nullable = false)
    private Double priceAtSelection;

    /**
     * Component type is derived directly from Product -> Category -> builderComponentType.
     * Guaranteed Single Source of Truth with no redundant DB column.
     */
    public String getComponentType() {
        if (product != null && product.getCategory() != null) {
            return product.getCategory().getBuilderComponentType();
        }
        return null;
    }
}
