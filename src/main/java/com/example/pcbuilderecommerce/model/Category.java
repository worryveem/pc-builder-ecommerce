package com.example.pcbuilderecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @JsonIgnore
    @OneToMany(mappedBy = "parent")
    private List<Category> children;

    @Column(name = "builder_supported")
    private Boolean builderSupported = false;

    @Column(name = "builder_component_type")
    private String builderComponentType;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "category")
    private List<Product> products;
}