import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
// ✅ Import pre-bundled worker for webpack/vite
import worker from "pdfjs-dist/webpack";

// set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

/** Convert File/Blob → base64 */
export const toBase64 = (fileOrBlob) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(fileOrBlob);
	});

/** Convert PDF → Images (all pages) */
export async function pdfToImages(file) {
	const arrayBuffer = await file.arrayBuffer();
	const pdfDoc = await PDFDocument.load(arrayBuffer);
	const pages = pdfDoc.getPages();
	const images = [];

	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

	for (let i = 0; i < pages.length; i++) {
		const page = await pdf.getPage(i + 1);
		const viewport = page.getViewport({ scale: 1.5 });

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = viewport.width;
		canvas.height = viewport.height;

		await page.render({ canvasContext: context, viewport }).promise;
		images.push(canvas.toDataURL("image/jpeg"));
	}

	return images;
}

/** Normalize image input into base64 */
export const normalizeImage = async (img) => {
	if (!img) return null;

	if (typeof img === "string" && img.startsWith("data:image")) return img;

	if (img instanceof File || img instanceof Blob) return await toBase64(img);

	console.warn("⚠️ Unsupported image format:", img);
	return null;
};

/** Convert PDF file → Image (first page only) */
export const pdfToImage = async (file) => {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
	const page = await pdf.getPage(1);
	const viewport = page.getViewport({ scale: 2 });
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	canvas.width = viewport.width;
	canvas.height = viewport.height;

	await page.render({ canvasContext: ctx, viewport }).promise;
	return canvas.toDataURL("image/jpeg");
};

/** Generate Offline Inspection PDF */
export const generateOfflineInspectionPdf = async ({
	selfieImage,
	galleryImages = [],
	testReportFile,
	enclosureImages = [],
}) => {
	const doc = new jsPDF();
	let y = 20;

	doc.setFontSize(16);
	doc.text("Offline Inspection Report", 14, y);
	y += 10;

	// Selfie
	if (selfieImage) {
		const img = await normalizeImage(selfieImage);
		if (img) {
			doc.setFontSize(12);
			doc.text("Selfie Image:", 14, y);
			y += 5;
			doc.addImage(img, "JPEG", 14, y, 60, 60);
			y += 70;
		}
	}

	// Gallery
	if (galleryImages.length > 0) {
		doc.setFontSize(12);
		doc.text("Gallery Images:", 14, y);
		y += 5;

		let x = 14; // initial x
		let maxHeightInRow = 0; // track tallest image in current row
		const imagesPerRow = 2;

		for (let i = 0; i < galleryImages.length; i++) {
			const img = await normalizeImage(galleryImages[i]);
			if (!img) continue;

			const imgWidth = 60;
			const imgHeight = 60;

			doc.addImage(img, "JPEG", x, y, imgWidth, imgHeight);

			maxHeightInRow = Math.max(maxHeightInRow, imgHeight);

			if ((i + 1) % imagesPerRow === 0) {
				// Move to next row
				x = 14;
				y += maxHeightInRow + 10; // 10px spacing
				maxHeightInRow = 0;
			} else {
				// Move to next column
				x += imgWidth + 10; // 10px spacing between images
			}

			if (y > 250) {
				doc.addPage();
				y = 20;
				x = 14;
			}
		}

	}

	// Test Report
	if (testReportFile) {
		doc.addPage();
		doc.setFontSize(14);
		doc.text("Test Report:", 14, 20);

		if (testReportFile.type === "application/pdf") {
			const pdfImages = await pdfToImages(testReportFile);
			let y = 40;
			for (const img of pdfImages) {
				if (y > 250) {
					doc.addPage();
					y = 20;
				}
				doc.addImage(img, "JPEG", 14, y, 80, 80);
				y += 90;
			}
		} else {
			const img = await normalizeImage(testReportFile);
			if (img) {
				doc.addImage(img, "JPEG", 14, 40, 80, 80);
			}
		}
	}

	// Enclosures
	if (enclosureImages?.length) {
		doc.addPage();
		doc.setFontSize(14);
		doc.text("Enclosures:", 14, 20);
		let y = 40;

		for (const enc of enclosureImages) {
			doc.text(`• ${enc.enclosureName}`, 14, y);
			y += 10;

			if (enc.file) {
				if (enc.file.type === "application/pdf") {
					const pdfImages = await pdfToImages(enc.file);
					for (const img of pdfImages) {
						if (y > 250) {
							doc.addPage();
							y = 20;
						}
						doc.addImage(img, "JPEG", 14, y, 80, 80);
						y += 90;
					}
				} else {
					const img = await normalizeImage(enc.file);
					if (img) {
						if (y > 250) {
							doc.addPage();
							y = 20;
						}
						doc.addImage(img, "JPEG", 14, y, 80, 80);
						y += 90;
					}
				}
			}
		}
	}

	return doc;
};
