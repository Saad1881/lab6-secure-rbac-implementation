package csd230.bookstore.controllers;

import csd230.bookstore.entities.PhoneEntity;
import csd230.bookstore.repositories.PhoneEntityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Mirrors BookRestController and MagazineRestController structure exactly.
//
// Base URL:  /api/rest/phones
//
// Security is enforced at the WebSecurityConfig level — the existing rule
//   .requestMatchers("/api/rest/**").hasAnyRole("USER", "ADMIN")
// already covers this controller, so:
//   - GET  (read)    → USER + ADMIN  (browse the store)
//   - POST/PUT/DELETE → ADMIN only   (add the role check in WebSecurityConfig
//                                     if you want finer-grained control, see below)
//
// To restrict writes to ADMIN only, add this line in WebSecurityConfig ABOVE
// the existing /api/rest/** rule (more specific rules must come first):
//   .requestMatchers(HttpMethod.POST, "/api/rest/phones/**").hasRole("ADMIN")
//   .requestMatchers(HttpMethod.PUT,  "/api/rest/phones/**").hasRole("ADMIN")
//   .requestMatchers(HttpMethod.DELETE,"/api/rest/phones/**").hasRole("ADMIN")

@Tag(name = "Phone REST API", description = "JSON API for managing phones")
@RestController
@RequestMapping("/api/rest/phones")
@CrossOrigin(origins = "*")
public class PhoneRestController {

    private final PhoneEntityRepository phoneRepository;

    // Constructor injection — same pattern used in BookRestController
    public PhoneRestController(PhoneEntityRepository phoneRepository) {
        this.phoneRepository = phoneRepository;
    }

    // ── GET /api/rest/phones ──────────────────────────────────────────────────
    // Returns all phones as a JSON array.
    // Accessible by USER and ADMIN (read-only browsing).
    @Operation(summary = "Get all phones as JSON")
    @GetMapping
    public List<PhoneEntity> all() {
        return phoneRepository.findAll();
    }

    // ── GET /api/rest/phones/{id} ─────────────────────────────────────────────
    // Returns a single phone by its primary key.
    // Throws a 404 via BookNotFoundException if the ID doesn't exist.
    // (Reusing BookNotFoundException keeps things simple — feel free to create
    //  a PhoneNotFoundException following the same pattern if you prefer.)
    @Operation(summary = "Get a single phone by ID")
    @GetMapping("/{id}")
    public PhoneEntity getPhone(@PathVariable Long id) {
        return phoneRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }

    // ── POST /api/rest/phones ─────────────────────────────────────────────────
    // Creates a new phone from the JSON request body.
    // Should be called only by ADMIN (enforced by frontend RBAC + optionally
    // by a WebSecurityConfig rule as described above).
    @Operation(summary = "Create a new phone")
    @PostMapping
    public PhoneEntity newPhone(@RequestBody PhoneEntity newPhone) {
        return phoneRepository.save(newPhone);
    }

    // ── PUT /api/rest/phones/{id} ─────────────────────────────────────────────
    // Updates an existing phone, or creates one with that ID if not found
    // (upsert pattern — same as replaceBook / replaceMagazine).
    @Operation(summary = "Update or replace a phone")
    @PutMapping("/{id}")
    public PhoneEntity replacePhone(@RequestBody PhoneEntity newPhone, @PathVariable Long id) {
        return phoneRepository.findById(id)
                .map(phone -> {
                    phone.setBrand(newPhone.getBrand());
                    phone.setModel(newPhone.getModel());
                    phone.setPrice(newPhone.getPrice());
                    phone.setStock(newPhone.getStock());
                    return phoneRepository.save(phone);
                })
                .orElseGet(() -> {
                    newPhone.setId(id);
                    return phoneRepository.save(newPhone);
                });
    }

    // ── DELETE /api/rest/phones/{id} ──────────────────────────────────────────
    // Deletes a phone by ID.  Returns 200 OK with no body (void).
    // Should be called only by ADMIN (enforced by frontend RBAC).
    @Operation(summary = "Delete a phone")
    @DeleteMapping("/{id}")
    public void deletePhone(@PathVariable Long id) {
        phoneRepository.deleteById(id);
    }
}