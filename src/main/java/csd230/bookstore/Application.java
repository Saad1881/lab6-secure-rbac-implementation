package csd230.bookstore;

import com.github.javafaker.Commerce;
import com.github.javafaker.Faker;
import csd230.bookstore.entities.BookEntity;
import csd230.bookstore.entities.CartEntity;
import csd230.bookstore.entities.PhoneEntity;       // NEW
import csd230.bookstore.entities.UserEntity;
import csd230.bookstore.repositories.CartEntityRepository;
import csd230.bookstore.repositories.PhoneEntityRepository; // NEW
import csd230.bookstore.repositories.ProductEntityRepository;
import csd230.bookstore.repositories.UserEntityRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class Application implements CommandLineRunner {

    private final ProductEntityRepository productRepository;
    private final CartEntityRepository cartRepository;
    private final UserEntityRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PhoneEntityRepository phoneRepository; // NEW

    public Application(ProductEntityRepository productRepository,
                       CartEntityRepository cartRepository,
                       UserEntityRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       PhoneEntityRepository phoneRepository  // NEW
    ) {
        this.productRepository  = productRepository;
        this.cartRepository     = cartRepository;
        this.userRepository     = userRepository;
        this.passwordEncoder    = passwordEncoder;
        this.phoneRepository    = phoneRepository; // NEW
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Faker faker = new Faker();

        // ── Seed Books (unchanged from original) ──────────────────────────────
        for (int i = 0; i < 10; i++) {
            String title      = faker.book().title();
            String author     = faker.book().author();
            String priceStr   = faker.commerce().price();

            BookEntity book = new BookEntity(
                    title,
                    Double.parseDouble(priceStr),
                    10,
                    author
            );
            productRepository.save(book);
            System.out.println("Saved Book " + (i + 1) + ": " + title + " by " + author);
        }

        // ── Seed Phones (NEW) ─────────────────────────────────────────────────
        // Uses the same faker + loop pattern as the book seeding above.
        // Real phone brand/model pairs so the demo data looks meaningful.
        String[][] phoneData = {
                {"Apple",   "iPhone 15 Pro"},
                {"Apple",   "iPhone 14"},
                {"Samsung", "Galaxy S24 Ultra"},
                {"Samsung", "Galaxy A54"},
                {"Google",  "Pixel 8 Pro"},
                {"Google",  "Pixel 7a"},
                {"OnePlus", "12R"},
                {"Sony",    "Xperia 1 V"},
                {"Motorola","Edge 50 Pro"},
                {"Nothing", "Phone (2)"}
        };

        for (int i = 0; i < phoneData.length; i++) {
            // faker.commerce().price() returns a string like "42.99"
            double price = Double.parseDouble(faker.commerce().price());
            int stock    = faker.number().numberBetween(5, 50);

            PhoneEntity phone = new PhoneEntity(
                    phoneData[i][0],   // brand
                    phoneData[i][1],   // model
                    price,
                    stock
            );
            phoneRepository.save(phone);
            System.out.println("Saved Phone " + (i + 1) + ": "
                    + phoneData[i][0] + " " + phoneData[i][1]);
        }

        // ── Seed Users (unchanged from original) ──────────────────────────────
        UserEntity admin = new UserEntity("admin", passwordEncoder.encode("admin"), "ADMIN");
        userRepository.save(admin);

        UserEntity user = new UserEntity("user", passwordEncoder.encode("user"), "USER");
        userRepository.save(user);

        System.out.println("Default users created: admin/admin and user/user");

        // ── Default Cart (unchanged from original) ────────────────────────────
        if (cartRepository.count() == 0) {
            CartEntity defaultCart = new CartEntity();
            cartRepository.save(defaultCart);
            System.out.println("Default Cart created with ID: " + defaultCart.getId());
        }
    }

    // CORS config (unchanged from original)
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**").allowedOrigins("*");
            }
        };
    }
}