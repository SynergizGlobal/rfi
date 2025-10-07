import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";
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

// Merge jsPDF with external PDFs
export async function mergeWithExternalPdfs(jsPDFDoc, externalPdfBlobs) {
	const mainPdfBytes = jsPDFDoc.output("arraybuffer");
	const mainPdf = await PDFDocument.load(mainPdfBytes);

	for (const fileBlob of externalPdfBlobs) {
		const externalPDF = await PDFDocument.load(await fileBlob.arrayBuffer());
		const pages = await mainPdf.copyPages(externalPDF, externalPDF.getPageIndices());
		pages.forEach((page) => mainPdf.addPage(page));
	}

	const mergedPdfBytes = await mainPdf.save();
	return new Blob([mergedPdfBytes], { type: "application/pdf" });
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
	const images = Array.isArray(rfiData.images) ? rfiData.images : [];
	const testReportFile = rfiData.testReportFile || null;



	// ==============================
	// Header Section
	// ==============================
	doc.setLineWidth(1);
	doc.rect(30, 30, 540, 780); // Outer border
	try {
		doc.addImage("/images/mrvc_logo_400x400.jpg", "JPEG", 35, 35, 60, 60);
	} catch (e) {
		console.warn("Header logo missing, skipping addImage");
	}

	doc.setFont("helvetica", "bold").setFontSize(16);
	doc.text("MUMBAI RAILWAY VIKAS CORPORATION LTD.", 320, 60, { align: "center" });
	doc.setFont("helvetica", "normal").setFontSize(10);
	doc.text("(A PSU of Government of India, Ministry of Railways)", 320, 75, { align: "center" });

	// Project Info
	doc.setFillColor(255, 255, 0);
	doc.rect(30, 100, 540, 20, "F");
	doc.setFont("helvetica", "bold").setFontSize(11);
	doc.text(`Contract :- ${contract}`, 40, 115);

	// Engineer
	doc.rect(30, 120, 540, 20);
	doc.setFont("helvetica", "normal").setFontSize(11);
	doc.text("Engineer :- M/s. Mumbai Railway Vikas Corporation", 40, 135);

	// Contractor
	doc.setFillColor(255, 255, 0);
	doc.rect(30, 140, 540, 20, "F");
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
	doc.text(`${StructureType} / ${Structure} / ${Component} / ${Element} / ${activity}`, 40, 260);

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

	// ✅ Extract dynamic enclosures from backend data
	const dynamicEnclosures = [
		...new Set(
			(enclosuresData || [])
				.map(e => (e && e.enclosure ? String(e.enclosure).trim() : ""))
				.filter(name => name.length > 0)
		)
	];

	doc.setFont("helvetica", "normal").setFontSize(10);

	// Loop over dynamic enclosures and draw checkboxes
	dynamicEnclosures.forEach((item, i) => {
		const x = 120 + (i % 3) * 180;     // position in 3 columns
		const y = 390 + Math.floor(i / 3) * 25;

		// Draw checkbox
		doc.rect(x, y, 10, 10);

		// Mark as checked because enclosuresData already represents selected enclosures
		doc.text("✔", x + 2.5, y + 8);

		// Label with index + name
		doc.text(`${i + 1}) ${item}`, x + 15, y + 8, { maxWidth: 150 });
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
	const pageHeight = doc.internal.pageSize.getHeight();
	const signY = pageHeight - 60;
	doc.text("Contractor Representative", 80, signY);
	doc.text("MRVC Representative", 330, signY);

	// ==============================
	// Measurement Record (mandatory)
	// ==============================
	doc.addPage();
	doc.rect(30, 30, 540, 780);
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
				externalPdfBlobs.push(file);
			} else if (file.type.startsWith("image/")) {
				try {
					const base64 = await toBase64(URL.createObjectURL(file));
					if (encY > 600) { doc.addPage(); encY = 60; } // new page if overflow
					doc.addImage(base64, "JPEG", 40, encY, 500, 300);
					encY += 310;
				} catch (err) {
					console.warn("Failed to add enclosure image", err);
				}
			}
		}



	}




	// Site Images
	doc.setFont("helvetica", "bold").setFontSize(12);
	doc.text("Site Images:", 40, encY + 10);
	images.forEach((img, i) => {
		const x = 40 + (i % 2) * 250;
		const y = encY + 30 + Math.floor(i / 2) * 180;
		try {
			doc.addImage(img, "JPEG", x, y, 200, 150);
		} catch (e) {
			console.warn("Image failed to add, skipping", e);
		}
	});

	if (testReportFile) {
		doc.addPage();
		doc.setFont("helvetica", "bold").setFontSize(12);
		doc.text("Test Report", 40, 50);

		if (testReportFile instanceof File && testReportFile.type === "application/pdf") {
			// PDF → push to externalPdfBlobs for merging later
			externalPdfBlobs.push(testReportFile);
		} else {
			// Image → convert to base64 and add to PDF
			try {
				const testReportBase64 =
					testReportFile instanceof File
						? await toBase64(URL.createObjectURL(testReportFile))
						: testReportFile; // if already base64 string

				// Add image on page
				doc.addImage(testReportBase64, "JPEG", 40, 80, 500, 700);
			} catch (err) {
				console.warn("Failed to add test report file", err);
			}
		}
	}
	return { doc, externalPdfBlobs };
}
