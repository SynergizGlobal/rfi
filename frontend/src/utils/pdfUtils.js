import jsPDF from "jspdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import autoTable from "jspdf-autotable";


let externalPdfBlobs = [];

// Convert image/File to Base64
export const toBase64 = async (url) => {
	const response = await fetch(url);
	const blob = await response.blob();
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
};



export async function mergeWithExternalPdfs(jsPDFDoc, externalPdfBlobs) {
  const mainPdfBytes = jsPDFDoc.output("arraybuffer");
  const mainPdf = await PDFDocument.load(mainPdfBytes);
  const mergedPdf = await PDFDocument.create();

  // Copy main PDF pages first
  const mainPages = await mergedPdf.copyPages(mainPdf, mainPdf.getPageIndices());
  mainPages.forEach((page) => mergedPdf.addPage(page));

  // 🔧 Iterate and normalize each external PDF
  for (let i = 0; i < externalPdfBlobs.length; i++) {
    let fileBlob = externalPdfBlobs[i];

    // 🧩 Normalize: ensure it's a Blob
    if (typeof fileBlob === "string") {
      if (fileBlob.startsWith("data:application/pdf")) {
        // Base64 → Blob
        const byteString = atob(fileBlob.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
        fileBlob = new Blob([ab], { type: "application/pdf" });
      } else {
        // URL → fetch → Blob
        const response = await fetch(fileBlob);
        fileBlob = await response.blob();
      }
    }

    // 🧠 Now definitely a Blob or File
    const fileBytes = await fileBlob.arrayBuffer();
    const externalPdf = await PDFDocument.load(fileBytes);

    const copiedPages = await mergedPdf.copyPages(externalPdf, externalPdf.getPageIndices());
    const isEnclosure = i > 0;
    const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    for (let j = 0; j < copiedPages.length; j++) {
      const page = copiedPages[j];
      const { width, height } = page.getSize();

      const topGap = isEnclosure && j === 0 ? 60 : 0;
      const bottomGap = isEnclosure && j === 0 ? 20 : 0;
      const newPage = mergedPdf.addPage([width, height + topGap + bottomGap]);

      if (isEnclosure && j === 0) {
        newPage.drawText("Enclosure PDF", {
          x: 50,
          y: height + bottomGap + 10,
          size: 18,
          font,
          color: rgb(0, 0, 0),
        });
        const embeddedPage = await mergedPdf.embedPage(page);
        newPage.drawPage(embeddedPage, { x: 0, y: bottomGap });
      } else {
        const embeddedPage = await mergedPdf.embedPage(page);
        newPage.drawPage(embeddedPage, { x: 0, y: 0 });
      }
    }
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes], { type: "application/pdf" });
}

// ==============================
// Generate Inspection PDF
// ==============================
export async function generateInspectionPdf(rfiData) {
	const doc = new jsPDF("p", "pt", "a4");

	// ==============================
	// Mandatory & optional fields handling
	// ==============================
	const contract = rfiData.contract || "";
	const contractor = rfiData.contractor || rfiData.createdBy || "";
	const contractorRep = rfiData.contractorRep || "";
	const locationText = rfiData.location || "Not Provided"; // mandatory
	const sideText = rfiData.side || "";
	const measurements = Array.isArray(rfiData.measurements) ? rfiData.measurements : []; // mandatory
	const submissionDate = rfiData.submissionDate || new Date().toLocaleDateString();
	const dateOfInspection = rfiData.dateOfInspection || "";
	const timeOfInspection = rfiData.timeOfInspection || "";
	const StructureType = rfiData.StructureType || "";
	const Structure = rfiData.Structure || "";
	const Component = rfiData.Component || "";
	const Element = rfiData.Element || "";
	const activity = rfiData.activity || "";
	const rfiDescription = rfiData.rfiDescription || "";
	const inspectionStatus = (rfiData.inspectionStatus || "").trim();
	const engineerRemarks = rfiData.engineerRemarks || "";
	const enclosuresData = Array.isArray(rfiData.enclosures) ? rfiData.enclosures : [];
	const images = rfiData.images || { contractor: [], engineer: [] };
	const testReportFile = rfiData.testReportFile || null;



	// ==============================
	// Header Section
	// ==============================
	doc.setLineWidth(1);
	doc.rect(30, 25, 540, 780); // Outer border
	try {
		doc.addImage("/images/mrvc_logo_400x400.jpg", "JPEG", 35, 30, 60, 60);
	} catch (e) {
		console.warn("Header logo missing, skipping addImage");
	}

	doc.setFont("helvetica", "bold").setFontSize(16);
	doc.text("MUMBAI RAILWAY VIKAS CORPORATION LTD.", 320, 55, { align: "center" });
	doc.setFont("helvetica", "normal").setFontSize(10);
	doc.text("(A PSU of Government of India, Ministry of Railways)", 320, 70, { align: "center" });

	// Project Info
	doc.setFillColor(255, 255, 0);
	doc.rect(31, 90, 538, 30, "F");
	doc.setFont("helvetica", "bold").setFontSize(11);
	doc.text(`Contract :- ${contract}`, 40, 105, { maxWidth: 500 });

	// Engineer
	doc.rect(30, 120, 540, 20);
	doc.setFont("helvetica", "normal").setFontSize(11);
	doc.text("Engineer :- M/s. Mumbai Railway Vikas Corporation", 40, 135);

	// Contractor
	doc.setFillColor(255, 255, 0);
	doc.rect(31, 141, 538, 29, "F");
	doc.setFont("helvetica", "bold").setFontSize(11);
	doc.text(`Contractor :- ${contractor}`, 40, 160);

	// ==============================
	// Part I: RFI Details
	// ==============================
	doc.setFont("helvetica", "bold").setFontSize(12);
	doc.rect(30, 170, 540, 390);
	doc.text("Part - I :", 40, 185);
	doc.text("RFI.No : " + (rfiData.rfi_Id || "………………"), 300, 185, { maxWidth: 400 });

	doc.setFont("helvetica", "normal").setFontSize(10);
	doc.text("Name of Contractor's Representative :", 40, 205);
	doc.text(contractorRep, 212, 205);
	doc.text("Date of Submission :", 350, 205);
	doc.text(submissionDate, 449, 205);

	doc.text("Time of Inspection :", 40, 225);
	doc.text(timeOfInspection, 130, 225);
	doc.text("Date of Inspection :", 350, 225);
	doc.text(dateOfInspection, 440, 225);

	doc.text("Structure Type/Structure/Component/Element/Activity :", 40, 245);
	doc.text(`${StructureType} / ${Structure} / ${Component} / ${Element} / ${activity}`, 40, 260, { maxWidth: 500 });

	doc.text("Location :", 40, 282);
	doc.text(locationText, 85, 282, { maxWidth: 400 });

	doc.setFont("helvetica", "bold");
	doc.text("RFI Description:", 40, 317);
	doc.setFont("helvetica", "normal");
	doc.rect(40, 328, 510, 40);
	doc.text(rfiDescription, 45, 343, { maxWidth: 500 });

	// ==============================
	// Enclosures (Checkboxes)
	// ==============================
	// ==============================
	// Enclosures (Dynamic from backend)
	// ==============================
	doc.setFont("helvetica", "bold").setFontSize(11);
	doc.text("Enclosures:", 40, 390);

	const dynamicEnclosures = [
	  ...new Set(
	    (enclosuresData || [])
	      .map(e => (e && e.enclosure ? String(e.enclosure).trim() : ""))
	      .filter(name => name.length > 0)
	  )
	];

	doc.setFont("helvetica", "normal").setFontSize(10);

	// Layout config
	const startX = 60;          // starting X position
	const startY = 405;         // starting Y position (below "Enclosures:")
	const colWidth = 160;       // width per column
	const rowHeight = 22;       // spacing between rows
	const columns = 3;          // number of columns

	// Draw checkboxes and labels
	dynamicEnclosures.forEach((item, i) => {
	  const col = i % columns;
	  const row = Math.floor(i / columns);
	  const x = startX + col * colWidth;
	  const y = startY + row * rowHeight;

	  // Checkbox
	  doc.rect(x, y - 8, 8, 8);
	  doc.text("✔", x + 1.8, y - 1.5);

	  // Label
	  doc.text(`${i + 1}) ${item}`, x + 12, y - 1.5, { maxWidth: colWidth - 20 });
	});


	// ==============================
	// Part II: Engineer's Remarks & Approval
	// ==============================
	doc.setFont("helvetica", "bold").setFontSize(12);
	doc.text("Part - II : Engineer's Remarks", 40, 445);
	doc.setFont("helvetica", "normal").setFontSize(10);

	doc.text("Submitted By", 50, 460);
	doc.text("Received By", 350, 460);
	doc.text("Contractor", 50, 475);
	doc.text("Engineer", 350, 475);

	doc.rect(50, 490, 12, 12);  // Approved
	doc.rect(350, 490, 12, 12); // Not Approved

	if (inspectionStatus === "Accepted") doc.text("✔", 53, 499);
	else if (inspectionStatus === "Rejected") doc.text("✔", 353, 499);

	doc.text("Approved", 70, 500);
	doc.text("Not Approved", 370, 500);

	doc.setFont("helvetica", "bold").setFontSize(11);
	doc.text("Remarks:", 40, 530);

	doc.setFont("helvetica", "normal").setFontSize(10);
	const remarksY = 550;
	const remarkText = inspectionStatus === "Rejected" ? engineerRemarks || "________________________________________" : "________________________________________";
	doc.text(remarkText, 50, remarksY);

	// Signature placeholders
	// Reuse existing page height
	let pageHeight = doc.internal.pageSize.getHeight();
	const signY = pageHeight - 60;
	doc.text("Contractor Representative", 80, signY);
	doc.text("MRVC Representative", 316, signY);

	// ==============================
	// Measurement Record (mandatory)
	// ==============================
	doc.addPage();
	doc.rect(30, 30, 540, 810);
	doc.setFont("helvetica", "bold").setFontSize(11);
	doc.text("Measurement Record", 40, 48);
	autoTable(doc, {
		startY: 60,
		head: [["Type of Measurement", "L", "B", "H", "No.", "Total Qty."]],
		body: measurements.map(m => [
			m.type || "",
			m.l || "",
			m.b || "",
			m.h || "",
			m.no || "",
			m.total || ""
		]),
		styles: { fontSize: 8, cellPadding: 3 },
		headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold" }
	});

	// ==============================
	// Enclosures + Checklists + Site Images
	// ==============================

	doc.setFont("helvetica", "bold").setFontSize(12);
	doc.text("Enclosures", 40, 160);

	let encY = 180;
	let enclosurePdfBlobs = [];
	for (const [index, enc] of enclosuresData.entries()) {
		if (encY > 750) { doc.addPage(); encY = 60; }

		doc.setFont("helvetica", "bold").setFontSize(11);
		doc.text(`Enclosure ${index + 1}: ${enc.enclosure || ""}`, 40, encY);

		if (enc.description) {
				doc.setFont("helvetica", "normal").setFontSize(10);
			doc.text(`Description: ${enc.description}`, 60, encY + 15, { maxWidth: 480 });
			encY += 30;
		} else {
			encY += 20;
		}

		if (enc.checklist?.length) {
			autoTable(doc, {
				startY: encY,
				head: [["ID", "Description", "Contractor Status", "Engineer Status", "Contractor Remark", "Engineer Remark"]],
				body: enc.checklist.map((row, i) => [
					row.id || i + 1,
					row.description || "",
					row.contractorStatus || "",
					row.engineerStatus || "",
					row.contractorRemark || "",
					row.aeRemark || ""
				]),
				styles: { fontSize: 8, cellPadding: 3 },
				headStyles: { fillColor: [220, 220, 220] }
			});
			encY = doc.lastAutoTable.finalY + 20;
		} if (enc.uploadedFile) {
			const file = enc.uploadedFile;
			if (file.type === "application/pdf") {
				//if (encY > 750) { doc.addPage(); encY = 60; }
				enclosurePdfBlobs.push(file);
				//pdfFileNames.push(file.name || "Unnamed PDF");
			} else if (file.type.startsWith("image/")) {
				try {
					const base64 = await toBase64(URL.createObjectURL(file));
					if (encY > 600) { doc.addPage(); encY = 60; } 
					doc.addImage(base64, "JPEG", 40, encY, 500, 300);
					encY += 310;
				} catch (err) {
					console.warn("Failed to add enclosure image", err);
				}
			}
		}

	}


	// ==============================
	// Site Images (auto-paginated)
	// ==============================
	const renderSiteImages = (sectionTitle, imageArray) => {
		if (!imageArray || imageArray.length === 0) return;

		const pageHeight = doc.internal.pageSize.getHeight();
		const imageWidth = 220;
		const imageHeight = 140;
		const imagesPerRow = 2;
		const columnSpacing = 250;
		const rowSpacing = 180;
		const imgStartX = 60;

		// Check available space before adding section title
		if (encY + 60 > pageHeight - 150) {
			doc.addPage();
			encY = 60;
		}

		doc.setFont("helvetica", "bold").setFontSize(12);
		doc.text(sectionTitle, 40, encY + 10);

		let currentY = encY + 25;
		let pageIndex = 1;

		imageArray.forEach((img, i) => {
			if (!img?.startsWith("data:image")) {
				console.warn(`${sectionTitle} → Skipping invalid image`, img);
				return;
			}

			const col = i % imagesPerRow;
			const x = imgStartX + col * columnSpacing;

			// If image exceeds page height, add new page
			if (currentY + imageHeight > pageHeight - 80) {
				doc.addPage();
				pageIndex++;
				currentY = 60;
				doc.setFont("helvetica", "bold").setFontSize(12);
				doc.text(`${sectionTitle} (continuation):`, 40, currentY);
				currentY += 20;
			}

			try {
				doc.addImage(img, "JPEG", x, currentY, imageWidth, imageHeight);
			} catch (e) {
				console.warn(`${sectionTitle} → Failed to add image`, e);
			}

			// Move down after filling one row
			if (col === imagesPerRow - 1) currentY += rowSpacing;
		});

		// Leave space after section
		encY = currentY + 40;
	};

	renderSiteImages("Site Images:", images.contractor);
	renderSiteImages("Site Images:", images.engineer);

	// ==============================
	// Continue with next section
	// ==============================
	doc.setFont("helvetica", "bold").setFontSize(12);

	doc.text("Test Report", 40, encY);

	// ==============================
	// Test Report Section
	// ==============================

	let testReportPdfBlobs = [];

	function toBase64(file) {
	  return new Promise((resolve, reject) => {
	    const reader = new FileReader();
	    reader.onload = () => resolve(reader.result);
	    reader.onerror = reject;
	    reader.readAsDataURL(file);
	  });
	}

	if (testReportFile) {
	  if (encY + 150 > pageHeight - 100) {
	    encY = 60;
	  }

	  doc.setFont("helvetica", "bold").setFontSize(12);
	  encY += 60;

	  try {
	    if (testReportFile instanceof File) {
	      if (testReportFile.type === "application/pdf") {
	        testReportPdfBlobs.push(testReportFile);
	      } else if (testReportFile.type.startsWith("image/")) {
	        const base64 = await toBase64(testReportFile);
	        const availableHeight = pageHeight - encY - 100;
	        doc.addImage(base64, "JPEG", 40, encY, 500, availableHeight);
	        encY += availableHeight + 20;
	      }
	    }

	    else if (typeof testReportFile === "string") {
	      if (
	        testReportFile.startsWith("data:application/pdf") ||
	        testReportFile.toLowerCase().endsWith(".pdf")
	      ) {
	        if (testReportFile.startsWith("data:application/pdf")) {
	          testReportPdfBlobs.push(testReportFile);
	        } else {
	          const response = await fetch(testReportFile);
	          const blob = await response.blob();
	          testReportPdfBlobs.push(blob);
	        }
	      }
	      else if (
	        testReportFile.startsWith("data:image") ||
	        /\.(jpg|jpeg|png)$/i.test(testReportFile)
	      ) {
	        const base64 =
	          testReportFile.startsWith("data:image")
	            ? testReportFile
	            : await toBase64(await (await fetch(testReportFile)).blob());

	        const availableHeight = pageHeight - encY - 100;
	        doc.addImage(base64, "JPEG", 40, encY, 500, availableHeight);
	        encY += availableHeight + 20;
	      }
	    }
	  } catch (err) {
	    console.warn("⚠️ Failed to add test report file:", err);
	  }
	}

      externalPdfBlobs = [
	...testReportPdfBlobs,
	  ...enclosurePdfBlobs
	];
	return { doc, externalPdfBlobs};
	}