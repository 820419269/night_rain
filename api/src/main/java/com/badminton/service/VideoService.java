package com.badminton.service;

import com.badminton.model.Video;
import com.badminton.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoService {
    
    private final VideoRepository videoRepository;
    
    @Value("${upload.path}")
    private String uploadPath;
    
    public Video uploadVideo(MultipartFile file, String title, String description) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = UUID.randomUUID().toString() + extension;
        Path uploadDir = Paths.get(uploadPath);
        
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        
        Path filePath = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        Video video = new Video();
        video.setTitle(title);
        video.setFilePath("/uploads/videos/" + filename);
        video.setDescription(description);
        
        return videoRepository.save(video);
    }
    
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }
    
    public Video getVideoById(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found with id: " + id));
    }
    
    public void deleteVideo(Long id) {
        Video video = getVideoById(id);
        
        try {
            Path filePath = Paths.get(uploadPath).resolve(video.getFilePath().replace("/uploads/videos/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }
        
        videoRepository.delete(video);
    }
}
