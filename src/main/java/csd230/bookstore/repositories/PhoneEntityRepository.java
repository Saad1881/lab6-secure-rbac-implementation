package csd230.bookstore.repositories;

import csd230.bookstore.entities.PhoneEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Follows the EXACT same pattern as BookEntityRepository and MagazineEntityRepository.
// JpaRepository<PhoneEntity, Long> gives us all CRUD methods for free:
//   findAll(), findById(), save(), deleteById(), count(), etc.
// No custom queries needed for basic CRUD — Spring Data generates them at startup.
@Repository
public interface PhoneEntityRepository extends JpaRepository<PhoneEntity, Long> {

    // Example of a phone-specific query you could add later:
    // List<PhoneEntity> findByBrand(String brand);
}