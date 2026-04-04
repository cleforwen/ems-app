package com.ems.common.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@ApplicationScoped
public class FileUploadService {

    @Inject
    Logger log;

    @ConfigProperty(name = "ems.upload.dir", defaultValue = "uploads")
    String uploadDir;

    @ConfigProperty(name = "ems.upload.base-url", defaultValue = "/uploads")
    String baseUrl;

    public String uploadFile(InputStream inputStream, String fileName, String subfolder) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = getFileExtension(fileName);
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(uniqueFileName);

        Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Uploaded file: " + filePath);

        return baseUrl + "/" + subfolder + "/" + uniqueFileName;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            String filePath = fileUrl.replace(baseUrl, uploadDir);
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.debug("Deleted file: " + path);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file: " + fileUrl, e);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    public boolean isImageFile(String fileName) {
        if (fileName == null) {
            return false;
        }
        String lower = fileName.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg") || 
               lower.endsWith(".jpeg") || lower.endsWith(".gif") || 
               lower.endsWith(".webp") || lower.endsWith(".bmp");
    }
}
