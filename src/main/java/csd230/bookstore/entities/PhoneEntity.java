package csd230.bookstore.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.Objects;

// Follows the EXACT same pattern as BookEntity:
//   - @Entity marks it as a JPA-managed table row
//   - @DiscriminatorValue("PHONE") tells Hibernate to write "PHONE" into the
//     product_type column of the shared 'products' single-table so it can
//     reconstruct the correct subclass on reads
//   - Extends ProductEntity (not PublicationEntity) because a Phone is a
//     product but is NOT a publication — it has its own price column just
//     like TicketEntity does
@Entity
@DiscriminatorValue("PHONE")
public class PhoneEntity extends ProductEntity {

    private String brand;   // e.g. "Apple", "Samsung"
    private String model;   // e.g. "iPhone 15 Pro"

    // Stored in its own column to avoid collision with pub_price (PublicationEntity)
    // and ticket_price (TicketEntity) — mirrors the TicketEntity pattern exactly
    private Double price;

    private Integer stock;  // number of units available

    // ── Constructors ──────────────────────────────────────────────────────────
    public PhoneEntity() {}

    public PhoneEntity(String brand, String model, Double price, Integer stock) {
        this.brand = brand;
        this.model = model;
        this.price = price;
        this.stock = stock;
    }

    // ── SaleableItem interface (required by ProductEntity) ────────────────────
    // sellItem() is declared abstract in ProductEntity via SaleableItem.
    // We decrement stock exactly like BookEntity decrements copies.
    @Override
    public void sellItem() {
        if (stock != null && stock > 0) {
            stock--;
            System.out.println("Sold: " + brand + " " + model + ". Remaining stock: " + stock);
        } else {
            System.out.println("Cannot sell " + brand + " " + model + ". Out of stock.");
        }
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    @Override
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    // ── equals / hashCode / toString ──────────────────────────────────────────
    @Override
    public String toString() {
        return "PhoneEntity{brand='" + brand + "', model='" + model +
                "', price=" + price + ", stock=" + stock + "}";
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        PhoneEntity that = (PhoneEntity) o;
        return Objects.equals(brand, that.brand) && Objects.equals(model, that.model);
    }

    @Override
    public int hashCode() {
        return Objects.hash(brand, model);
    }
}