package com.metro.rfisystem.backend.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
@Service
public class FileStorageService {
	
	   private final String baseDirectory = System.getProperty("user.dir") + File.separator + "uploads";

	    public String saveFile(MultipartFile file, String subFolder) {
	        try {
	            // Create target directory
	            Path uploadDir = Paths.get(baseDirectory, subFolder);
	            Files.createDirectories(uploadDir);

	            // Define unique filename
	            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
	            Path filePath = uploadDir.resolve(fileName);

	            // Save the file
	            file.transferTo(filePath.toFile());

	            // Return relative path for database storage
	            return "uploads/" + subFolder + "/" + fileName;

	        } catch (IOException e) {
	            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
	        }
	    }

}
