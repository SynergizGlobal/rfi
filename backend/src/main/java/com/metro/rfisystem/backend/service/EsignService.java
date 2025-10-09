package com.metro.rfisystem.backend.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.RSAPrivateKeySpec;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Optional;
import java.util.TimeZone;

import javax.xml.crypto.dsig.CanonicalizationMethod;
import javax.xml.crypto.dsig.DigestMethod;
import javax.xml.crypto.dsig.Reference;
import javax.xml.crypto.dsig.SignatureMethod;
import javax.xml.crypto.dsig.SignedInfo;
import javax.xml.crypto.dsig.Transform;
import javax.xml.crypto.dsig.XMLSignature;
import javax.xml.crypto.dsig.XMLSignatureFactory;
import javax.xml.crypto.dsig.dom.DOMSignContext;
import javax.xml.crypto.dsig.spec.C14NMethodParameterSpec;
import javax.xml.crypto.dsig.spec.TransformParameterSpec;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.log4j.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import com.itextpdf.text.Chunk;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfDate;
import com.itextpdf.text.pdf.PdfDictionary;
import com.itextpdf.text.pdf.PdfName;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfSignature;
import com.itextpdf.text.pdf.PdfSignatureAppearance;
import com.itextpdf.text.pdf.PdfStamper;
import com.itextpdf.text.pdf.PdfString;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.security.BouncyCastleDigest;
import com.itextpdf.text.pdf.security.ExternalDigest;
import com.itextpdf.text.pdf.security.ExternalSignature;
import com.itextpdf.text.pdf.security.ExternalSignatureContainer;
import com.itextpdf.text.pdf.security.MakeSignature;
import com.itextpdf.text.pdf.security.PdfPKCS7;
import com.itextpdf.text.pdf.security.PrivateKeySignature;
import com.metro.rfisystem.backend.controller.InspectionController;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.model.rfi.SignedXmlResponse;
import org.apache.xml.security.Init;
import org.bouncycastle.asn1.ASN1Sequence;
import org.bouncycastle.asn1.ASN1Sequence;
import org.bouncycastle.asn1.pkcs.RSAPrivateKey;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class EsignService {
	Logger logger = Logger.getLogger(InspectionController.class);
	
	@Value("${rfi.pdf.storage-path}")
	private String pdfStoragePath;
	
	static {
        Init.init();
    }
	
	final String ASP_PRIVATE_KEY = "MIIEpQIBAAKCAQEA2uK9rC+rvgBJpnrZt2uwRIxssXCxiViyV3ab109s3ez0sMtSHPIAIavedM4LaqM23XLJSL2XVVTij+ixvR9OEANKoz82FKfQ4TaO6CRvHRNyrrmJW3O0GY+/PmAZeEU8GwDqClU4RJXWbKr/Oq/7lPS7WFGrZqN5q1x5US8MtiGrYLv3KrmsxBjKgGb00hyhEtw7GPXSoxyZbjFVdK6csxqbzmUYpMkQJUs36+sFoj9U2u3LyT2ZguMmfZ3A1dEPqxBtK2tYhPIiCPwdYGDrdf8XfTOskQ5XIe8ptkHhuJA4OrMdQ5FNoS20GbZ7y8Z1I0v514e7XU4ILiyH1mCU8wIDAQABAoIBAQChXOqrV3Fq3tds7cA3IiKORl+S6BtZv5OqOvxkXF9Ls/Ynp5xfTmCecg/LWGK+OJin5IlTIMHB3JQxtz/gxoVL9ME/W8hIrfalMQ1lQgbQDphLCuiiDMhG19wK5dmg+pl25tOiznRuy2+KKP2DjF0R0OGUGJEdV4LIu6GMIf1i/k5JpoDPG8tuev/VuJRFwgBRn0rQ0KkwN3VcqixlbKj4IfcUoL1Lvb9oX71HlF2Z0kV2lUMm/E9MAw4nTa9vVxvV4Nuwgnk7cqanaUZX60k7DzPxH+Vvr1YC5Y4JM9mtfT9EDS3Xfl0Gc7iJ9DnjRbN0gP/TKImwMgNKb/ugFHQhAoGBAO8E2j866+WGLn61X1fSrYtKfuWkeUaNaqMcw0cVnyP449IZ4duQYKTSeM/ugrNi+JHhIpQ25+7uPwFcymUznkM/xZ4HJwGGEL55OZ9KlWmpOHWvHNc/xA2gEb2MYm1TAtuMsIxmLtxdJW7o6bML8C5KbGVDdqk40Kn3zq7bYThJAoGBAOpvtzs3+qe5UakvA3LURP32O2CqnCNLJ8O0W8qSWJHpv62OMZC2HihWSrAZCWJPzxbxz2eIrDacuZ/97e6ibb7L2f38OrVNQk0S3B5B9L7sbYjubCuy3c3CyVtXcSnZDu6GKWJvK8y/j8M8tRFzJW9ezNewxeDUR69CKk/3kvtbAoGBAO3O4SoqAIyD3Xy6Dht+BKbivrDS3MriZufU9UGjdIvA1UKz97CRzGYQ9pzDDI1YekICQno+yrJBnrRHUyQvoFX+fCsHqLpuXfh0+mzPMytGb2M/kC1lRzXbPeteYoutHNm99+YowJUFo/neiK5YwWX9LC3wWn5xhcKmSKBWqzrpAoGAWX5QGkEiZIiwDb+ut1UlCTXIMPywIiD8iw78w3XebcUnsN9JOI7tMETQuiy0kl0ZFw80N7fK1gY6LkNHYwOKlX1IOFbjKnbVyopakQponcGvhshNbtkXJwcmysG0p17+/jsk7Ti3JbAy9zrjfEfSkJNF60jGIS+oNdUyRdiiuWUCgYEA2gHseob1QdI6PL8tQKSmcoIo5b2L1ZLOi/lklYFNPpScE1kAIyoSZ2mbCk9oNj0rTmgXnz6wUjVGKCsxr3exzXVR/LcC/CyDuE8kX27C2rkBUcXvQEzbwa2Gic+LHGG5r2ZmgekQjAct/OsSo2lO00zBM/leRNfPCi8YHtiJXwo=";
	final String ESP_PUBLIC_CERTIFICATE = "MIIDOjCCAiICCQDy1hy4bTK08TANBgkqhkiG9w0BAQUFADBfMQswCQYDVQQGEwJJTjEUMBIGA1UECAwLTWFoYXJhc2h0cmExDTALBgNVBAcMBFB1bmUxDjAMBgNVBAoMBUMtREFDMRswGQYDVQQDDBJlcy1zdGFnaW5nLmNkYWMuaW4wHhcNMjIwMzA5MDcyMjIzWhcNMjcwMzA4MDcyMjIzWjBfMQswCQYDVQQGEwJJTjEUMBIGA1UECAwLTWFoYXJhc2h0cmExDTALBgNVBAcMBFB1bmUxDjAMBgNVBAoMBUMtREFDMRswGQYDVQQDDBJlcy1zdGFnaW5nLmNkYWMuaW4wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC4BeZ6vgBnxDeByj8hV6ou9WxL3XZrbRWsIXCjmWxAbe6/9C4XHuJF+7SjT2HikJ7F7Z6V/gCETUP2rwqOEPWrk5AW5FbosmX6pLzWUL6EE4xHaWUX5GIBwRIQvIIVN66Mct0TzO/JzyG5WtC1siS8jFHbkgpPG81rxHvAcv6WARCjlP6wBoVmFZj/BRw6EpHcu7q3Xp6POdB/Th9AIC+OlCKVfBtwz1BW9Lrqvxus4vqhYYK9544G/KMCjpoti4kTs0gCnHu6m8HwYpQ+SVeAbzxYGIYNXQrqt+GMHkZzf/GESIvnBtHxUYSuw4K6zeyzLm8C2/TKG1wUCuuvRFINAgMBAAEwDQYJKoZIhvcNAQEFBQADggEBADyKTAHyz1MeuT8UAkD181GO6IDT02FzV/BFzCuRhBmJTT6s9KQ/T1/hfX+K6XLFV6K0li3juEtnuxpmNrHX13DkwHmbM5NAi+LBgqSMc/8qWSBNPkKlr5GfwJh+Ar+RNvhZU1jSdAwJZAs8qDJCN/9ugnWzoHFMAPVpSqdXL+moqHCY+tM1yyEoaaIb9A1dpkasbt5IUMezUa8/R80SplFWmBmldS5pGf2AI7cDb08zi3T0rD7K/VGxSXJR+/3ThB2r3ysaiHntautOtdX+6EyabZcfxPAIG+vePGOKnCByH32rlOI2jCMBNFbhyn2ey18qBKlNgzmnhzEHIf61fo8=";
	
	private PdfStamper stamper;
    private PdfSignatureAppearance appearance;
    private File tempSignedPdfFile;
	
	@Autowired
	private InspectionService inspectionService;
	
	@Autowired
	private PdfService pdfService;
	
	public void signWithDS(String txnId, String eSignResponse, String conName) throws Exception {
	    RFIInspectionDetails rfi = inspectionService.getRFIIdTxnId(txnId, "Contractor");

	    File pdfDir = new File(pdfStoragePath);
	    if (!pdfDir.exists()) pdfDir.mkdirs();

	    String pdfPath = pdfDir + "/" + rfi.getId() + ".pdf";
	    String signedPdfPath = pdfDir + "/signed_" + txnId + ".pdf";

	    PdfReader reader = new PdfReader(pdfPath);
	    FileOutputStream fos = new FileOutputStream(signedPdfPath);

	    PdfStamper stamper = PdfStamper.createSignature(reader, fos, '\0', null, true);
	    PdfSignatureAppearance appearance = stamper.getSignatureAppearance();

	    if (conName == null || conName.isEmpty()) {
	        conName = "Contractor";
	    }

	    // ==============================
	    // Contractor DSC Rectangle
	    // ==============================
	    Rectangle pageSize = reader.getPageSize(1);
	    Rectangle rect = new Rectangle(
	        pageSize.getLeft(80),    // little padding from left
	        pageSize.getBottom(100), // DSC box bottom
	        pageSize.getLeft(280),   // width
	        pageSize.getBottom(180)  // DSC box top (higher than label)
	    );

	    appearance.setReason("Contractor's Representative approval");
	    appearance.setLocation("India");

	    String signatureText = "Digitally signed by\n"
	            + "Name: " + conName + "\n"
	            + "Date: " + new java.text.SimpleDateFormat("yyyy.MM.dd HH:mm:ss z").format(new java.util.Date()) + "\n"
	            + "Reason: Contractor's Representative approval\n"
	            + "Location: India";

	    appearance.setLayer2Text(signatureText);
	    appearance.setVisibleSignature(rect, 1, "ContractorSignature");

	    // Extract signature bytes
	    String base64Sig = eSignResponse.replaceAll("(?s).*<DocSignature.*?>(.*?)</DocSignature>.*", "$1")
	                                    .replaceAll("\\s+", "");
	    byte[] sigBytes = Base64.getDecoder().decode(base64Sig);

	    ExternalSignatureContainer external = new ExternalSignatureContainer() {
	        @Override
	        public byte[] sign(InputStream is) {
	            return sigBytes;
	        }
	        @Override
	        public void modifySigningDictionary(PdfDictionary signDic) {}
	    };

	    MakeSignature.signExternalContainer(appearance, external, sigBytes.length);

	    // ==============================
	    // Disclaimer for all pages except 1
	    // ==============================
	    String disclaimerText = buildDisclaimer(rfi, false, null);

	    for (int i = 2; i <= reader.getNumberOfPages(); i++) {
	        PdfContentByte canvas = stamper.getOverContent(i);
	        ColumnText.showTextAligned(
	            canvas, Element.ALIGN_CENTER,
	            new Phrase(disclaimerText, new Font(Font.FontFamily.HELVETICA, 8)),
	            reader.getPageSize(i).getWidth() / 2,
	            25,
	            0
	        );
	    }

	    stamper.close();
	    reader.close();

	    System.out.println("Contractor-signed PDF created at: " + signedPdfPath);
	}



	public void signWithDSEngineer(String txnId, String eSignResponse, String engName) throws Exception {
	    RFIInspectionDetails rfi = inspectionService.getRFIIdTxnId(txnId, "Engineer");

	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
	    String today = LocalDate.now().format(formatter);

	    File pdfDir = new File(pdfStoragePath);
	    if (!pdfDir.exists()) pdfDir.mkdirs();

	    String inputPdfPath = pdfDir + "/signed_" + txnId + ".pdf";               // Contractor signed
	    String engineerSignedPdfPath = pdfDir + "/signed_engineer_" + txnId + ".pdf"; 
	    String finalPdfPath = pdfDir + "/signed_engineer_" + txnId + "_final.pdf";    

	    PdfReader reader = new PdfReader(inputPdfPath);
	    FileOutputStream fos = new FileOutputStream(engineerSignedPdfPath);

	    PdfStamper stamper = PdfStamper.createSignature(reader, fos, '\0', null, true);
	    PdfSignatureAppearance appearance = stamper.getSignatureAppearance();

	    if (engName == null || engName.isEmpty()) {
	        engName = "Engineer";
	    }

	    // ==============================
	    // Engineer DSC Rectangle (bottom-right above MRVC Representative)
	    // ==============================
	    Rectangle pageSize = reader.getPageSize(1);
	    Rectangle rect = new Rectangle(
	        pageSize.getRight(280),   // shift left to center above label
	        pageSize.getBottom(100),  // bottom Y
	        pageSize.getRight(80),    // right padding
	        pageSize.getBottom(180)   // top Y (higher than label)
	    );

	    appearance.setReason("Employer's Representative approval");
	    appearance.setLocation("India");

	    String signatureText = "Digitally signed by\n"
	            + "Name: " + engName + "\n"
	            + "Date: " + new java.text.SimpleDateFormat("yyyy.MM.dd HH:mm:ss z").format(new java.util.Date()) + "\n"
	            + "Reason: Employer's Representative approval\n"
	            + "Location: India";

	    appearance.setLayer2Text(signatureText);
	    appearance.setVisibleSignature(rect, 1, "EngineerSignature");

	    // Extract signature bytes
	    String base64Sig = eSignResponse.replaceAll("(?s).*<DocSignature.*?>(.*?)</DocSignature>.*", "$1")
	                                    .replaceAll("\\s+", "");
	    byte[] sigBytes = Base64.getDecoder().decode(base64Sig);

	    ExternalSignatureContainer external = new ExternalSignatureContainer() {
	        @Override
	        public byte[] sign(InputStream is) {
	            return sigBytes;
	        }
	        @Override
	        public void modifySigningDictionary(PdfDictionary signDic) {}
	    };

	    MakeSignature.signExternalContainer(appearance, external, sigBytes.length);
	    stamper.close();
	    reader.close();

	    // ==============================
	    // Step 2: Disclaimer (Approved case)
	    // ==============================
	    PdfReader reader2 = new PdfReader(engineerSignedPdfPath);
	    PdfStamper stamper2 = new PdfStamper(reader2, new FileOutputStream(finalPdfPath));

	    String disclaimerText = buildDisclaimer(rfi, true, today);

	    for (int i = 2; i <= reader2.getNumberOfPages(); i++) {
	    	PdfContentByte canvas = stamper2.getOverContent(i);
            float pageWidth = reader2.getPageSize(i).getWidth();
            float pageHeight = reader2.getPageSize(i).getHeight();
            float bottomMargin = 45f; // Safe margin above the physical footer
            float maxWidth = pageWidth - 100f; // left-right padding
 
            Font footerFont = new Font(Font.FontFamily.HELVETICA, 8);
            Phrase footerPhrase = new Phrase(disclaimerText, footerFont);
 
            // Wrap long text to fit inside the page
            ColumnText ct = new ColumnText(canvas);
            ct.setSimpleColumn(
                    50f, // left margin
                    bottomMargin, // bottom Y limit
                    pageWidth - 50f, // right margin
                    bottomMargin + 40f // top Y limit for footer
            );
            ct.setAlignment(Element.ALIGN_CENTER);
            ct.setText(footerPhrase);
            ct.go();
        }
 

	    stamper2.close();
	    reader2.close();

	    System.out.println("Engineer-signed PDF created at: " + finalPdfPath);
	}


	private String buildDisclaimer(RFIInspectionDetails rfi, boolean isApproved, String approvedDate) {
	    String submissionDate = (rfi.getDateOfInspection() != null) 
	            ? rfi.getDateOfInspection().toString() 
	            : "xx-xx-202x";

	    if (isApproved) {
	        return "RFI No. " + rfi.getId()
	            + " is submitted by Contractor on " + rfi.getContractor_submitted_date()
	            + " and approved by Engineer on " + rfi.getEngineer_submitted_date() + ". "
	            + "It is a digitally generated document and is electronically signed on 1st page of this RFI.";
	    } else {
	        return "RFI No. " + rfi.getId()
	            + " is submitted by Contractor on " + rfi.getContractor_submitted_date()
	            + " and is yet to be approved by Engineer. "
	            + "It is a digitally generated document and is electronically signed on 1st page of this RFI.";
	    }
	}

	
	public void applyEsignResponseToPdf(String eSignResponse, String srcPdf, String destPdf) throws Exception {

	    PdfReader reader = new PdfReader(srcPdf);
	    FileOutputStream fos = new FileOutputStream(destPdf);

	    // Use append mode
	    PdfStamper stamper = PdfStamper.createSignature(reader, fos, '\0', null, true);
	    PdfSignatureAppearance appearance = stamper.getSignatureAppearance();
	    appearance.setReason("Contractor's Representative approval");
	    appearance.setLocation("India");
	    appearance.setVisibleSignature(new com.itextpdf.text.Rectangle(36, 36, 286, 136),
	                                   reader.getNumberOfPages(), "ContractorSignature");

	    // Extract DocSignature from XML response
	    String base64Sig = eSignResponse.split("<DocSignature")[1]
	                                   .split(">")[1]
	                                   .split("</DocSignature>")[0]
	                                   .replaceAll("\\s+", "");
	    byte[] sigBytes = Base64.getDecoder().decode(base64Sig);

	    // External signature container
	    ExternalSignatureContainer external = new ExternalSignatureContainer() {
	        @Override
	        public byte[] sign(InputStream is) {
	            try {
	                // iText passes the signed hash here; we just return eSign bytes
	                return sigBytes;
	            } catch (Exception e) {
	                throw new RuntimeException(e);
	            }
	        }

	        @Override
	        public void modifySigningDictionary(com.itextpdf.text.pdf.PdfDictionary signDic) {
	            // No changes needed
	        }
	    };

	    // Apply external signature
	    MakeSignature.signExternalContainer(appearance, external, sigBytes.length + 8192);

	    stamper.close();
	    reader.close();

	    System.out.println(" PDF signed using eSign response at: " + destPdf);
	}


	public File pdfSignerWithAppearance(String pdfPath, String txnId) throws Exception {
		File pdfDir = new File(pdfStoragePath);
		if (!pdfDir.exists()) pdfDir.mkdirs();
//	    String tempPath = "C:/Users/OSuvarna/git/rfi/frontend/pdfs/unsigned_" + txnId + ".pdf";
//	    
//	    File tempSignedPdfFile = new File(tempPath);
		 File tempSignedPdfFile = new File(pdfStoragePath,"unsigned_" + txnId + ".pdf");

	    PdfReader reader = new PdfReader(pdfPath);
	    FileOutputStream fos = new FileOutputStream(tempSignedPdfFile);
	    PdfStamper stamper = PdfStamper.createSignature(reader, fos, '\0', null, true);

	    PdfSignatureAppearance appearance = stamper.getSignatureAppearance();
	    appearance.setReason("Contractor's Representative approval");
	    appearance.setLocation("India");

	    // Increased size of signature rectangle (width=250, height=100)
	    Rectangle rect = new Rectangle(36, 36, 286, 136); // x=36, y=36, width=250, height=100
	    appearance.setVisibleSignature(rect, reader.getNumberOfPages(), "ContractorSignature");

	    // Reserve enough space for the signature
	    HashMap<PdfName, Integer> exc = new HashMap<>();
	    exc.put(PdfName.CONTENTS, 8192 * 16); // 131072 bytes reserved
	    appearance.preClose(exc);

	    stamper.close();
	    reader.close();

	    System.out.println(" Prepared unsigned PDF at: " + tempSignedPdfFile.getAbsolutePath());
	    return tempSignedPdfFile; // Return the file for further signing
	}



	
	public void signPdf(String srcPdf, String destPdf, PrivateKey privateKey, Certificate[] chain) throws Exception {
	    PdfReader reader = new PdfReader(srcPdf);
	    FileOutputStream fos = new FileOutputStream(destPdf);
	    PdfStamper stamper = PdfStamper.createSignature(reader, fos, '\0');

	    PdfSignatureAppearance appearance = stamper.getSignatureAppearance();
	    appearance.setReason("Contractor's Representative approval");
	    appearance.setLocation("India");
	    Rectangle rect = new Rectangle(36, 36, 186, 86);
	    appearance.setVisibleSignature(rect, reader.getNumberOfPages(), "ContractorSignature");

	    // Create the actual signature
	    ExternalSignature es = new PrivateKeySignature(privateKey, "SHA256", "BC");
	    ExternalDigest digest = new BouncyCastleDigest();
	    MakeSignature.signDetached(appearance, digest, es, chain, null, null, null, 0, MakeSignature.CryptoStandard.CMS);

	    System.out.println(" Signed PDF saved at: " + destPdf);
	}



	
	public SignedXmlResponse getSignedXmlRequestFromDocument (byte[] pdfData, String sc, String txnId, String signerName, String companyName, Integer signY) throws Exception {
		File tempPdfFile = File.createTempFile("temp", ".pdf");
	    try (FileOutputStream fos = new FileOutputStream(tempPdfFile)) {
	        fos.write(pdfData);
	    }
	    
	    String documentHash = pdfSignerWithConAppearance(tempPdfFile, signerName, companyName, signY);

		String xmlRequest = generateEsignXmlRequest(documentHash, sc, txnId);
		String signedXmlRequest = generateSignedXMLRequest(xmlRequest, ASP_PRIVATE_KEY);
		return new SignedXmlResponse (signedXmlRequest, txnId);
	}
	
	public SignedXmlResponse getEngSignedXmlRequestFromDocument (byte[] pdfData, String sc, String txnId, String signerName, String companyName, Integer signY) throws Exception {
	    
		
		 File signedPdfFile = new File(pdfStoragePath,"signed_" + txnId + ".pdf");
		    if (!signedPdfFile.exists()) {
		        throw new FileNotFoundException("Signed PDF not found: " + signedPdfFile.getAbsolutePath());
		    }	
		
		 	String documentHash = pdfSignerWithEngAppearance(signedPdfFile, signerName, companyName, signY);

		    String xmlRequest = generateEngEsignXmlRequest(documentHash, sc, txnId);

		    String signedXmlRequest = generateSignedXMLRequest(xmlRequest, ASP_PRIVATE_KEY);

		    return new SignedXmlResponse(signedXmlRequest, txnId);
	}	
	
	
	public String pdfSignerWithEngAppearance(File file, String signerName, String departmentName, Integer signY) throws Exception {
	    String hashDocument = null;
	    PdfReader reader = null;

	    try {
	        // Open contractor-signed PDF
	        reader = new PdfReader(file.getAbsolutePath());

	        // Save engineer appended signature into a new temp file
	        File tempSignedEngPdfFile = new File(file.getParent(), "Temp_Signed_Eng_Pdf.pdf");
	        FileOutputStream fout = new FileOutputStream(tempSignedEngPdfFile);

	        // Append mode = true → keeps contractor signature
	        PdfStamper stamper = PdfStamper.createSignature(reader, fout, '\0', null, true);
	        PdfSignatureAppearance appearance = stamper.getSignatureAppearance();

	        // Footer-right placement (last page)
	        Rectangle cropBox = reader.getCropBox(1);
	        float pageWidth = cropBox.getWidth();
	        float bottomY = cropBox.getBottom();

	        Rectangle signatureRect = new Rectangle(
	            pageWidth - 200,   // move near right
	            bottomY + 30,      // footer height
	            pageWidth - 20,
	            bottomY + 100
	        );

	        // Place engineer sign on last page, bottom right
	        appearance.setVisibleSignature(signatureRect, reader.getNumberOfPages(), "engSig");
	        appearance.setCertificationLevel(PdfSignatureAppearance.NOT_CERTIFIED);
	        appearance.setRenderingMode(PdfSignatureAppearance.RenderingMode.DESCRIPTION);

	        // Signature text content
	        String signingTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Calendar.getInstance().getTime());
	        String layer2Text = "Digitally Signed By:\n"
	                + signerName + "\n"
	                + departmentName + "\nDate: " + signingTime
	                + "\nSignature Verified";
	        appearance.setLayer2Text(layer2Text);

	        // Digital signature dictionary
	        PdfSignature dic = new PdfSignature(PdfName.ADOBE_PPKLITE, PdfName.ADBE_PKCS7_DETACHED);
	        dic.setReason("Engineer Signing Document");
	        dic.setDate(new PdfDate(Calendar.getInstance()));
	        appearance.setCryptoDictionary(dic);

	        // Reserve space for digital signature
	        int estimatedContentSize = 8192;
	        HashMap<PdfName, Integer> exc = new HashMap<>();
	        exc.put(PdfName.CONTENTS, estimatedContentSize * 2 + 2);
	        appearance.preClose(exc);

	        // Calculate SHA-256 hash
	        try (InputStream is = appearance.getRangeStream()) {
	            hashDocument = DigestUtils.sha256Hex(is);
	        }

	    } finally {
	        if (reader != null) {
	            reader.close();
	        }
	    }

	    return hashDocument;
	}

	

	
	public String pdfSignerWithConAppearance(File file, String signerName, String companyName, Integer signY) throws Exception {
	    String hashDocument = null;
	    PdfReader reader = null;

	    try {
	        reader = new PdfReader(file.getAbsolutePath());
	        tempSignedPdfFile = new File(file.getParent(), "Temp_Signed_Pdf.pdf");
	        FileOutputStream fout = new FileOutputStream(tempSignedPdfFile);

	        stamper = PdfStamper.createSignature(reader, fout, '\0', null, true);
	        this.appearance = stamper.getSignatureAppearance();

	        // Define position for the signature
	        Rectangle cropBox = reader.getCropBox(1);
	        float topY = cropBox.getTop();

	        Rectangle signatureRect = new Rectangle(
	            cropBox.getLeft() + 36,     // X from left
	            topY - signY - 100,         // Adjusted bottom Y
	            cropBox.getLeft() + 236,    // Right X
	            topY - signY                // Top Y
	        );

	        // Set the visible signature box and rendering
	        appearance.setVisibleSignature(signatureRect, reader.getNumberOfPages(), "sig1");
	        appearance.setCertificationLevel(PdfSignatureAppearance.NOT_CERTIFIED);
	        appearance.setRenderingMode(PdfSignatureAppearance.RenderingMode.DESCRIPTION);

	        // Set descriptive text that appears in the signature box
	        String signingTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Calendar.getInstance().getTime());
	        String layer2Text = "Digitally Signed By:\n" + signerName + "\n" + companyName + "\nDate: " + signingTime + "\nSignature Verified";
	        appearance.setLayer2Text(layer2Text);

	        // Digital signature properties
	        PdfSignature dic = new PdfSignature(PdfName.ADOBE_PPKLITE, PdfName.ADBE_PKCS7_DETACHED);
	        dic.setReason("Signing Document");
	        dic.setDate(new PdfDate(Calendar.getInstance()));
	        appearance.setCryptoDictionary(dic);

	        // Reserve space for the digital signature
	        int estimatedContentSize = 8192;
	        HashMap<PdfName, Integer> exc = new HashMap<>();
	        exc.put(PdfName.CONTENTS, estimatedContentSize * 2 + 2);
	        appearance.preClose(exc);

	        // Calculate document hash
	        try (InputStream is = appearance.getRangeStream()) {
	            hashDocument = DigestUtils.sha256Hex(is);
	        }

	    } finally {
	        if (reader != null) {
	            reader.close();
	        }
	    }

	    return hashDocument;
	}

	private String generateEsignXmlRequest(String documentHash, String sc, String txnId) {
	    String ts = getCurrentTimestampIST();
	    return "<Esign ver=\"2.1\" sc=\"" + sc + "\" ts=\"" + ts + "\" txn=\"" + txnId + "\" ekycIdType=\"A\" aspId=\"MRVC-902\" AuthMode=\"1\" responseSigType=\"pkcs7\" responseUrl=\"https://localhost:8443/rfi/signedResponse\"><Docs><InputHash id=\"1\" hashAlgorithm=\"SHA256\" docInfo=\"Bill data\">" + documentHash + "</InputHash></Docs></Esign>";
	}
	
	private String generateEngEsignXmlRequest(String documentHash, String sc, String txnId) {
	    String ts = getCurrentTimestampIST();
	    return "<Esign ver=\"2.1\" sc=\"" + sc + "\" ts=\"" + ts + "\" txn=\"" + txnId + "\" ekycIdType=\"A\" aspId=\"MRVC-902\" AuthMode=\"1\" responseSigType=\"pkcs7\" responseUrl=\"https://localhost:8443/rfi/engineerSignedResponse\"><Docs><InputHash id=\"1\" hashAlgorithm=\"SHA256\" docInfo=\"Bill data\">" + documentHash + "</InputHash></Docs></Esign>";
	}	
	
	public String generateSignedXMLRequest(String xmlContent, String privateKeyString) {
	    try {
	        XMLSignatureFactory signatureFactory = XMLSignatureFactory.getInstance("DOM");
	        PrivateKey privateKey = loadPrivateKeyFromString (privateKeyString);

	        Reference ref = signatureFactory.newReference(
	            "", 
	            signatureFactory.newDigestMethod(DigestMethod.SHA256, null),
	            Collections.singletonList(
	                signatureFactory.newTransform(Transform.ENVELOPED, (TransformParameterSpec) null)
	            ),
	            null, 
	            null
	        );

	        SignedInfo signedInfo = signatureFactory.newSignedInfo(
	            signatureFactory.newCanonicalizationMethod(
	                CanonicalizationMethod.INCLUSIVE, (C14NMethodParameterSpec) null
	            ),
	            signatureFactory.newSignatureMethod(SignatureMethod.RSA_SHA1, null),
	            Collections.singletonList(ref)
	        );

	        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
	        dbf.setNamespaceAware(true);
	        DocumentBuilder documentBuilder = dbf.newDocumentBuilder();
	        Document doc = documentBuilder.parse(new ByteArrayInputStream(xmlContent.getBytes(StandardCharsets.UTF_8)));

	        DOMSignContext domSignContext = new DOMSignContext(privateKey, doc.getDocumentElement());

	        XMLSignature xmlSignature = signatureFactory.newXMLSignature(signedInfo, null);

	        xmlSignature.sign(domSignContext);

	        OutputStream os = new ByteArrayOutputStream();
	        TransformerFactory transformerFactory = TransformerFactory.newInstance();
	        Transformer transformer = transformerFactory.newTransformer();
	        transformer.setOutputProperty(OutputKeys.INDENT, "no");
	        transformer.transform(new DOMSource(doc), new StreamResult(os));

	        return os.toString();
	    } catch (Exception e) {
	        throw new RuntimeException("Failed to generate signed XML request: " + e.getMessage(), e);
	    }
	}
	
	private String getCurrentTimestampIST() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
        dateFormat.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));

        return dateFormat.format(Calendar.getInstance().getTime());
    }
	
	private PrivateKey loadPrivateKeyFromString(String privateKeyString) throws Exception {
	    try {
	        String rsaPem = privateKeyString
	            .replace("-----BEGIN RSA PRIVATE KEY-----", "")
	            .replace("-----END RSA PRIVATE KEY-----", "")
	            .replaceAll("\\s+", "");
	        
	        byte[] encodedBytes = Base64.getDecoder().decode(rsaPem);
	        
	        RSAPrivateKey asn1PrivKey = RSAPrivateKey.getInstance(ASN1Sequence.fromByteArray(encodedBytes));
	        
	        RSAPrivateKeySpec rsaPrivKeySpec = new RSAPrivateKeySpec(
	            asn1PrivKey.getModulus(),
	            asn1PrivKey.getPrivateExponent()
	        );
	        
	        KeyFactory kf = KeyFactory.getInstance("RSA");
	        return kf.generatePrivate(rsaPrivKeySpec);
	        
	    } catch (Exception e) {
	        throw new Exception("Failed to load private key: " + e.getMessage(), e);
	    }
	}
}