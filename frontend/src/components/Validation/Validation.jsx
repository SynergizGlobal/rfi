import axios from 'axios';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Validation.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const getExtension = (filename) => {
	return filename?.split('.').pop()?.toLowerCase();
};
export default function Validation() {
	const [rfiList, setRfiList] = useState([]);
	const [remarksList, setRemarksList] = useState([]);
	const [statusList, setStatusList] = useState([]);
	const [fileList, setFileList] = useState([]);
	const [selectedInspection, setSelectedInspection] = useState(null);

	useEffect(() => {
		axios.get('http://localhost:8000/getRfiValidations')
			.then(res => setRfiList(res.data))
			.catch(err => console.error(err));
	}, []);

	const updateRemark = (idx, value) => {
		const updated = [...remarksList];
		updated[idx] = value;
		setRemarksList(updated);
	};

	const updateStatus = (idx, value) => {
		const updated = [...statusList];
		updated[idx] = value;
		setStatusList(updated);
	};

	const handleFileChange = (idx, file) => {
		const updated = [...fileList];
		updated[idx] = file;
		setFileList(updated);
	};

	const submitValidation = (rfi, idx) => {
		const formData = new FormData();
		formData.append("long_rfi_id", rfi.longRfiId);
		formData.append("long_rfi_validate_id", rfi.longRfiValidateId);
		formData.append("remarks", remarksList[idx] || '');
		formData.append("action", statusList[idx] || '');
		formData.append("file", fileList[idx]);

		axios.post("http://localhost:8000/validate", formData)
			.then(() => alert('Validation submitted successfully.'))
			.catch(err => console.error('Validation error:', err));
	};

	const fetchPreview = (rfiId) => {
		axios.get(`http://localhost:8000/getRfiReportDetails/${rfiId}`)
			.then(res => {
				if (res.data?.length > 0) {
					setSelectedInspection(res.data[0]);
				}
			})
			.catch(err => console.error(err));
	};


	const getFilename = (path) => path?.split('\\').pop().replace(/^"|"$/g, '');
	const fileBaseURL = 'http://localhost:8000/previewFiles';


const generatePDF = async (inspectionListToExport, remarksList = [], statusList = []) => {
	const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

	const loadLogo = () =>
		new Promise(resolve => {
			const img = new Image();
			img.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Mrvc_logo.jpg/600px-Mrvc_logo.jpg';
			img.onload = () => resolve(img);
			img.onerror = () => resolve(null);
		});

	const logo = await loadLogo();

	inspectionListToExport.forEach((inspection, idx) => {
		// ✅ Inject live remarks and status
		if (remarksList[idx]) inspection.remarks = remarksList[idx];
		if (statusList[idx]) inspection.rfiStatus = statusList[idx];

		if (idx !== 0) doc.addPage();
		if (logo) doc.addImage(logo, 'JPEG', 150, 10, 40, 15);

		let y = 30;
		const safe = (val) => val || '---';

		doc.setFontSize(10);
		doc.text(`Client: ${safe(inspection.client)}`, 15, y);
		doc.setFontSize(12);
		doc.text('REQUEST FOR INSPECTION (RFI)', 105, y);
		y += 8;

		doc.setFontSize(10);
		doc.text(`Consultant: ${safe(inspection.consultant)}`, 15, y);
		doc.text(`Contract: ${safe(inspection.contract)}`, 75, y);
		doc.text(`Contractor: ${safe(inspection.contractor)}`, 135, y);
		y += 6;
		doc.text(`Contract ID: ${safe(inspection.contractId)}`, 15, y);
		doc.text(`RFI ID: ${safe(inspection.rfiId)}`, 75, y);
		y += 6;
		doc.text(`Date of Inspection: ${safe(inspection.dateOfInspection)}`, 15, y);
		doc.text(`Location: ${safe(inspection.location)}`, 75, y);
		doc.text(`Proposed Time: ${safe(inspection.proposedInspectionTime)}`, 135, y);
		y += 6;
		doc.text(`Actual Time: ${safe(inspection.actualTime)}`, 15, y);
		y += 6;
		doc.text(`Contractor’s Representative: ${safe(inspection.contractorRep)}`, 15, y);
		doc.text(`Client Representative: ${safe(inspection.clientRep)}`, 105, y);
		y += 10;

		doc.setFont(undefined, 'bold');
		doc.text('Description by Contractor:', 15, y);
		doc.setFont(undefined, 'normal');
		y += 5;
		const contractorDesc = doc.splitTextToSize(safe(inspection.contractorDescription), 180);
		doc.text(contractorDesc, 15, y);
		y += contractorDesc.length * 5;

		doc.setFont(undefined, 'bold');
		doc.text('Comments by Client:', 15, y);
		doc.setFont(undefined, 'normal');
		y += 5;
		const clientComments = doc.splitTextToSize(safe(inspection.clientComments), 180);
		doc.text(clientComments, 15, y);
		y += clientComments.length * 5;

		doc.setFont(undefined, 'bold');
		doc.text('RFI Approval Status:', 15, y);
		y += 6;

		const statusOptions = ['Approved', 'Rejected', 'Approved with Comments'];
		statusOptions.forEach((opt, i) => {
			const x = 15 + i * 60;
			doc.circle(x, y, 2);
			if (inspection.rfiStatus === opt || inspection.rfiStatus === opt.toUpperCase()) {
				doc.setFillColor(0).circle(x, y, 1, 'F');
			}
			doc.text(opt, x + 5, y + 1);
		});
		y += 10;

		doc.setFont(undefined, 'bold');
		doc.text('Enclosures:', 15, y);
		y += 5;

		const checklistSummary = (inspection.enclosureStates?.[1]?.checklist || []).map(row => [
			safe(row.id),
			safe(row.description),
			safe(row.status),
			safe(row.contractorRemark),
			safe(row.aeRemark),
		]);

		if (checklistSummary.length > 0) {
			doc.autoTable({
				startY: y,
				head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
				body: checklistSummary,
				styles: { fillColor: [255, 255, 255], lineWidth: 0.1 },
				headStyles: { fillColor: [0, 102, 153], textColor: 255 },
			});
			y = doc.lastAutoTable.finalY + 10;
		} else {
			doc.text('No checklist data available.', 15, y);
			y += 10;
		}

		doc.setFont(undefined, 'bold');
		doc.text('Site Images:', 15, y);
		y += 5;

		Object.values(inspection.galleryImages || {}).forEach(img => {
			if (img) {
				try {
					doc.addImage(img, 'JPEG', 15, y, 50, 40);
					y += 45;
				} catch (e) {
					console.warn('Image add error:', e);
				}
			}
		});

		if (inspection.selfieImage) {
			doc.text('Selfie Image:', 15, y);
			try {
				doc.addImage(inspection.selfieImage, 'JPEG', 15, y + 5, 50, 40);
				y += 50;
			} catch (e) {
				console.warn('Selfie image error:', e);
			}
		}

		if (inspection.enclosureStates?.[1]?.contractorSign) {
			doc.text('Contractor Signature:', 15, y);
			try {
				doc.addImage(inspection.enclosureStates[1].contractorSign, 'JPEG', 15, y + 5, 40, 20);
				y += 25;
			} catch (e) {
				console.warn('Contractor sign error:', e);
			}
		}

		if (inspection.enclosureStates?.[1]?.gcSign) {
			doc.text('GC/MRVC Signature:', 100, y - 25);
			try {
				doc.addImage(inspection.enclosureStates[1].gcSign, 'JPEG', 100, y - 20, 40, 20);
			} catch (e) {
				console.warn('GC sign error:', e);
			}
		}

		// ✅ Add Remarks at the bottom
		doc.setFont(undefined, 'bold');
		doc.text('Remarks:', 15, y);
		doc.setFont(undefined, 'normal');
		doc.text(doc.splitTextToSize(safe(inspection.remarks), 180), 15, y + 5);
	});

	doc.save('All_RFIs.pdf');
};

const downloadPDFWithDetails = async (rfiId, idx) => {
	try {
		const res = await axios.get(`http://localhost:8000/getRfiReportDetails/${rfiId}`);
		if (res.data?.length > 0) {
			const inspection = res.data[0];
			// Inject remarks/status directly into inspection before passing
			inspection.remarks = remarksList[idx] || '';
			inspection.rfiStatus = statusList[idx] || '';
			await generatePDF([inspection]); // No need to pass remarksList/statusList now
		} else {
			alert("No inspection details found.");
		}
	} catch (err) {
		console.error("Error fetching details for PDF:", err);
	}
};



	const printPreview = () => window.print();

	return (
		<div className="dashboard validation">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<h2 className="validation-heading">Validation</h2>

					<table className="validation-table">
						<thead>
							<tr>
								<th>RFI ID</th>
								<th>Preview</th>
								<th>Download</th>
								<th>Remarks</th>
								<th>Status</th>
								<th>File</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rfiList.map((rfi, idx) => (
								<tr key={idx}>
									<td>{rfi.stringRfiId}</td>
									<td><button onClick={() => fetchPreview(rfi.longRfiId)}>👁️</button></td>
<button onClick={() => downloadPDFWithDetails(rfi.longRfiId, idx)}>⬇️</button>
									<td>
										<select onChange={(e) => updateRemark(idx, e.target.value)}>
											<option value="">-- Select --</option>
											<option value="NONO">NONO</option>
											<option value="NONOC(B)">NONOC (B)</option>
											<option value="NONOC(C)">NONOC (C)</option>
											<option value="NOR">NOR</option>
										</select>
									</td>
									<td>
										<select onChange={(e) => updateStatus(idx, e.target.value)}>
											<option value="">-- Select --</option>
											<option value="APPROVED">Approved</option>
											<option value="REJECTED">Rejected</option>
											<option value="CLARIFICATION_REQUIRED">Clarification Required</option>
										</select>
									</td>
									<td>
										<input type="file" onChange={(e) => handleFileChange(idx, e.target.files[0])} />
									</td>
									<td>
										<button onClick={() => submitValidation(rfi, idx)}>Validate</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{selectedInspection && (
						<div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
							<div className="popup-content" onClick={(e) => e.stopPropagation()}>
								<h3>RFI Preview</h3>
								<div className="form-row">
									<div className="form-fields" style={{ gridColumn: 'span 1' }}>
										<label>Client:</label>
										<p>Mumbai Rail Vikas Corporation</p>
									</div>
									<div className="form-fields" style={{ gridColumn: 'span 1' }}>
										<label></label>
										<p>Request For Information (RFI)</p>
									</div>

									<div className="form-fields">
										<label>Consultant:</label>
										<p>{selectedInspection.consultant}</p>
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


								</div>

								<h4>Checklist</h4>
								<table className="preview-table">
									<thead>
										<tr>
											<th>ID</th>
											<th>Description</th>
											<th>Status</th>
											<th>Contractor Remarks</th>
											<th>AE Remarks</th>
										</tr>
									</thead>
									<tbody>
										{/* Drawing row */}
										<tr>
											<td>1</td>
											<td>Drawing</td>
											<td>{selectedInspection.drawingStatus || '---'}</td>
											<td>{selectedInspection.drawingRemarksContracotr || '---'}</td>
											<td>{selectedInspection.drawingRemarksClient || '---'}</td>
										</tr>
										{/* Alignment row */}
										<tr>
											<td>2</td>
											<td>Alignment</td>
											<td>{selectedInspection.alignmentStatus || '---'}</td>
											<td>{selectedInspection.alignmentoCntractorRemarks || '---'}</td>
											<td>{selectedInspection.alignmentClientRemarks || '---'}</td>
										</tr>
									</tbody>
								</table>


								<h4>Status & Remarks</h4>
								<p><strong>Status:</strong> {selectedInspection.status || '---'}</p>
								<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>

								{selectedInspection.selfiePath && (
									<div className="image-gallery">
										<h4>Inspector Selfie</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.selfiePath)}`}
											alt="Selfie"
											className="preview-image"
										/>
									</div>
								)}


								{selectedInspection.imagesUploadedByClient && (
									<div className="image-gallery">
										<h4>Site Images By Inspector</h4>
										{selectedInspection.imagesUploadedByClient.split(',').map((img, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(img.trim())}`}
												alt={`Client Image ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}

								{selectedInspection.imagesUploadedByContractor && (
									<div className="image-gallery">
										<h4>Site Images By Contractor</h4>
										{selectedInspection.imagesUploadedByContractor.split(',').map((img, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(img.trim())}`}
												alt={`Client Image ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}


								{selectedInspection.enclosureFilePaths && (
									<div className="image-gallery">
										<h4>Enclosures</h4>
										{selectedInspection.enclosureFilePaths.split(',').map((path, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(path.trim())}`}
												alt={`Enclosure ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}

								{selectedInspection.testInsiteLab && selectedInspection.testSiteDocuments && (
									<div className="image-gallery">
										<h4>Test Report</h4>

										{(() => {
											const path = selectedInspection.testSiteDocuments.trim();
											const filename = getFilename(path);
											const extension = getExtension(filename);
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;
											<a href={fileUrl} target="_blank" rel="noopener noreferrer">
												View Test Report
											</a>

											if (extension === 'pdf') {
												return (
													<embed
														src={fileUrl}
														type="application/pdf"
														width="100%"
														height="500px"
														className="preview-pdf"
													/>
												);
											} else {
												return (
													<img
														src={fileUrl}
														alt="Test Report"
														className="preview-image"
														onError={() => console.error("Image load error:", fileUrl)}
													/>
												);
											}
										})()}
									</div>
								)}






								{selectedInspection.contractorSignature && (
									<div className="image-gallery">
										<h4>Contractor Signature</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.contractorSignature)}`}
											alt="Contractor Signature"
											className="preview-image"
										/>
									</div>
								)}


								{selectedInspection.gcMrvcSignature && (
									<div className="image-gallery">
										<h4>GC/MRVC Signature</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.gcMrvcSignature)}`}
											alt="GC Signature"
											className="preview-image"
										/>
									</div>
								)}

								<div className="popup-actions">
									<button onClick={() => setSelectedInspection(null)}>Close</button>
									<button onClick={printPreview}>Print</button>
									<button onClick={() => generatePDF([selectedInspection])}>Download PDF</button>
								</div>
							</div>
						</div>
					)}

				</div>
			</div>
		</div>
	);
}