import jsPDF from "jspdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import autoTable from "jspdf-autotable";


let externalPdfBlobs = [];

// Convert image/File to Base64

export const toBase64 = async (input) => {
	if (typeof input === "string" && input.startsWith("data:")) {
		return input; // Already base64
	}
	const response = await fetch(input);
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

	// Add main PDF pages first
	const mainPages = await mergedPdf.copyPages(mainPdf, mainPdf.getPageIndices());
	mainPages.forEach((p) => mergedPdf.addPage(p));

	if (!externalPdfBlobs || externalPdfBlobs.length === 0) {
		const mergedBytes = await mergedPdf.save();
		return new Blob([mergedBytes], { type: "application/pdf" });
	}

	// Separate test report and enclosures logically
	// 👇 Assuming first group is test reports, rest are enclosures
	const testReportCount = 1; // adjust if multiple test reports are expected

	for (let i = 0; i < externalPdfBlobs.length; i++) {
		let fileBlob = externalPdfBlobs[i];
		let labelText = i < testReportCount ? "Test Report PDF" : "Enclosure PDF";

		// Normalize Blob
		if (typeof fileBlob === "string") {
			if (fileBlob.startsWith("data:application/pdf")) {
				// Base64 → Blob
				const byteString = atob(fileBlob.split(",")[1]);
				const ab = new ArrayBuffer(byteString.length);
				const ia = new Uint8Array(ab);
				for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
				fileBlob = new Blob([ab], { type: "application/pdf" });
			} else {
				// URL → fetch
				const res = await fetch(fileBlob);
				fileBlob = await res.blob();
			}
		}

		const fileBytes = await fileBlob.arrayBuffer();
		const externalPdf = await PDFDocument.load(fileBytes);
		const copiedPages = await mergedPdf.copyPages(externalPdf, externalPdf.getPageIndices());
		const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

		for (let j = 0; j < copiedPages.length; j++) {
			const page = copiedPages[j];
			const { width, height } = page.getSize();

			// Add new page with label only on the first page of each PDF
			const newPage = mergedPdf.addPage([width, height]);
			const embeddedPage = await mergedPdf.embedPage(page);
			newPage.drawPage(embeddedPage, { x: 0, y: 0 });

			if (j === 0) {
				newPage.drawText(labelText, {
					x: 40,
					y: height - 30,
					size: 10,
					font,
					color: rgb(0, 0, 0),
				});
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
	const supportingDocs = rfiData.supportingDocs || [];
	const supportingDescriptions = rfiData.supportingDescriptions || [];





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

	// =============================
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
	const remarkText = inspectionStatus === "Rejected" ? engineerRemarks || "" : "";
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
		head: [["Type of Measurement", "units", "L", "B", "H", "weight", "No.", "Total Qty."]],
		body: measurements.map(m => [
			m.type || "",
			m.units || "",
			m.l || "",
			m.b || "",
			m.h || "",
			m.weight || "",
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
		}
		/*if (enc.uploadedFile) {
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
*/
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

		// Ensure space for section title
		if (encY + 60 > pageHeight - 150) {
			doc.addPage();
			encY = 60;
		}

		doc.setFont("helvetica", "bold").setFontSize(12);
		doc.text(sectionTitle, 40, encY + 10);

		let currentY = encY + 25;

		imageArray.forEach((img, i) => {
			if (!img?.startsWith("data:image")) {
				console.warn(`${sectionTitle} → Skipping invalid image`, img);
				return;
			}

			const col = i % imagesPerRow;
			const x = imgStartX + col * columnSpacing;

			// Page break if image overflows
			if (currentY + imageHeight > pageHeight - 80) {
				doc.addPage();
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

			const isEndOfRow = col === imagesPerRow - 1;
			const isLastImage = i === imageArray.length - 1;

			// ✅ MOVE DOWN IF ROW COMPLETE OR LAST IMAGE
			if (isEndOfRow || isLastImage) {
				currentY += rowSpacing;
			}
		});

		// Space after section
		encY = currentY + 40;
	};


	renderSiteImages("Contractor Site Images:", images.contractor);
	renderSiteImages("Engineer Site Images:", images.engineer);


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

	// ==============================
	// Supporting Documents (PDF or Images)
	// ==============================
	let supportingPdfBlobs = [];

	if (supportingDocs?.length > 0) {
		for (const docItem of supportingDocs) {
			const file = docItem.file;

			// Add title page inside main jsPDF
		/*	doc.addPage();
			doc.setFontSize(16);
			doc.text("Supporting Document", 20, 30);
			doc.setFontSize(12);
			doc.text(docItem.description || "", 20, 50);*/

			// Case 1: URL PDF
			if (typeof file === "string" && file.toLowerCase().endsWith(".pdf")) {
				const blob = await (await fetch(file)).blob();
				supportingPdfBlobs.push(blob);   // ✅ Always Blob
				continue;
			}

			// Case 2: Base64 PDF
			if (typeof file === "string" && file.startsWith("data:application/pdf")) {
				const byteCharacters = atob(file.split(",")[1]);
				const byteNumbers = new Array(byteCharacters.length);
				for (let i = 0; i < byteCharacters.length; i++)
					byteNumbers[i] = byteCharacters.charCodeAt(i);

				const byteArray = new Uint8Array(byteNumbers);
				supportingPdfBlobs.push(new Blob([byteArray], { type: "application/pdf" })); // ✅ Blob
				continue;
			}

			// Case 3: File object PDF
			if (file instanceof File && file.type === "application/pdf") {
				supportingPdfBlobs.push(file);  // ✅ File is fine
				continue;
			}

			// Case 4: Images (PNG/JPG/JPEG)
			let base64Image = file;

			if (typeof file === "string" && !file.startsWith("data:")) {
				const blob = await (await fetch(file)).blob();
				base64Image = await toBase64(blob);
			}

			doc.addImage(base64Image, "JPEG", 20, 80, 500, 500);
		}
	}


	// --- Enclosure PDF/image handling (fixed for multiple PDFs per enclosure) ---
	const addedPdfFingerprints = new Set();

	async function getFileFingerprint(fileOrString) {
		if (typeof fileOrString === "string") return fileOrString;
		const buffer = await fileOrString.arrayBuffer();
		const view = new Uint8Array(buffer);
		let hash = 0;
		const len = Math.min(view.length, 100);
		for (let i = 0; i < len; i++) hash += view[i] * (i + 1);
		return hash + "-" + view.length;
	}

	// UploadedFile PDFs
	for (const enc of enclosuresData) {
		if (enc.uploadedFile) {
			const files = Array.isArray(enc.uploadedFile) ? enc.uploadedFile : [enc.uploadedFile];
			for (const file of files) {
				if (file.type === "application/pdf") {
					const fingerprint = await getFileFingerprint(file);
					if (!addedPdfFingerprints.has(fingerprint)) {
						enclosurePdfBlobs.push(file);
						addedPdfFingerprints.add(fingerprint);
					}
				}
			}
		}
	}

	// filePath PDFs
	for (const enclosure of enclosuresData) {
		const encFiles = Array.isArray(enclosure.filePath) ? enclosure.filePath : enclosure.filePath ? enclosure.filePath.split(",") : [];
		for (const encFile of encFiles) {
			if (!encFile) continue;
			if (typeof encFile === "string" && (encFile.startsWith("data:application/pdf") || encFile.toLowerCase().endsWith(".pdf"))) {
				const fingerprint = encFile;
				if (!addedPdfFingerprints.has(fingerprint)) {
					let blob;
					if (encFile.startsWith("data:application/pdf")) blob = encFile;
					else blob = await (await fetch(encFile)).blob();
					enclosurePdfBlobs.push(blob);
					addedPdfFingerprints.add(fingerprint);
				}
			}
		}
	}



	externalPdfBlobs = [
    ...testReportPdfBlobs,
    ...enclosurePdfBlobs,
    ...supportingPdfBlobs,  // ✅ FIXED
];

	return { doc, externalPdfBlobs };
}