import axios from 'axios';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import autoTable from 'jspdf-autotable';
import "jspdf-autotable";
import './Validation.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const getExtension = (filename) => {
	return filename?.split('.').pop()?.toLowerCase();
};
export default function Validation() {
	const [selectedInspection, setSelectedInspection] = useState(null);

	const [message, setMessage] = useState('');
	const [message1, setMessage1] = useState('');
	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
	const designation = localStorage.getItem("designation")?.toLowerCase();
	const department = localStorage.getItem("departmentFk")?.toLowerCase();
	const isITAdmin = userRole === 'it admin';
	const isDyHOD = userType === "dyhod";

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	const [editModeList, setEditModeList] = useState([]);
	const [checklistItems, setChecklistItems] = useState([]);
	const [enclosures, setEnclosures] = useState([]);
	const [Measurement, setMeasurement] = useState([]);
	const [rfiList, setRfiList] = useState([]);
	const [rfiList1, setRfiList1] = useState([]);

	const [remarksList, setRemarksList] = useState([]);
	const [remarksList1, setRemarksList1] = useState([]);

	const [statusList, setStatusList] = useState([]);
	const [statusList1, setStatusList1] = useState([]);

	const [commentsList, setCommentList] = useState({});
	const [commentsList1, setCommentList1] = useState({});
	
	const isEnggAuthority =
		userRole != null &&
		department === "engg" &&
		userRole === "data admin" &&
		designation !== "project engineer" &&
		userType !== "dyhod" &&
		userRole !== "regular user";
		
	const isProjectEngineer =
		department === "engg" &&
		userRole === "regular user" &&
		designation === "project engineer";


	const handleCommentChange = (rowIndex, value) => {
		if (value.length <= 500) {
			setCommentList(prev => ({
				...prev,
				[rowIndex]: value,
			}));
		}
	};


	const fetchValidations = () => {
	  axios
	    .get(`${API_BASE_URL}api/validation/getRfiValidations`, {
	      withCredentials: true,
	      headers: {
	        "Content-Type": "application/json",
	        Accept: "application/json",
	      },
	    })
	    .then((res) => {
	      console.log("GET /getRfiValidations response:", res.data);

	      const data = Array.isArray(res.data) ? res.data : [];

	      // Clear messages first
	      setMessage("");
	      setMessage1("");

	      // ===== ENGG AUTHORITY =====
	      if (isEnggAuthority) {
	        const enggAuthorityData = data.filter(
	          (item) => (item.valdationAuth || "").toLowerCase() === "enggauthority"
	        );

	        const dyhodData = data.filter(
	          (item) => (item.valdationAuth || "").toLowerCase() === "dyhod"
	        );

	        setRfiList(enggAuthorityData);
	        setRemarksList(enggAuthorityData.map((item) => item.remarks || ""));
	        setStatusList(enggAuthorityData.map((item) => item.status || ""));
	        setCommentList(enggAuthorityData.map((item) => item.comment || ""));
	        setEditModeList(enggAuthorityData.map(() => false));
	        setSubmittedList(
	          enggAuthorityData.map((item) => (item.remarks && item.status ? true : false))
	        );

	        setRfiList1(dyhodData);
	        setRemarksList1(dyhodData.map((item) => item.remarks || ""));
	        setStatusList1(dyhodData.map((item) => item.status || ""));
	        setCommentList1(dyhodData.map((item) => item.comment || ""));

	        if (enggAuthorityData.length === 0) {
	          setMessage("No RFI validations found.");
	        }
	        if (dyhodData.length === 0) {
	          setMessage1("No RFI validations found.");
	        }

	        return;
	      }

	      // ===== DYHOD =====
	      if (isDyHOD) {
	        const dyhodData = data.filter(
	          (item) => (item.valdationAuth || "").toLowerCase() === "dyhod"
	        );

	        setRfiList(dyhodData);
	        setRemarksList(dyhodData.map((item) => item.remarks || ""));
	        setStatusList(dyhodData.map((item) => item.status || ""));
	        setCommentList(dyhodData.map((item) => item.comment || ""));
	        setEditModeList(dyhodData.map(() => false));
	        setSubmittedList(
	          dyhodData.map((item) => (item.remarks && item.status ? true : false))
	        );

	        if (dyhodData.length === 0) {
	          setMessage("No RFI validations.");
	        }

	        return;
	      }

	      // ===== PROJECT ENGINEER =====
	      if (isProjectEngineer) {
	        const enggAuthorityData = data.filter(
	          (item) => (item.valdationAuth || "").toLowerCase() === "enggauthority"
	        );

	        setRfiList1(enggAuthorityData);
	        setRemarksList1(enggAuthorityData.map((item) => item.remarks || ""));
	        setStatusList1(enggAuthorityData.map((item) => item.status || ""));
	        setCommentList1(enggAuthorityData.map((item) => item.comment || ""));

	        if (enggAuthorityData.length === 0) {
	          setMessage1("No RFI validations found.");
	        }

	        return;
	      }

	      // ===== IT ADMIN =====
	      if (isITAdmin) {
	        setRfiList(data);
	        setRemarksList(data.map((item) => item.remarks || ""));
	        setStatusList(data.map((item) => item.status || ""));
	        setCommentList(data.map((item) => item.comment || ""));
	        setEditModeList(data.map(() => false));
	        setSubmittedList(data.map((item) => (item.remarks && item.status ? true : false)));

	        if (data.length === 0) {
	          setMessage("No RFI validations found.");
	        }

	        return; 
	      }
	    })
	    .catch((err) => {
	      console.error("Error fetching RFI validations:", err);

	      setRfiList([]);
	      setRfiList1([]);
	      setRemarksList([]);
	      setRemarksList1([]);
	      setStatusList([]);
	      setStatusList1([]);
	      setCommentList([]);
	      setCommentList1([]);
	      setEditModeList([]);
	      setSubmittedList([]);

	      setMessage("Error loading RFI validations.");
	      setMessage1("Error loading RFI validations.");
	    });
	};

	useEffect(() => {
	  fetchValidations();
	}, []);




	const updateRemark = (idx, value) => {
		setRemarksList(prev => prev.map((item, i) => i === idx ? value : item));
	};


	const [submittedList, setSubmittedList] = useState([]);

	const submitValidation = async (rfi, idx, actionTaken) => {
	  const remarks = (remarksList[idx] || "").trim();
	  const comment = (commentsList[idx] || "").trim();

	  if (!remarks) {
	    alert("Please select a remark before submitting.");
	    return;
	  }

	  if (!actionTaken) {
	    alert("Please select a status before submitting.");
	    return;
	  }

	  if (actionTaken === "REJECTED" && !comment) {
	    alert("Please enter a comment before rejecting.");
	    return;
	  }

	  try {
	    const formData = new FormData();
	    formData.append("long_rfi_id", rfi.longRfiId);
	    formData.append("long_rfi_validate_id", rfi.longRfiValidateId);
	    formData.append("remarks", remarks);
	    formData.append("action", actionTaken);
	    formData.append("comment", comment);

	    // Optional: disable row while submitting
	    const updatedSubmitted = [...submittedList];
	    updatedSubmitted[idx] = true;
	    setSubmittedList(updatedSubmitted);

	    const response = await axios.post(
	      `${API_BASE_URL}api/validation/validate`,
	      formData,
	      {
	        headers: { Accept: "application/json" },
	        withCredentials: true,
	      }
	    );

	    alert(response.data || "Validation submitted successfully.");
	    fetchValidations(); // refresh table

	  } catch (err) {
	    console.error("Validation error:", err);
	    alert("Failed to validate RFI. Please try again.");

	    const updatedSubmitted = [...submittedList];
	    updatedSubmitted[idx] = false;
	    setSubmittedList(updatedSubmitted);
	  }
	};




	const fetchPreview = (rfiId) => {
		axios.get(`${API_BASE_URL}api/validation/getRfiReportDetail/${rfiId}`, {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
			.then((res) => {
				const data = res.data;
				setSelectedInspection(data.reportDetails);
				setChecklistItems(data.checklistItems);
				setEnclosures(data.enclosures);
				setMeasurement(data.measurementDetails);
			})
			.catch((err) => console.error(err));
	};



	const getFilename = (path) => path?.split('\\').pop().replace(/^"|"$/g, '');
	const fileBaseURL = `${API_BASE_URL}api/validation/previewFiles`;
	const fileBaseURLForFileName = `${API_BASE_URL}api/rfiLog/previewFiles/file`;



	const toBase64 = async (url) => {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		});
	};



	async function mergeWithExternalPdfs(jsPDFDoc, externalPdfBlobs = []) {
		const mainPdfBytes = jsPDFDoc.output("arraybuffer");
		const mainPdf = await PDFDocument.load(mainPdfBytes);

		if (!Array.isArray(externalPdfBlobs) || externalPdfBlobs.length === 0) {
			const finalBytes = await mainPdf.save();
			return new Blob([finalBytes], { type: "application/pdf" });
		}

		const seen = new Set();

		for (const fileBlob of externalPdfBlobs) {
			if (!fileBlob) continue;

			const key = `${fileBlob.size}_${fileBlob.type}`;
			if (seen.has(key)) continue;
			seen.add(key);

			const externalPdfBytes = await fileBlob.arrayBuffer();
			const externalPDF = await PDFDocument.load(externalPdfBytes);

			const pages = await mainPdf.copyPages(
				externalPDF,
				externalPDF.getPageIndices()
			);

			pages.forEach((page) => mainPdf.addPage(page));
		}

		const mergedPdfBytes = await mainPdf.save();
		return new Blob([mergedPdfBytes], { type: "application/pdf" });
	}


	let cachedBase64 = null;
	const loadFontAsBase64 = async (url) => {
		const res = await fetch(url);
		const buffer = await res.arrayBuffer();

		let binary = "";
		const bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}

		return btoa(binary);
	};

	const generatePDF = async (inspectionList, checklistItems, enclosures, measurements,) => {
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
		const externalPdfBlobs = [];
		const seenPdfUrls = new Set();
		const safe = (val) => val || '---';
		const logoUrl = 'https://www.manabadi.com/wp-content/uploads/2016/11/4649MRVC.jpg';
		const logo = await toBase64(logoUrl);
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 10;
		const imageWidth = 120
		const imageHeight = 100;
		const lineHeight = 6;
		let rfiName = null;
		const hasNonEnglish = (txt = "") => /[^\x00-\x7F]/.test(String(txt || ""));

		for (let idx = 0; idx < inspectionList.length; idx++) {
			const inspection = inspectionList[idx];
			rfiName = inspection.rfiId;

			if (idx !== 0) doc.addPage();
			let y = margin;
			doc.setFontSize(14).setFont(undefined, 'bold');
			doc.text('Mumbai Rail Vikas Corporation', pageWidth / 2, y, { align: 'center' });
			if (logo) doc.addImage(logo, 'JPEG', pageWidth - margin - 45, y, 45, 15);
			y += 18;
			doc.setFontSize(14).setFont(undefined, 'bold');
			doc.text('REQUEST FOR INSPECTION (RFI) REPORT', pageWidth / 2, y, { align: 'center' });
			y += 10;
			doc.setFontSize(10).setFont(undefined, 'normal');



			const bottomMargin = 20;

			const ensureSpace = (neededHeight) => {
				if (y + neededHeight > pageHeight - bottomMargin) {
					doc.addPage();
					y = margin;
				}
			};

			// ---------- TOP HEADER ROW ----------
			ensureSpace(15);

			const statusText =
				inspection.testStatus === "Rejected"
					? "Rejected"
					: inspection.rfiStatus === "INSPECTION_DONE"
						? "Closed"
						: "Active";

			const statusColor =
				statusText === "Rejected"
					? [255, 0, 0]
					: statusText === "Closed"
						? [0, 102, 204]
						: [0, 128, 0];



			doc.autoTable({
				startY: y,
				body: [[
					{ content: "Client:\nMumbai Rail Vikas Corporation", styles: { fontStyle: "bold" } },
					{
						content: "RFI Status:",
						styles: {
							fontStyle: "bold",
							halign: "right",
						},
					},
				]],
				theme: "plain",
				styles: { fontSize: 10, valign: "top" },
				columnStyles: {
					0: { halign: "left" },
					1: { halign: "right" },
				},
				didDrawCell: function(data) {
					if (data.section === "body" && data.column.index === 1) {
						const x = data.cell.x + data.cell.width;
						const y = data.cell.y + 12;

						doc.setFont("helvetica", "bold");
						doc.setFontSize(10);
						doc.setTextColor(...statusColor);

						doc.text(statusText, x - 2, y, { align: "right" });

						doc.setTextColor(0, 0, 0);
					}
				},
			});


			y = doc.lastAutoTable.finalY + 6;



			const fields = [
				['Consultant', inspection.consultant],
				['Contract', inspection.contract], ['Contractor', inspection.contractor],
				['Contract ID', inspection.contractId], ['RFI ID', inspection.rfiId],
				['Location', inspection.location], ['Date of Inspection', inspection.dateOfInspection],
				['Proposed Time', inspection.proposedInspectionTime], ['Actual Time', inspection.actualInspectionTime],
				['RFI Description', inspection.rfiDescription], ["Contractor's Representative", inspection.contractorRepresentative],
				['Client Representative', inspection.clientRepresentative],
				['Enclosures', inspection.enclosures], ['Description by Contractor', inspection.descriptionByContractor]
			].map(([lable, value]) => [lable, value ?? "N/A"]);

			if (!cachedBase64) {
				cachedBase64 = await loadFontAsBase64("/fonts/NotoSansDevanagari-Regular.ttf");
			}

			doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", cachedBase64);
			doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSans", "normal");


			doc.autoTable({
				startY: y,
				body: fields,
				styles: { fontSize: 9 },
				theme: "plain",
				columnStyles: { 0: { fontStyle: "bold" } },

				// ✅ apply font to Location value column only
				didParseCell: function(data) {
					if (data.section !== "body") return;

					// row.raw is like: ["Location", "...."]
					const row = data.row.raw;
					const label = row?.[0];

					// value column is index 1
					if (label === "Location" && data.column.index === 1 && hasNonEnglish(data.cell.raw)) {
						data.cell.styles.font = "NotoSans";
					}
				}
			});




			y = doc.lastAutoTable.finalY || (y + 20);
			ensureSpace(lineHeight);

			if (measurements && (Array.isArray(measurements) ? measurements.length > 0 : true)) {
				const measurementArray = Array.isArray(measurements) ? measurements : [measurements];

				y += 10;
				doc.setFont(undefined, "bold").setFontSize(12);
				ensureSpace(lineHeight);
				ensureSpace(30);
				doc.text("Measurement Details", pageWidth / 2, y, { align: "center" });
				ensureSpace(lineHeight);
				doc.autoTable({
					startY: y + 5,
					head: [["Type", "Length", "Breadth", "Height", "Count", "Total Quantity"]],
					body: measurementArray.map((m) => [
						safe(m.measurementType),
						safe(m.l),
						safe(m.b),
						safe(m.h),
						safe(m.no),
						safe(m.totalQty),
					]),
					styles: { fontSize: 9 },
					headStyles: { fillColor: [0, 102, 153], textColor: 255 },
					theme: "grid",
				});
				y = doc.lastAutoTable.finalY || (y + 20);
				ensureSpace(lineHeight);
			}
			rfiName = inspection.rfiId;
			ensureSpace(lineHeight);
			if (checklistItems && checklistItems.length > 0) {
				const grouped = checklistItems.reduce((groups, item) => {
					if (!groups[item.enclosureName]) groups[item.enclosureName] = [];
					groups[item.enclosureName].push(item);
					return groups;
				}, {});
				ensureSpace(lineHeight);
				for (const [enclosureName, items] of Object.entries(grouped)) {
					y += 10;
					doc.setFont(undefined, "bold").setFontSize(12);
					doc.text(`${enclosureName}`, pageWidth / 2, y, { align: "center" });
					ensureSpace(lineHeight);
					doc.autoTable({
						startY: y + 5,
						head: [["#", "Description", "Contractor Status", "AE Status", "Contractor Remarks", "AE Remarks"]],
						body: items.map((row, i) => [
							i + 1,
							safe(row.checklistDescription),
							safe(row.conStatus),
							safe(row.aeStatus),
							safe(row.contractorRemark),
							safe(row.aeRemark),
						]),
						styles: { fontSize: 9 },
						headStyles: { fillColor: [0, 102, 153], textColor: 255 },
						theme: "grid"
					});

					y = doc.lastAutoTable.finalY || (y + 20);
				}
				ensureSpace(lineHeight);
			}

			y += 15;
			ensureSpace(lineHeight);

			doc.setFont(undefined, "bold").setFontSize(11).text("Validation Status & Remarks:", margin, y);
			y += lineHeight;
			ensureSpace(lineHeight);
			doc.setFont(undefined, "bold").setFontSize(11).text("Status:", margin + 10, y);
			doc.setFont(undefined, "normal").setFontSize(11).text(safe(inspection.validationStatus), margin + 30, y);
			y += lineHeight;
			doc.setFont(undefined, "bold").setFontSize(11).text("Remarks:", margin + 10, y);
			doc.setFont(undefined, "normal").setFontSize(11).text(safe(inspection.remarks), margin + 30, y);
			y += lineHeight;
			ensureSpace(lineHeight);
			doc.setFont(undefined, "bold").setFontSize(11).text("Comment:", margin + 10, y);

			doc.setFont(undefined, "normal").setFontSize(9);
			// ----- COMMENT LABEL -----
			doc.setFont(undefined, "bold")
				.setFontSize(11)
				.text("Comment:", margin + 10, y);

			// ----- COMMENT VALUE (WRAPPED) -----
			doc.setFont(undefined, "normal")
				.setFontSize(9);

			const commentText = safe(inspection.validationComments) || "";


			const maxWidth = pageWidth - margin - (margin + 30);
			const wrappedText = doc.splitTextToSize(commentText, maxWidth);

			ensureSpace(wrappedText.length * 5);

			doc.text(wrappedText, margin + 30, y);
			y += wrappedText.length * 5;

			y += 15;
			ensureSpace(lineHeight);
			const imageSection = async (label, paths, x = margin, yPos = y, options = {}) => {
				if (!paths || !paths.trim()) return;
				const files = paths.split(',').map(f => f.trim()).filter(Boolean);
				if (!files.length) return;

				const align = options.align || "left";

				if (align === "center") {
					doc.setFont(undefined, 'bold');
					const textWidth = doc.getTextWidth(`${label}:`);
					const centerX = (pageWidth - textWidth) / 2;
					doc.text(`${label}:`, centerX, yPos);
				} else {
					doc.setFont(undefined, 'bold').text(`${label}:`, margin, yPos);
				}
				yPos += 5;

				for (const file of files) {
					if (!file) continue;

					const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;

					const isPdfFile =
						typeof file === "string" &&
						file.trim().toLowerCase().endsWith(".pdf");

					if (isPdfFile) {
						const response = await fetch(fileUrl);
						if (response.ok) {
							externalPdfBlobs.push(await response.blob());
						}
						continue;
					}

					const imgData = await toBase64(fileUrl);
					if (imgData) {
						if (yPos + imageHeight > pageHeight - 20) {
							doc.addPage();
							yPos = margin;
						}

						let imgX = margin;
						if (align === "center") {
							imgX = (pageWidth - imageWidth) / 2;
						}

						doc.addImage(imgData, "JPEG", imgX, yPos, imageWidth, imageHeight);
						yPos += imageHeight + 5;
					} else {
						// placeholder
						doc.rect(margin, yPos, imageWidth, imageHeight);
						doc.text("Image not available", margin + 3, yPos + 20);
						yPos += imageHeight + 5;
					}
				}

				y = yPos;
			};

			ensureSpace(lineHeight);

			const parseFilePaths = (filePaths) => {
				if (!filePaths) return [];

				if (Array.isArray(filePaths)) return filePaths;

				const trimmed = filePaths.trim();

				if (trimmed.startsWith("[")) {
					try {
						const arr = JSON.parse(trimmed);
						return arr.map(obj => obj.filePath || obj).filter(Boolean);
					} catch {
						return [];
					}
				}

				if (trimmed.includes("||")) {
					return trimmed.split("||").map(f => f.trim()).filter(Boolean);
				}

				return [trimmed];
			};
			const handlePdfOrImage = async (label, filePaths) => {
				const files = parseFilePaths(filePaths);
				if (!files.length) return;

				for (const file of files) {
					const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;

					const isPdfFile =
						typeof file === "string" &&
						file.trim().toLowerCase().endsWith(".pdf");

					if (isPdfFile) {
						if (!seenPdfUrls.has(fileUrl)) {
							seenPdfUrls.add(fileUrl);
							const response = await fetch(fileUrl);
							if (response.ok) {
								externalPdfBlobs.push(await response.blob());
							}
						}
						continue;
					}

					const imgData = await toBase64(fileUrl);
					if (imgData) {
						doc.addPage();

						const pageWidth = doc.internal.pageSize.getWidth();
						const pageHeight = doc.internal.pageSize.getHeight();

						doc.setFont("helvetica", "bold");
						doc.setFontSize(16);
						doc.text(label, pageWidth / 2, 20, { align: "center" });

						const imgWidth = pageWidth * 0.8;
						const imgHeight = pageHeight * 0.6;
						const x = (pageWidth - imgWidth) / 2;
						const y = (pageHeight - imgHeight) / 2;

						doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
					}
				}
			};
			const handlePdfOrImageForFileName = async (label, input, dir) => {
				let files = [];

				// ✅ Case 1: input is array (attachments array)
				if (Array.isArray(input)) {
					files = input
						.map(a => a?.fileName)
						.filter(f => typeof f === "string" && f.trim());
				}

				// ✅ Case 2: input is string (support file paths)
				else {
					files = parseFilePaths(input);
				}

				if (!files.length) return;

				for (const file of files) {
					const fileUrl =
						`${fileBaseURLForFileName}` +
						`?fileName=${encodeURIComponent(file)}` +
						`&dir=${encodeURIComponent(dir || "")}`;

					const isPdfFile =
						typeof file === "string" &&
						file.trim().toLowerCase().endsWith(".pdf");

					// ✅ PDF add as blob
					if (isPdfFile) {
						if (!seenPdfUrls.has(fileUrl)) {
							seenPdfUrls.add(fileUrl);

							const response = await fetch(fileUrl, { credentials: "include" });
							if (response.ok) {
								externalPdfBlobs.push(await response.blob());
							}
						}
						continue;
					}

					// ✅ Image add into jsPDF
					const imgData = await toBase64(fileUrl);
					if (imgData) {
						doc.addPage();

						const pageWidth = doc.internal.pageSize.getWidth();
						const pageHeight = doc.internal.pageSize.getHeight();

						doc.setFont("helvetica", "bold");
						doc.setFontSize(16);
						doc.text(label, pageWidth / 2, 20, { align: "center" });

						const imgWidth = pageWidth * 0.8;
						const imgHeight = pageHeight * 0.6;
						const x = (pageWidth - imgWidth) / 2;
						const y = (pageHeight - imgHeight) / 2;

						doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
					}
				}
			};

			ensureSpace(lineHeight);
			await imageSection('Contractor Selfie', inspection.selfieContractor, margin, y, { align: "center" });
			y += 10;

			ensureSpace(lineHeight);
			await imageSection('Contractor Site Images', inspection.imagesUploadedByContractor, margin, y, { align: "center" });
			y += 15;

			ensureSpace(lineHeight);
			await imageSection('Inspector Selfie', inspection.selfieClient, margin, y, { align: "center" });
			y += 10;

			ensureSpace(lineHeight);
			await imageSection('Inspector Site Images', inspection.imagesUploadedByClient, margin, y, { align: "center" });
			y += 15;

			ensureSpace(lineHeight);
			if (enclosures && enclosures.length > 0) {
				for (const enc of enclosures) {
					await handlePdfOrImage(enc.enclosureName, enc.file);
				}
			}
			ensureSpace(lineHeight);
			await handlePdfOrImageForFileName(
				"Supporting Docs uploaded_by Contractor",
				inspection.conSupportFilePaths,
				"support"
			);

			await handlePdfOrImageForFileName(
				"Supporting Docs uploaded_by Engineer",
				inspection.enggSupportFilePaths,
				"support"
			);

			await handlePdfOrImageForFileName(
				"Attached Files",
				inspection.attachments,
				"attachment"
			);
			await handlePdfOrImage('Test Result uploaded_by Contractor', inspection.testResultContractor);
			await handlePdfOrImage('Test Result uploaded_by Engineer', inspection.testResultEngineer);
			await handlePdfOrImage('Test Report', inspection.testSiteDocumentsContractor);


		}
		const mergedBlob = await mergeWithExternalPdfs(doc, externalPdfBlobs);

		return {
			blob: mergedBlob,
			fileName: rfiName
				? `${rfiName}_RfiReport.pdf`
				: `RfiReport_${Date.now()}.pdf`
		};

	};


	//handle download method for hte table download button
	const downloadPDFWithDetails = async (rfiId, idx) => {
		try {
			const res = await axios.get(
				`${API_BASE_URL}api/validation/getRfiReportDetail/${rfiId}`,
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			);

			if (!res.data?.reportDetails) {
				alert("No inspection details found.");
				return;
			}

			const inspection = res.data.reportDetails;

			inspection.remarks = remarksList[idx] || "";
			inspection.status = statusList[idx] || "";

			const { blob, fileName } = await generatePDF(
				[inspection],
				res.data.checklistItems || [],
				res.data.enclosures || [],
				res.data.measurementDetails
					? [res.data.measurementDetails]
					: []
			);

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(url);

		} catch (err) {
			console.error("Error fetching details for PDF:", err);
			alert("Failed to generate PDF. Please try again.");
		}
	};


	const handlePrint = async () => {
		if (!selectedInspection) {
			alert("No data available to print!");
			return;
		}

		const result = await generatePDF(
			[selectedInspection],
			checklistItems,
			enclosures,
			Measurement
		);

		const blobUrl = URL.createObjectURL(result.blob);

		const iframe = document.createElement("iframe");
		iframe.style.display = "none";
		iframe.src = blobUrl;
		document.body.appendChild(iframe);

		iframe.onload = () => {
			iframe.contentWindow.focus();
			iframe.contentWindow.print();
		};

		const cleanup = () => {
			URL.revokeObjectURL(blobUrl);
			if (iframe.parentNode) {
				document.body.removeChild(iframe);
			}
			window.removeEventListener("focus", cleanup);
		};

		window.addEventListener("focus", cleanup);
	};


	// Downlaod handle method in the preview	
	const handleDownload = async () => {
		if (!selectedInspection) {
			alert("No data available to generate PDF!");
			return;
		}

		const result = await generatePDF(
			[selectedInspection],
			checklistItems,
			enclosures,
			Measurement
		);

		const link = document.createElement("a");
		link.href = URL.createObjectURL(result.blob);
		link.download = result.fileName;
		link.click();
	};


	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(5);

	const totalEntries = rfiList.length;
	const pageCount = Math.ceil(totalEntries / pageSize);

	const [pageIndex1, setPageIndex1] = useState(0);
	const [pageSize1, setPageSize1] = useState(5);

	const totalEntries1 = rfiList1.length;
	const pageCount1 = Math.ceil(totalEntries1 / pageSize);



	return (
		<div className="dashboard validation">

			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
				{!isProjectEngineer && (
					<>
					<h2 className="validation-heading">RFI VALIDATION</h2>
					<div>
						<div className="left-align">
							<label>
								Show{' '}
								<select
									value={pageSize}
									onChange={(e) => {
										setPageSize(Number(e.target.value));
										setPageIndex(0);
									}}
								>
									{[5, 10, 20, 50].map((size) => (
										<option key={size} value={size}>
											{size}
										</option>
									))}
								</select>{' '}
								entries
							</label>
						</div>


						<table className="validation-table">
							<thead>
								<tr>
									<th>RFI ID</th>
									<th>Preview</th>
									<th>Download</th>
									<th>Remarks</th>
									<th>Comments</th>
									{(isDyHOD || isITAdmin || isEnggAuthority) && (
										<th>Action</th>
									)}
								</tr>
							</thead>
							<tbody>
								{rfiList.length > 0 ? (
									rfiList
										.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
										.map((rfi, idx) => {
											const globalIndex = pageIndex * pageSize + idx;
											const remarks = remarksList[globalIndex];
											const action = statusList[globalIndex];
											const comments = commentsList[globalIndex];
											const isValidated = submittedList[globalIndex];
											const isEditable = editModeList[globalIndex];

											return (
												<tr key={globalIndex}>
													<td>{rfi.stringRfiId}</td>

													<td>
														<button onClick={() => fetchPreview(rfi.longRfiId)}>👁️</button>
													</td>

													<td>
														<button onClick={() => downloadPDFWithDetails(rfi.longRfiId, globalIndex)}>⬇️</button>
													</td>
													{/* Remarks column */}
													<td>
														{(isDyHOD || isITAdmin || isEnggAuthority) ? (
															<select
																value={remarks || ""}
																onChange={(e) => updateRemark(globalIndex, e.target.value)}
																disabled={isValidated && !isEditable}
															>
																<option value="">-- Select --</option>
																<option value="NONO">NONO</option>
																<option value="NONOC(B)">NONOC (B)</option>
																<option value="NONOC(C)">NONOC (C)</option>
																<option value="NOR">NOR</option>
															</select>
														) : (
															remarks ? <span>{remarks}</span> : <span style={{ color: '#999' }}>Validation Pending</span>
														)}
													</td>

													<td style={{ position: "relative" }}>
														<textarea
															value={comments || ""}
															onChange={(e) => handleCommentChange(globalIndex, e.target.value)}
															disabled={isValidated && !isEditable}
															placeholder="Enter your comment"
															maxLength={500}
															style={{
																width: "100%",
																minHeight: "60px",
																resize: "vertical",
																padding: "8px",
																borderRadius: "6px",
																border: "1px solid #ccc",
																fontSize: "14px",
																boxSizing: "border-box"
															}}
														/>

														{/* Character counter */}
														<div
															style={{
																position: "absolute",
																bottom: "1px",
																right: "10px",
																fontSize: "12px",
																color: (comments?.length || 0) >= 500 ? "red" : "#888",
																pointerEvents: "none",
																backgroundColor: "#fff"
															}}
														>
															{500 - (comments?.length || 0)} / 500
														</div>
													</td>


													{/* Action */}
													{(isDyHOD || isITAdmin || isEnggAuthority) && (
														<td>
															{isValidated ? (
																<span style={{ color: action === "APPROVED" ? "green" : "red", fontWeight: "bold" }}>
																	{action}
																</span>

															) : (
																<>
																	<div className='validate-buttons'>
																		<button className='approve'
																			onClick={() => submitValidation(rfi, globalIndex, "APPROVED")}
																		>
																			Approve
																		</button>

																		<button className='reject'
																			onClick={() => submitValidation(rfi, globalIndex, "REJECTED")}
																		>
																			Reject
																		</button>
																	</div>
																</>)}
														</td>

													)}
												</tr>
											);
										})
								) : (
									<tr>
										<td colSpan={6}>
											{message && (
												<div className="alert alert-info text-center" role="alert">
													{message}
												</div>
											)}
										</td>
									</tr>

								)}
							</tbody>


						</table>
						<div className="">
							<div >
								<span>
									Showing {rfiList.length === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
									{Math.min((pageIndex + 1) * pageSize, rfiList.length)} of {rfiList.length} entries
								</span>

								<button
									onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
									disabled={pageIndex === 0}
								>
									&laquo;
								</button>
								<span style={{ margin: '0 10px' }}>
									Page {pageIndex + 1} of {pageCount}
								</span>
								<button
									onClick={() => setPageIndex((prev) => Math.min(prev + 1, pageCount - 1))}
									disabled={pageIndex >= pageCount - 1}
								>
									&raquo;
								</button>
							</div>
						</div>

					</div>
					</>
					
					)}


					{(isEnggAuthority || isProjectEngineer) && (
						<div>
							<h2 className="validation-heading">RFI LIST</h2>

							<div className="left-align">
								<label>
									Show{' '}
									<select
										value={pageSize1}
										onChange={(e) => {
											setPageSize1(Number(e.target.value));
											setPageIndex1(0);
										}}
									>
										{[5, 10, 20, 50].map((size) => (
											<option key={size} value={size}>
												{size}
											</option>
										))}
									</select>{' '}
									entries
								</label>
							</div>
							<table className="validation-table">

								<thead>
									<tr>
										<th>RFI ID</th>
										<th>Preview</th>
										<th>Download</th>
										<th>Remarks</th>
										<th>Comment</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{rfiList1.length > 0 ? (
										rfiList1
											.slice(pageIndex1 * pageSize1, (pageIndex1 + 1) * pageSize1)
											.map((rfi, idx) => {
												const globalIndex = pageIndex * pageSize + idx;
												const remarks = remarksList1[globalIndex];
												const status = statusList1[globalIndex];
												const comment = commentsList1[globalIndex];

												return (
													<tr key={globalIndex}>
														<td>{rfi.stringRfiId}</td>

														<td>
															<button onClick={() => fetchPreview(rfi.longRfiId)}>👁️</button>
														</td>

														<td>
															<button onClick={() => downloadPDFWithDetails(rfi.longRfiId, globalIndex)}>⬇️</button>
														</td>
														{/* Remarks column */}
														<td>
															{remarks ? <span>{remarks}</span> : <span style={{ color: '#999' }}>Validation Pending</span>
															}
														</td>



														{/*Comment */}
														<td>{comment ? <span>{comment}</span> : <span style={{ color: '#999' }}>Validation Pending</span>

														}

														</td>
														{/* Status column */}
														<td>

															{status ? <span
																style={{
																	fontWeight: "bold",
																	color:
																		status === "APPROVED" ? "green" :
																			status === "REJECTED" ? "red" :
																				"#555"
																}}
															>
																{status}
															</span> : <span style={{ color: '#999' }}>Validation Pending</span>
															}
														</td>

													</tr>
												);
											})
									) : (
										<tr>
											<td colSpan={6}>
												{message1 && (
													<div className="alert alert-info text-center" role="alert">
														{message1}
													</div>
												)}
											</td>
										</tr>
									)}
								</tbody>


							</table>


							<div className="">
								<div >
									<span>
										Showing {rfiList1.length === 0 ? 0 : pageIndex1 * pageSize1 + 1} to{' '}
										{Math.min((pageIndex1 + 1) * pageSize1, rfiList1.length)} of {rfiList1.length} entries
									</span>

									<button
										onClick={() => setPageIndex1((prev) => Math.max(prev - 1, 0))}
										disabled={pageIndex1 === 0}
									>
										&laquo;
									</button>
									<span style={{ margin: '0 10px' }}>
										Page {pageIndex1 + 1} of {pageCount1}
									</span>
									<button
										onClick={() => setPageIndex1((prev) => Math.min(prev + 1, pageCount1 - 1))}
										disabled={pageIndex1 >= pageCount1 - 1}
									>
										&raquo;
									</button>
								</div>
							</div>


						</div>

					)

					}







					{selectedInspection && (
						<div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
							<div className="popup-content" onClick={(e) => e.stopPropagation()}>
								<h3>RFI Preview</h3>
								<div className="d-flex justify-center">
									<h3 style={{ gridColumn: 'span 1' }}>Request For Inspection (RFI)</h3>
								</div>
								<div className="form-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
									<div className="form-fields">
										<label>Client:</label>
										<p>Mumbai Rail Vikas Corporation</p>
									</div>
									<div style={{ textAlign: 'right' }}>
										<label style={{ color: '#636363' }}>RFI Status:</label>
										<p style={{
											color: selectedInspection.rfiStatus === "INSPECTION_DONE" ? "red" : "green",
											fontWeight: "bold",
										}}
										>{selectedInspection.rfiStatus === "INSPECTION_DONE" ? "Closed" : "Active"}</p>
									</div>
								</div>


								<div className="form-row align-start">
									<div className="form-fields">
										<label>Consultant:</label>
										<p>N/A</p>
									</div>

									<div className="form-fields">
										<label>Contract:</label>
										<p>{selectedInspection.contract}</p>
									</div>

									<div className="form-fields">
										<label>Contractor:</label>
										<p>{selectedInspection.contractor}</p>
									</div>

									<div className="form-fields">
										<label>Contract ID:</label>
										<p>{selectedInspection.contractId}</p>
									</div>

									<div className="form-fields">
										<label>RFI ID:</label>
										<p>{selectedInspection.rfiId}</p>
									</div>

									<div className="form-fields">
										<label>Date of Inspection:</label>
										<p>{selectedInspection.dateOfInspection}</p>
									</div>
									<div className="form-fields">
										<label>Location:</label>
										<p>{selectedInspection.location}</p>
									</div>

									<div className="form-fields">
										<label>Proposed Time:</label>
										<p>{selectedInspection.proposedInspectionTime}</p>
									</div>

									<div className="form-fields">
										<label>Actual Time:</label>
										<p>{selectedInspection.actualInspectionTime}</p>
									</div>
									<div className="form-fields">
										<label>RfiDescription:</label>
										<p>{selectedInspection.rfiDescription}</p>
									</div>

									<div className="form-fields">
										<label>Enclosures:</label>
										<p>{selectedInspection.enclosures}</p>
									</div>


									<div className="form-fields">
										<label>Contractor's Representative:</label>
										<p>{selectedInspection.contractorRepresentative}</p>
									</div>

									<div className="form-fields">
										<label>Client Representative:</label>
										<p>{selectedInspection.clientRepresentative}</p>
									</div>

									<div className="form-fields">
										<label>Description by Contractor:</label>
										<p>{selectedInspection.descriptionByContractor}</p>
									</div>

									<div className="form-fields">
										<label>Test Report Approval By Inspector:</label>
										<p>{selectedInspection.testStatus}</p>
									</div>


								</div >

								{Measurement && (<div className='previewTable-section'>
									<h3> Measurement Details</h3>
									<div className='measurements-table-prev'>
										<table>
											<thead>
												<tr>
													<th>Type</th>
													<th>Length</th>
													<th>Breadth</th>
													<th>Height</th>
													<th>Count</th>
													<th>Total Quantity</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>{Measurement.measurementType}</td>
													<td>{Measurement.l}</td>
													<td>{Measurement.b}</td>
													<td>{Measurement.h}</td>
													<td>{Measurement.no}</td>
													<td>{Measurement.totalQty}</td>
												</tr>
											</tbody>

										</table>

									</div>
								</div>)
								}

								{checklistItems && checklistItems.length > 0 ? (
									Object.entries(
										checklistItems.reduce((groups, item) => {
											if (!groups[item.enclosureName]) {
												groups[item.enclosureName] = [];
											}
											groups[item.enclosureName].push(item);
											return groups;
										}, {})
									).map(([enclosureName, items], idx) => (
										<div key={idx} className="previewTable-section">
											<h3 >{enclosureName}</h3>
											<table className="measurements-table-prev">
												<thead>
													<tr>
														<th>ID</th>
														<th>Description</th>
														<th>Contractor Status</th>
														<th>AE Status</th>
														<th>Contractor Remarks</th>
														<th>AE Remarks</th>
													</tr>
												</thead>
												<tbody>
													{items.map((row, i) => (
														<tr key={i}>
															<td>{i + 1}</td>
															<td>{row.checklistDescription || "---"}</td>
															<td>{row.conStatus || "---"}</td>
															<td>{row.aeStatus || "---"}</td>
															<td>{row.contractorRemark || "---"}</td>
															<td>{row.aeRemark || "---"}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									))
								) : (
									<p>No checklist items found.</p>
								)}



								<div className='previewTable-section'>
									<h3>RFI Validation Details</h3>
									<p><strong> Status:</strong> {selectedInspection.validationStatus || '---'}</p>
									<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>
									<p><strong>comment:</strong> {selectedInspection.validationComments || '---'}</p>

								</div>


								{selectedInspection.selfieContractor && (
									<>
										<h4>Contractor Selfie</h4>
										<div className="image-gallery">
											{selectedInspection.selfieContractor.split(',').map((img, idx) => {
												const trimmedPath = img.trim();
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

												return (
													<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
														<img
															src={fileUrl}
															alt={`Contractor Image ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													</a>
												);
											})}
										</div>
									</>
								)}


								{selectedInspection.imagesUploadedByContractor && (
									<>
										<h4>Site Images By Contractor</h4>
										<div className="image-gallery">
											{selectedInspection.imagesUploadedByContractor.split(',').map((img, idx) => {
												const trimmedPath = img.trim();
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

												return (
													<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
														<img
															src={fileUrl}
															alt={`Contractor Image ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													</a>
												);
											})}
										</div>
									</>
								)}

								{selectedInspection.selfieClient && (
									<>
										<h4 style={{ textAlign: 'center' }}>Inspector Selfie</h4>
										<div className="image-gallery">
											{selectedInspection.selfieClient.split(',').map((img, idx) => {
												const trimmedPath = img.trim();
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

												return (
													<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
														<img
															src={fileUrl}
															alt={`Contractor Image ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													</a>
												);
											})}
										</div>
									</>
								)}


								{selectedInspection.imagesUploadedByClient && (
									<>
										<h4>Site Images By Inspector</h4>
										<div className="image-gallery">
											{selectedInspection.imagesUploadedByClient.split(',').map((img, idx) => {
												const trimmedPath = img.trim();
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

												return (
													<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
														<img
															src={fileUrl}
															alt={`Contractor Image ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													</a>
												);
											})}
										</div>
									</>
								)}




								{enclosures && enclosures.length > 0 ? (
									Object.entries(
										enclosures.reduce((groups, item) => {
											if (!groups[item.enclosureName]) groups[item.enclosureName] = [];
											groups[item.enclosureName].push(item.file);
											return groups;
										}, {})
									).map(([enclosureName, files], idx) => (
										<React.Fragment key={idx}>
											<h4>Enclosures Uploaded ({enclosureName})</h4>
											<div className="image-gallery">
												{files.map((rawPath, i) => {
													const path = rawPath.trim();
													const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;
													const extension = getExtension(path);

													return (
														<a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer">
															{extension === "pdf" ? (
																<embed
																	src={fileUrl}
																	type="application/pdf"
																	width="100%"
																	height="500px"
																	className="preview-pdf w-100"
																/>
															) : (
																<img
																	src={fileUrl}
																	alt={`Enclosure ${i + 1}`}
																	className="preview-image"
																	style={{ width: "100%", height: "100%", objectFit: "contain" }}
																	onError={() => console.error("Image load error:", fileUrl)}
																/>
															)}
														</a>
													);
												})}
											</div>
										</React.Fragment>
									))
								) : (
									<p>No enclosures uploaded.</p>
								)}


								{selectedInspection.conSupportFilePaths && (
									<>
										<h4>Support Docs Uploaded By Contractor</h4>

										<div className="image-gallery">
											{JSON.parse(selectedInspection.conSupportFilePaths).map((doc, index) => {
												const path = doc.filePath;
												const description = doc.documentsDescription;

												const filename = getFilename(path);
												const extension = getExtension(filename);

												const fileUrl = `${fileBaseURLForFileName}?fileName=${encodeURIComponent(path)}&dir=support`;

												return (
													<div key={index} className="mb-3">
														<p><strong>Description:</strong> {description}</p>

														<a href={fileUrl} target="_blank" rel="noopener noreferrer">
															{extension === "pdf" ? (
																<embed
																	src={fileUrl}
																	type="application/pdf"
																	width="100%"
																	height="500px"
																	className="preview-pdf w-100"
																/>
															) : (
																<img
																	src={fileUrl}
																	alt={description || "Supporting Document"}
																	className="preview-image"
																	style={{ width: "100%", height: "100%", objectFit: "contain" }}
																/>
															)}
														</a>
													</div>
												);
											})}
										</div>
									</>
								)}



								{selectedInspection.enggSupportFilePaths && (
									<>
										<h4>Support Docs Uploaded By Engineer</h4>

										<div className="image-gallery">
											{JSON.parse(selectedInspection.enggSupportFilePaths).map((doc, index) => {
												const path = doc.filePath;
												const description = doc.documentsDescription;

												const filename = getFilename(path);
												const extension = getExtension(filename);

												const fileUrl = `${fileBaseURLForFileName}?fileName=${encodeURIComponent(path)}&dir=support`;

												return (
													<div key={index} className="mb-3">
														<p><strong>Description:</strong> {description}</p>

														<a href={fileUrl} target="_blank" rel="noopener noreferrer">
															{extension === "pdf" ? (
																<embed
																	src={fileUrl}
																	type="application/pdf"
																	width="100%"
																	height="500px"
																	className="preview-pdf w-100"
																/>
															) : (
																<img
																	src={fileUrl}
																	alt={description || "Supporting Document"}
																	className="preview-image"
																	style={{ width: "100%", height: "100%", objectFit: "contain" }}
																/>
															)}
														</a>
													</div>
												);
											})}
										</div>
									</>
								)}

								{selectedInspection.attachments?.length > 0 && (
									<>
										<h4>Attached Documents</h4>

										<div className="image-gallery">
											{selectedInspection.attachments.map((att, index) => {
												const filename = att.fileName;         // ✅ coming from backend
												const description = att.description;   // ✅ coming from backend

												const extension = getExtension(filename);

												// ✅ dir should be "attachment" as per your backend
												const fileUrl = `${fileBaseURLForFileName}?fileName=${encodeURIComponent(
													filename
												)}&dir=attachment`;

												return (
													<div key={index} className="mb-3">
														<p>
															<strong>Description:</strong> {description || "-"}
														</p>

														<a href={fileUrl} target="_blank" rel="noopener noreferrer">
															{extension === "pdf" ? (
																<embed
																	src={fileUrl}
																	type="application/pdf"
																	width="100%"
																	height="500px"
																	className="preview-pdf w-100"
																/>
															) : (
																<img
																	src={fileUrl}
																	alt={description || "Attachment"}
																	className="preview-image"
																	style={{
																		width: "100%",
																		height: "100%",
																		objectFit: "contain",
																	}}
																/>
															)}
														</a>
													</div>
												);
											})}
										</div>
									</>
								)}

								{selectedInspection.testResultContractor && (
									<>
										<h4>Test Result Uploaded By Contractor</h4>
										<div className="image-gallery">

											{(() => {
												const path = selectedInspection.testResultContractor.trim();
												const filename = getFilename(path);
												const extension = getExtension(filename);
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;

												return (
													<a href={fileUrl} target="_blank" rel="noopener noreferrer">
														{extension === 'pdf' ? (
															<embed
																src={fileUrl}
																type="application/pdf"
																width="100%"
																height="500px"
																className="preview-pdf w-100"
															/>
														) : (
															<img
																src={fileUrl}
																alt="Test Report"
																className="preview-image"
																style={{ width: "100%", height: "100%", objectFit: "contain" }}
																onError={() => console.error("Image load error:", fileUrl)}
															/>
														)}
													</a>
												);
											})()}
										</div>
									</>
								)}



								{selectedInspection.testResultEngineer && (
									<>
										<h4>Test Result Uploaded By Engineer</h4>
										<div className="image-gallery">

											{(() => {
												const path = selectedInspection.testResultEngineer.trim();
												const filename = getFilename(path);
												const extension = getExtension(filename);
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;

												return (
													<a href={fileUrl} target="_blank" rel="noopener noreferrer">
														{extension === 'pdf' ? (
															<embed
																src={fileUrl}
																type="application/pdf"
																width="100%"
																height="500px"
																className="preview-pdf w-100"
															/>
														) : (
															<img
																src={fileUrl}
																alt="Test Report"
																className="preview-image"
																style={{ width: "100%", height: "100%", objectFit: "contain" }}
																onError={() => console.error("Image load error:", fileUrl)}
															/>
														)}
													</a>
												);
											})()}
										</div>
									</>
								)}


								{selectedInspection.testSiteDocumentsContractor && (
									<>
										<h4>Test Report Uploaded By Contractor</h4>
										<div className="image-gallery">

											{(() => {
												const path = selectedInspection.testSiteDocumentsContractor.trim();
												const filename = getFilename(path);
												const extension = getExtension(filename);
												const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;

												return (
													<a href={fileUrl} target="_blank" rel="noopener noreferrer">
														{extension === 'pdf' ? (
															<embed
																src={fileUrl}
																type="application/pdf"
																width="100%"
																height="500px"
																className="preview-pdf w-100"
															/>
														) : (
															<img
																src={fileUrl}
																alt="Test Report"
																className="preview-image"
																style={{ width: "100%", height: "100%", objectFit: "contain" }}
																onError={() => console.error("Image load error:", fileUrl)}
															/>
														)}
													</a>
												);
											})()}
										</div>
									</>
								)}


								<div className='preview-popup-btn'>
									<button onClick={() => setSelectedInspection(null)}>Close</button>
									<button onClick={handlePrint}>Print</button>
									<button onClick={handleDownload}>Download PDF</button>
								</div>
							</div>
						</div>
					)}

				</div>
			</div>
		</div>
	);
}