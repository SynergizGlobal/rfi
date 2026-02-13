package com.metro.rfisystem.backend.serviceImpl;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.UserProfileDTO;
import com.metro.rfisystem.backend.dto.UserUpdateDTO;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.repository.pmis.UserRepository;
import com.metro.rfisystem.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

	@Autowired
	 private final UserRepository userRepository;
	
	@Value("${rfi.dsc.storage-path}")
	private String dscStoragePath;
	    
	    @Override
	    public UserProfileDTO getUserProfile(String userId) {
	        Optional<User> userOpt = userRepository.findByUserIdIgnoreCase(userId);

	        if (!userOpt.isPresent()) {
	            return null; // or throw custom exception
	        }

	        User user = userOpt.get();
	        return mapToDTO(user);
	    }

	    private UserProfileDTO mapToDTO(User user) {
	        UserProfileDTO dto = new UserProfileDTO();
	        dto.setName(user.getUserName());
	        dto.setRole(user.getUserRoleNameFk());
	        dto.setEmail(user.getEmailId());
	        dto.setPhone(user.getMobileNumber() != null ? user.getMobileNumber().toString() : null);
	        dto.setPersonalNumber(user.getPersonalContactNumber() != null ? String.valueOf(user.getPersonalContactNumber().longValue()) : null);
	        dto.setUserRole(user.getUserRoleNameFk());
	        dto.setUserType(user.getUserTypeFk());
	        dto.setDepartment(user.getDepartmentFk());
	        dto.setReportingTo(user.getReportingToIdSrfk());
	        dto.setLandLine(user.getLandline() != null ? user.getLandline().toString() : null);
	        dto.setExtension(user.getExtension() != null ? String.valueOf(user.getExtension().longValue()) : null);
	        dto.setPmisKey(user.getPmisKeyFk());
	        return dto;
	    }
	    
	    @Override
	    public boolean updateContactDetails(String userId, UserUpdateDTO dto) {
	        Optional<User> userOpt = userRepository.findByUserIdIgnoreCase(userId);
	        if (!userOpt.isPresent()) return false;

	        User user = userOpt.get();

	        if (dto.getEmail() != null) {
	            user.setEmailId(dto.getEmail());
	        }

	        if (dto.getPhone() != null && !dto.getPhone().isEmpty()) {
	            user.setMobileNumber(Long.parseLong(dto.getPhone()));
	        }

	        if (dto.getPersonalNumber() != null && !dto.getPersonalNumber().isEmpty()) {
	            user.setPersonalContactNumber(Double.parseDouble(dto.getPersonalNumber()));
	        }

	        userRepository.save(user);
	        return true;
	    }


//	    private static final String DSC_BASE_PATH = "C:/projects/rfi/dsc/"; // Change path as needed

	    public boolean checkUserDSC(String userId) {
	        if (userId == null || userId.isEmpty()) {
	            System.out.println("Invalid userId");
	            return false;
	        }

	        // User folder path
	        File userFolder = new File(dscStoragePath, userId);
	        System.out.println("User folder path: " + userFolder.getAbsolutePath());
	        System.out.println("Folder exists: " + userFolder.exists());
	        System.out.println("Is directory: " + userFolder.isDirectory());

	        // Check signed.xml
	        File signedXmlFile = new File(userFolder, "signed.xml");
	        System.out.println("Signed XML path: " + signedXmlFile.getAbsolutePath());
	        System.out.println("Signed XML exists: " + signedXmlFile.exists());

	        return signedXmlFile.exists();
	    }



	    public boolean saveUserDSC(String userId, MultipartFile signatureFile, String signerName) {
	        try {
	            File userFolder = new File(dscStoragePath + userId);
	            if (!userFolder.exists()) {
	                userFolder.mkdirs();
	            }

	            // Save signature image
	            File sigFile = new File(userFolder, "signature.png");
	            try (FileOutputStream fos = new FileOutputStream(sigFile)) {
	                fos.write(signatureFile.getBytes());
	            }

	            // Save signer name as text
	            File nameFile = new File(userFolder, "signerName.txt");
	            Files.writeString(nameFile.toPath(), signerName);

	            return true;
	        } catch (Exception e) {
	            e.printStackTrace();
	            return false;
	        }
	    }

	    // Read DSC image
	    public byte[] getUserDSCImage(String userId) {
	        try {
	            File sigFile = new File(dscStoragePath + userId + "/signature.png");
	            if (!sigFile.exists()) return null;
	            return Files.readAllBytes(sigFile.toPath());
	        } catch (Exception e) {
	            e.printStackTrace();
	            return null;
	        }
	    }
	    
	    public boolean saveUserSignature(String userId, String eSignResponse, String signerName) {
	        try {
	            // 1️⃣ Base folder
//	            String baseDir = "C:/projects/rfi/dsc/";
	            File userFolder = new File(dscStoragePath + userId);

	            // Create folder if not exists
	            if (!userFolder.exists()) {
	                userFolder.mkdirs();
	            }

	            // 2️⃣ Extract <DocSignature> tag
	            String base64Signature = eSignResponse.replaceAll("(?s).*<DocSignature.*?>(.*?)</DocSignature>.*", "$1")
	                                                 .replaceAll("\\s+", "");

	            if (base64Signature == null || base64Signature.trim().isEmpty()) {
	                System.out.println("Signature Not Found in XML");
	                return false;
	            }

	            // 3️⃣ Save signature into signature.txt
	            File signatureFile = new File(userFolder, "signature.txt");
	            Files.write(signatureFile.toPath(),
	                        base64Signature.getBytes(StandardCharsets.UTF_8),
	                        StandardOpenOption.CREATE);

	            // 4️⃣ Save signer name into user.txt
	            File nameFile = new File(userFolder, "user.txt");
	            Files.write(nameFile.toPath(),
	                        signerName.getBytes(StandardCharsets.UTF_8),
	                        StandardOpenOption.CREATE);

	            System.out.println("DSC saved successfully in: " + userFolder.getAbsolutePath());
	            return true;

	        } catch (Exception ex) {
	            ex.printStackTrace();
	            return false;
	        }
	    }
	    
	    @Override
		public Optional<User> findById(String userId) {
			return userRepository.findById(userId);
			
		}

	    
}
