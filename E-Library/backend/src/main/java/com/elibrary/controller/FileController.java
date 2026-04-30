package com.elibrary.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class FileController {

    // Get PDF directory - first try relative path from current directory, then fall back to parent paths
    private static String getPdfDirectory() {
        String[] possiblePaths = {
            System.getProperty("user.dir") + File.separator + "pdf",
            System.getProperty("user.dir") + File.separator + ".." + File.separator + "pdf",
            "E-Library" + File.separator + "pdf"
        };
        
        for (String path : possiblePaths) {
            File dir = new File(path);
            if (dir.exists() && dir.isDirectory()) {
                System.out.println("✅ PDF Directory found at: " + dir.getAbsolutePath());
                return dir.getAbsolutePath();
            }
        }
        
        // Default fallback
        return new File(System.getProperty("user.dir")).getParent() + File.separator + "E-Library" + File.separator + "pdf";
    }
    
    private static final String PDF_DIRECTORY = getPdfDirectory();

    @GetMapping("/list")
    public ResponseEntity<?> listPdfFiles() {
        try {
            File pdfDir = new File(PDF_DIRECTORY);
            File[] files = pdfDir.listFiles((dir, name) -> 
                name.toLowerCase().endsWith(".pdf") || name.toLowerCase().endsWith(".txt")
            );

            if (files == null || files.length == 0) {
                return ResponseEntity.ok().body(new ArrayList<>());
            }

            List<String> fileList = Arrays.stream(files)
                .map(File::getName)
                .sorted()
                .collect(Collectors.toList());

            return ResponseEntity.ok().body(fileList);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error listing files: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPdf(@RequestParam String title, @RequestParam(required = false) String author) {
        try {
            File pdfDir = new File(PDF_DIRECTORY);
            File[] files = pdfDir.listFiles((dir, name) -> 
                name.toLowerCase().endsWith(".pdf") || name.toLowerCase().endsWith(".txt")
            );

            if (files == null || files.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No PDF files found");
            }

            String titleLower = title.toLowerCase().replaceAll("\\s+", "-");
            String authorLower = author != null ? author.toLowerCase().replaceAll("\\s+", "-") : "";

            // Try exact match first
            for (File file : files) {
                String nameLower = file.getName().toLowerCase();
                if (nameLower.contains(titleLower)) {
                    if (author == null || nameLower.contains(authorLower)) {
                        return ResponseEntity.ok().body(file.getName());
                    }
                }
            }

            // Try fuzzy match (case-insensitive)
            for (File file : files) {
                String nameLower = file.getName().toLowerCase();
                if (containsAllWords(nameLower, titleLower)) {
                    if (author == null || nameLower.contains(authorLower)) {
                        return ResponseEntity.ok().body(file.getName());
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("PDF not found for: " + title);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error searching for file: " + e.getMessage());
        }
    }

    private boolean containsAllWords(String text, String searchTerms) {
        String[] words = searchTerms.split("-");
        for (String word : words) {
            if (word.length() > 2 && !text.contains(word)) {
                return false;
            }
        }
        return true;
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<?> downloadFile(@PathVariable String filename) {
        try {
            // Validate filename to prevent directory traversal attacks
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid filename");
            }

            Path filePath = Paths.get(PDF_DIRECTORY, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("File not found: " + filename);
            }

            // Determine content type based on file extension
            String lower = filename.toLowerCase();
            String contentType = "application/octet-stream";
            if (lower.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".csv")) {
                contentType = "text/plain; charset=UTF-8";
            }

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error reading file: " + e.getMessage());
        }
    }

    @GetMapping("/avatars/{filename:.+}")
    public ResponseEntity<?> getAvatar(@PathVariable String filename) {
        try {
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid filename");
            }
            String uploadDir = new java.io.File(System.getProperty("user.dir")).getParent() + java.io.File.separator + "E-Library" + java.io.File.separator + "uploads" + java.io.File.separator + "avatars";
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
            }
            
            String lower = filename.toLowerCase();
            String contentType = "application/octet-stream";
            if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".gif")) contentType = "image/gif";
            else if (lower.endsWith(".webp")) contentType = "image/webp";

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reading file");
        }
    }
}
