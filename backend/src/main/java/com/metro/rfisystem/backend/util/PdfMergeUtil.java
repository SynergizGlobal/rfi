package com.metro.rfisystem.backend.util;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;

import com.itextpdf.text.Document;
import com.itextpdf.text.pdf.PdfCopy;
import com.itextpdf.text.pdf.PdfReader;

public class PdfMergeUtil {
	  public static void mergePdfs(String outputPath, List<String> inputFiles) throws Exception {
	        Document document = new Document();
	        PdfCopy copy = new PdfCopy(document, new FileOutputStream(outputPath));
	        document.open();

	        for (String filePath : inputFiles) {
	            File file = new File(filePath);
	            if (!file.exists()) {
	                System.out.println("⚠️ Skipping missing file: " + filePath);
	                continue;
	            }

	            PdfReader reader = new PdfReader(filePath);
	            int totalPages = reader.getNumberOfPages();
	            for (int i = 1; i <= totalPages; i++) {
	                copy.addPage(copy.getImportedPage(reader, i));
	            }
	            reader.close();
	        }

	        document.close();
	        System.out.println("✅ Merged PDF created at: " + outputPath);
	    }

}
