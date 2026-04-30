package com.elibrary.config;

import com.elibrary.model.Book;
import com.elibrary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@Profile("huggingface")
public class HuggingFaceDataInitializer implements CommandLineRunner {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bookRepository.count() == 0) {
            System.out.println("🌱 Initializing SQLite Database for Hugging Face Space...");
            seedBooks();
            System.out.println("✅ Seeding complete!");
        } else {
            System.out.println("📂 SQLite Database already contains data. Skipping seeding.");
        }
    }

    private void seedBooks() {
        // Classic Literature
        createBook("The Great Gatsby", "F. Scott Fitzgerald", 
            "A classic novel about the American Dream set in the Jazz Age.", 180, 
            "Fiction", "https://covers.openlibrary.org/b/id/7725670-M.jpg", 
            "/api/files/the-great-gatsby.pdf");

        createBook("To Kill a Mockingbird", "Harper Lee", 
            "A gripping tale of racial injustice and childhood innocence.", 281, 
            "Fiction", "https://covers.openlibrary.org/b/id/7725656-M.jpg", 
            "/api/files/To%20Kill%20a%20Mockingbird%20-%201960.pdf");

        createBook("1984", "George Orwell", 
            "A dystopian novel about totalitarianism and surveillance.", 328, 
            "Dystopian", "https://covers.openlibrary.org/b/id/7725720-M.jpg", 
            "/api/files/1984.pdf");

        createBook("Pride and Prejudice", "Jane Austen", 
            "A romantic novel about manners, marriage, and social status.", 432, 
            "Romance", "https://covers.openlibrary.org/b/id/7725632-M.jpg", 
            "/api/files/Pride-and-Prejudice-Jane-Austen.txt");

        // Thrillers
        createBook("Gone Girl", "Gillian Flynn", 
            "A gripping psychological thriller about a missing wife.", 422, 
            "Thriller", "https://covers.openlibrary.org/b/id/8420550-M.jpg", 
            "/api/files/15-05-2021-082725Gone-Girl-Gillian-Flynn.pdf");

        createBook("The Da Vinci Code", "Dan Brown", 
            "A mystery thriller involving art, history, and religious conspiracy.", 487, 
            "Mystery", "https://covers.openlibrary.org/b/id/8254194-M.jpg", 
            "/api/files/The%20Da%20Vinci%20Code.pdf");

        // Sci-Fi & Fantasy
        createBook("Dune", "Frank Herbert", 
            "An epic science fiction novel about politics and ecology on a desert planet.", 688, 
            "Science Fiction", "https://covers.openlibrary.org/b/id/7725679-M.jpg", 
            "/api/files/Dune%20-%20Frank%20Herbert.pdf");

        createBook("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", 
            "The beginning of a magical journey at Hogwarts.", 309, 
            "Fantasy", "https://covers.openlibrary.org/b/id/8264346-M.jpg", 
            "/api/files/Harry%20Potter%20and%20the%20Philosopher%27s%20Stone.pdf");

        // Self-Help
        createBook("Atomic Habits", "James Clear", 
            "A guide to building good habits and breaking bad ones.", 320, 
            "Self-Help", "https://covers.openlibrary.org/b/id/9498251-M.jpg", 
            "/api/files/Atomic%20Habits%20-%20James%20Clear.pdf");
    }

    private void createBook(String title, String author, String description, Integer pages, 
                           String category, String coverUrl, String pdfUrl) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setTotalPages(pages);
        book.setCategory(category);
        book.setCoverUrl(coverUrl);
        book.setPdfUrl(pdfUrl);
        book.setCreatedAt(LocalDateTime.now());
        book.setIsDeleted(false);
        book.setIsAvailable(true);
        bookRepository.save(book);
    }
}
