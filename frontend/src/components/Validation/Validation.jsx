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

	const safe = (val) => val || '-';

	const toBase64 = async (url) => {
		try {
			const response = await fetch(url, { mode: 'cors' });
			const blob = await response.blob();
			return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
			});
		} catch (error) {
			console.error("Base64 conversion error for URL:", url, error);
			return null;
		}
		};

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

  const generatePDF = async (inspectionList) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const safe = (val) => val || '---';
  const logoUrl = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Mrvc_logo.jpg/600px-Mrvc_logo.jpg';
  const logo = await toBase64(logoUrl);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;
  const imageWidth = 60;
  const imageHeight = 40;
  const lineHeight = 6;

  for (let idx = 0; idx < inspectionList.length; idx++) {
    const inspection = inspectionList[idx];
    if (idx !== 0) doc.addPage();
    let y = margin;

    if (logo) {
      doc.addImage(logo, 'JPEG', pageWidth - margin - 45, y, 45, 15);
    }

    y += 18;
    doc.setFontSize(14).setFont(undefined, 'bold');
    doc.text('REQUEST FOR INSPECTION (RFI)', pageWidth / 2, y, { align: 'center' });

    y += 10;
    doc.setFontSize(10).setFont(undefined, 'normal');

    const fields = [
      ['Client', inspection.client],
      ['Consultant', inspection.consultant],
      ['Contract', inspection.contract],
      ['Contractor', inspection.contractor],
      ['Contract ID', inspection.contractId],
      ['RFI ID', inspection.rfiId],
      ['Date of Inspection', inspection.dateOfInspection],
      ['Location', inspection.location],
      ['Proposed Time', inspection.proposedInspectionTime],
      ['Actual Time', inspection.actualInspectionTime],
      ['RFI Description', inspection.rfiDescription],
      ["Contractor's Representative", inspection.contractorRepresentative],
      ['Client Representative', inspection.clientRepresentative],
      ['Description by Contractor', inspection.descriptionByContractor],
      ['Enclosures', inspection.enclosures],
    ];

    for (let i = 0; i < fields.length; i += 2) {
      const left = `${fields[i][0]}: ${safe(fields[i][1])}`;
      const right = fields[i + 1] ? `${fields[i + 1][0]}: ${safe(fields[i + 1][1])}` : '';

      const wrappedLeft = doc.splitTextToSize(left, contentWidth / 2 - 5);
      const wrappedRight = doc.splitTextToSize(right, contentWidth / 2 - 5);
      const maxLines = Math.max(wrappedLeft.length, wrappedRight.length);

      for (let j = 0; j < maxLines; j++) {
        const leftText = wrappedLeft[j] || '';
        const rightText = wrappedRight[j] || '';
        doc.text(leftText, margin, y);
        doc.text(rightText, pageWidth / 2 + 5, y);
        y += lineHeight;
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
      }
    }

    y += 2;
    doc.setFont(undefined, 'bold').text('Checklist:', margin, y);
    y += 2;

    doc.autoTable({
      startY: y,
      head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
      body: [
        ['1', 'Drawing', safe(inspection.drawingStatus), safe(inspection.drawingRemarksContracotr), safe(inspection.drawingRemarksClient)],
        ['2', 'Alignment', safe(inspection.alignmentStatus), safe(inspection.alignmentoCntractorRemarks), safe(inspection.alignmentClientRemarks)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 102, 153], textColor: 255 },
      theme: 'grid',
    });

    y = doc.lastAutoTable.finalY + 5;

    doc.setFont(undefined, 'bold').text('Status:', margin, y);
    doc.setFont(undefined, 'normal').text(safe(inspection.status), margin + 20, y);
    y += lineHeight;

    doc.setFont(undefined, 'bold').text('Remarks:', margin, y);
    y += 4;
    const remarksText = doc.splitTextToSize(safe(inspection.remarks), contentWidth);
    doc.setFont(undefined, 'normal').text(remarksText, margin, y);
    y += remarksText.length * 5 + 5;

    const imageSection = async (label, paths) => {
      if (!paths || !paths.trim()) return;
      const files = paths.split(',').map(f => f.trim()).filter(Boolean);
      if (!files.length) return;

      doc.setFont(undefined, 'bold').text(`${label}:`, margin, y);
      y += 5;

      for (const file of files) {
        const imgData = await toBase64(`${fileBaseURL}?filepath=${encodeURIComponent(file)}`);

        if (y + imageHeight > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }

        if (imgData) {
          doc.addImage(imgData, 'JPEG', margin, y, imageWidth, imageHeight);
        } else {
          // Draw placeholder for missing image
          doc.setDrawColor(0);
          doc.setLineWidth(0.2);
          doc.rect(margin, y, imageWidth, imageHeight);
          doc.text('Image not available', margin + 3, y + 20);
        }

        y += imageHeight + 5;
      }
    };

    await imageSection('Inspector Selfie', inspection.selfieClient);
    await imageSection('Site Images', inspection.imagesUploadedByClient);
    await imageSection('Enclosures', inspection.clientEnclosureFilePaths);
    await imageSection('Contractor Selfie', inspection.selfieContractor);
    await imageSection('Contractor Enclosures', inspection.contractorEnclosureFilePaths);
    await imageSection('GC/MRVC Signature', inspection.gcMrvcSignature);
    await imageSection('Contractor Signature', inspection.contractorSignature);
  }

  doc.save('All_RFIs.pdf');
};



	const downloadPDFWithDetails = async (rfiId, idx) => {
		try {
			const res = await axios.get(`http://localhost:8000/getRfiReportDetails/${rfiId}`);
			if (res.data?.length > 0) {
				const inspection = res.data[0];

				// Inject remarks and status
				inspection.remarks = remarksList[idx] || '';
				inspection.rfiStatus = statusList[idx] || '';

				// Convert image URLs to base64 and assign
				const baseURL = 'http://localhost:8000/previewFiles?filepath=';

				const convert = async (src) => (src ? await toBase64(baseURL + encodeURIComponent(src.trim())) : null);

				// Convert images
				inspection.selfieImage = await convert(inspection.selfieClient);
				inspection.contractorSign = await convert(inspection.contractorSignature);
				inspection.gcSign = await convert(inspection.gcMrvcSignature);

				const galleryImgs = inspection.imagesUploadedByClient?.split(',') || [];
				inspection.galleryImages = {};
				for (let i = 0; i < galleryImgs.length; i++) {
					inspection.galleryImages[i] = await convert(galleryImgs[i]);
				}

				await generatePDF([inspection]);
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
								</div>
								<div className="d-flex justify-center">
										<h3 style={{ gridColumn: 'span 1' }}>Request For Information (RFI)</h3>
								</div>
								<div className="form-row align-start">
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

								{selectedInspection.selfieClient && (
									<div className="image-gallery">
										<h4>Inspector Selfie</h4>
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
								)}


								{selectedInspection.imagesUploadedByClient && (
									<div className="image-gallery">
										<h4>Site Images By Inspector</h4>
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
								)}

								{selectedInspection.clientEnclosureFilePaths && (
									<div className="image-gallery">
										<h4>Enclosures Uploaded By Inspector</h4>
										{selectedInspection.clientEnclosureFilePaths.split(',').map((img, idx) => {
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
								)}

								{selectedInspection.testInsiteLabClient && selectedInspection.testSiteDocumentsClient && (
									<div className="image-gallery">
										<h4>Test Report Uploaded By Inspector</h4>

										{(() => {
											const path = selectedInspection.testSiteDocumentsClient.trim();
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
															className="preview-pdf"
														/>
													) : (
														<img
															src={fileUrl}
															alt="Test Report"
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													)}
												</a>
											);
										})()}
									</div>
								)}



								{selectedInspection.selfieContractor && (
									<div className="image-gallery">
										<h4>Contractor Selfie</h4>
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
								)}


								{selectedInspection.imagesUploadedByContractor && (
									<div className="image-gallery">
										<h4>Site Images By Contractor</h4>
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
								)}



								{selectedInspection.contractorEnclosureFilePaths && (
									<div className="image-gallery">
										<h4>Enclosures Uploaded By Contractor</h4>
										{selectedInspection.contractorEnclosureFilePaths.split(',').map((rawPath, idx) => {
											const path = rawPath.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;
											const extension = getExtension(path); // assuming this returns 'pdf', 'jpg', etc.

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
													{extension === 'pdf' ? (
														<embed
															src={fileUrl}
															type="application/pdf"
															width="100%"
															height="500px"
															className="preview-pdf"
														/>
													) : (
														<img
															src={fileUrl}
															alt={`Enclosure ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													)}
												</a>
											);
										})}
									</div>
								)}


								{selectedInspection.testInsiteLabContractor && selectedInspection.testSiteDocumentsContractor && (
									<div className="image-gallery">
										<h4>Test Report Uploaded By Contractor</h4>

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
															className="preview-pdf"
														/>
													) : (
														<img
															src={fileUrl}
															alt="Test Report"
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													)}
												</a>
											);
										})()}
									</div>
								)}







								{selectedInspection.contractorSignature && (
									<div className="image-gallery">
										<h4>Contractor Signature</h4>
										{selectedInspection.contractorSignature.split(',').map((img, idx) => {
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
								)}


								{selectedInspection.gcMrvcSignature && (
									<div className="image-gallery">
										<h4>GC/MRVC Signature</h4>
										{selectedInspection.gcMrvcSignature.split(',').map((img, idx) => {
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