import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from "react-dom";
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import Select from 'react-select';
import './RfiLogList.css';
import HeaderRight from '../HeaderRight/HeaderRight';
import jsPDF from 'jspdf';

export default function RfiLogList() {
	const [data, setData] = useState([]);
	const [message, setMessage] = useState('');
	const [projectOptions, setProjectOptions] = useState([]);
	const [projectIdMap, setProjectIdMap] = useState({});
	const [workOptions, setWorkOptions] = useState([]);
	const [workIdMap, setWorkIdMap] = useState({});
	const [contractOptions, setContractOptions] = useState([]);
	const [contractIdMap, setContractIdMap] = useState({});
	const [formState, setFormState] = useState({ project: '', work: '', contract: '' });
	const [allData, setAllData] = useState([]);
	const [selectedInspection, setSelectedInspection] = useState(null);
	const [checklistItems, setChecklistItems] = useState([]);
	const [enclosures, setEnclosures] = useState([]);
	const [statusList, setStatusList] = useState([]);
	const [Measurement, setMeasurement] = useState([]);
	const [remarksList, setRemarksList] = useState([]);

	const getExtension = (filename) => {
		return filename?.split('.').pop()?.toLowerCase();
	};

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	useEffect(() => {
		axios.get(`${API_BASE_URL}api/rfiLog/getAllRfiLogDetails`, { withCredentials: true })
			.then(response => {
				if (response.status === 204 || !response.data || response.data.length === 0) {
					setAllData([]);
					setData([]);
					setMessage('No RFIs found.');
				} else {
					setAllData(response.data);
					setData(response.data);
					setMessage('');
				}
			})
			.catch(() => {
				setMessage('Error loading RFI data.');
			});
	}, []);



	useEffect(() => {
		axios.get(`${API_BASE_URL}rfi/projectNames`)
			.then(response => {
				const map = {};
				const options = response.data.map(p => {
					map[p.projectName] = p.projectId;
					return { value: p.projectName, label: p.projectName };
				});
				setProjectOptions(options);
				setProjectIdMap(map);
			});
	}, []);

	useEffect(() => {
		const { project, work, contract } = formState;

		const filtered = allData.filter(item => {
			const matchProject = project ? item.project === project : true;
			const matchWork = work ? item.work === work : true;
			const matchContract = contract ? item.contract === contract : true;
			return matchProject && matchWork && matchContract;
		});

		setData(filtered);

		if (filtered.length === 0) {
			setMessage('No RFIs match the selected filters.');
		} else {
			setMessage('');
		}
	}, [formState, allData]);


	const processedData = useMemo(
		() =>
			data.map(row => {
				let displayStatus = '';
				let color = '';

				if (row.enggApproval === 'Rejected') {
					displayStatus = 'Rejected';
					color = 'red';
				} else if (row.status === 'INSPECTION_DONE') {
					displayStatus = 'Closed';
					color = 'blue';
				} else {
					displayStatus = 'Open';
					color = 'green';
				}

				return {
					...row,
					displayStatus,
					displayColor: color, // optional: for styling in table cell
				};
			}),
		[data]
	);


	const NotesCell = ({ value }) => {
		const [showPopup, setShowPopup] = useState(false);

		if (!value) return null;

		const modalContent = (
			<div className="popup-modal-rfi-loglist bg-black bg-opacity-50 z-50">
				<div className="popup-modal-inner bg-white rounded-xl shadow-lg p-4 max-w-md w-full">
					<h2 className="text-lg font-semibold mb-2">Notes</h2>
					<p className="text-gray-700 whitespace-pre-wrap ">{value}</p>
					<div className='d-flex justify-content-end'>
						<button
							onClick={() => setShowPopup(false)}
							className="btn btn-white"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
		return (
			<>
				{value.length > 30 ? (
					<>
						<button
							onClick={() => setShowPopup(true)}
							className="text-blue-600 underline"
						>
							👁️
						</button>
						{showPopup &&
							ReactDOM.createPortal(
								modalContent,
								document.querySelector(".dashboard")
							)}
					</>
				) : (
					<span>{value}</span>
				)}
			</>
		);
	};

	const handlePrint = () => {
		window.print();
	};


	const getFilename = (path) => path?.split('\\').pop().replace(/^"|"$/g, '');
	const fileBaseURL = `${API_BASE_URL}api/rfiLog/previewFiles`;

	const safe = (val) => val || '-';
	const toBase64 = async (url) => {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		});
	};

	const isPdfFile = (file) => {
		return typeof file === 'string' && file.toLowerCase().endsWith('.pdf');
	};

	const externalPdfBlobs = [];

	async function mergeWithExternalPdfs(jsPDFDoc) {
		const mainPdfBytes = jsPDFDoc.output('arraybuffer');
		const mainPdf = await PDFDocument.load(mainPdfBytes);

		for (const fileBlob of externalPdfBlobs) {
			const externalPDF = await PDFDocument.load(await fileBlob.arrayBuffer());
			const pages = await mainPdf.copyPages(externalPDF, externalPDF.getPageIndices());
			pages.forEach((page) => mainPdf.addPage(page));
		}

		const mergedPdfBytes = await mainPdf.save();
		return new Blob([mergedPdfBytes], { type: 'application/pdf' });
	}

	const generatePDF = async (inspectionList, checklistItems, enclosures, measurements) => {
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
		const safe = (val) => val || '---';
		const logoUrl = 'https://www.manabadi.com/wp-content/uploads/2016/11/4649MRVC.jpg';
		const logo = await toBase64(logoUrl);
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 10;
		const contentWidth = pageWidth - 2 * margin;
		const imageWidth = 120
		const imageHeight = 100;
		const lineHeight = 6;

		let rfiName = null;


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

			const fields = [
				['Consultant', inspection.consultant ?? "N/A"],
				['RFI ID', inspection.rfiId ?? "N/A"],
				['Date of Submission', inspection.dateOfCreation ?? "N/A"],
				['Project', inspection.project ?? "N/A"],
				['Work', inspection.work ?? "N/A"],
				['Contract', inspection.contract ?? "N/A"],
				['Contract ID', inspection.contractId ?? "N/A"],
				['Structure Type', inspection.structureType ?? "N/A"],
				['Structure', inspection.structure ?? "N/A"],
				['Component', inspection.component ?? "N/A"],
				['Element', inspection.element ?? "N/A"],
				['Activity', inspection.activity ?? "N/A"],
				['RFI Description', inspection.rfiDescription ?? "N/A"],
				['Type of RFI', inspection.typeOfRfi ?? "N/A"],
				['Enclosures', inspection.enclosures ?? "N/A"],
				['Contractor', inspection.contractor ?? "N/A"],
				["Contractor's Representative", inspection.contractorRepresentative ?? "N/A"],
				['Client Representative', inspection.clientRepresentative ?? "N/A"],
				['Contractor Inspected Date', inspection.conInspDate ?? "N/A"],
				['Proposed Inspection Date', inspection.proposedDateOfInspection ?? "N/A"],
				['Actual Inspection Date', inspection.actualDateOfInspection ?? "N/A"],
				['Proposed Time', inspection.proposedInspectionTime ?? "N/A"],
				['Actual Time', inspection.actualInspectionTime ?? "N/A"],
				['Chainage', inspection.chainage ?? "N/A"],
				['Description', inspection.descriptionByContractor ?? "N/A"],
				['Contractor Location', inspection.conLocation ?? "N/A"],
				['Client Location', inspection.clientLocation ?? "N/A"],
				['Inspection Test Type', inspection.typeOfTest ?? "N/A"],
				['Test Approval By Inspector', inspection.testStatus ?? "N/A"],
				['DyHod', inspection.dyHodUserName ?? "N/A"]
			].map(([lable, value]) => [lable, value ?? "N/A"]);
			doc.autoTable({
				startY: y,
				body: fields,
				styles: { fontSize: 9 },
				theme: "plain",
				columnStyles: { 0: { fontStyle: "bold" } }
			});
			ensureSpace(lineHeight);
			y = doc.lastAutoTable.finalY + 5;

			if (inspection.engineerRemarks) {
				doc.setFont(undefined, "bold").setFontSize(11).text("Engineer Remarks:", margin, y);
				const remarksLines = doc.splitTextToSize(inspection.engineerRemarks, doc.internal.pageSize.getWidth() - 2 * margin);
				doc.setFont(undefined, "normal").setFontSize(11).text(remarksLines, margin, y + lineHeight);
				y += remarksLines.length * lineHeight + 10;
			}
			if (measurements && (Array.isArray(measurements) ? measurements.length > 0 : true)) {
				const measurementArray = Array.isArray(measurements) ? measurements : [measurements];

				y += 10;
				doc.setFont(undefined, "bold").setFontSize(12);
				doc.text("Measurement Details", pageWidth / 2, y, { align: "center" });

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

			doc.setFont(undefined, "bold").setFontSize(11).text("Status:", margin + 10, y);
			doc.setFont(undefined, "normal").setFontSize(11).text(
				safe(inspection.validationStatus),
				margin + 30,
				y
			);
			y += lineHeight;

			doc.setFont(undefined, "bold").setFontSize(11).text("Remarks:", margin + 10, y);
			const remarksLines = doc.splitTextToSize(safe(inspection.remarks), 160);
			doc.setFont(undefined, "normal").setFontSize(11).text(remarksLines, margin + 30, y);
			y += remarksLines.length * lineHeight;

			doc.setFont(undefined, "bold").setFontSize(11).text("Comments:", margin + 10, y);
			const commentsLines = doc.splitTextToSize(safe(inspection.validationComments), 160); // wrap long lines
			doc.setFont(undefined, "normal").setFontSize(11).text(commentsLines, margin + 35, y);
			y += commentsLines.length * lineHeight;


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
					const extension = file.split('.').pop().toLowerCase();
					const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;

					if (extension === 'pdf') {
						const response = await fetch(fileUrl);
						if (response.ok) {
							const blob = await response.blob();
							externalPdfBlobs.push(blob);
						}
					} else {
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

							doc.addImage(imgData, 'JPEG', imgX, yPos, imageWidth, imageHeight);
							yPos += imageHeight + 5;
						} else {
							doc.setDrawColor(0);
							doc.setLineWidth(0.2);

							let rectX = margin;
							if (align === "center") {
								rectX = (pageWidth - imageWidth) / 2;
							}

							doc.rect(rectX, yPos, imageWidth, imageHeight);
							doc.text('Image not available', rectX + 3, yPos + 20);
							yPos += imageHeight + 5;
						}
					}
				}
				y = yPos;
			};

			ensureSpace(lineHeight);

			const handlePdfOrImage = async (label, filePaths) => {
				if (!filePaths) return;

				const files = filePaths.split(",").map(f => f.trim()).filter(Boolean);
				if (!files.length) return;

				for (const file of files) {
					const extension = file.split(".").pop().toLowerCase();
					const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;

					if (extension === "pdf") {
						const response = await fetch(fileUrl);
						if (response.ok) {
							const blob = await response.blob();
							externalPdfBlobs.push(blob);
						}
					} else {
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
				}
			};


			ensureSpace(lineHeight);
			await imageSection('Inspector Selfie', inspection.selfieClient, margin, y, { align: "center" });
			y += 10;

			ensureSpace(lineHeight);
			await imageSection('Inspector Site Images', inspection.imagesUploadedByClient, margin, y, { align: "center" });
			y += 15;

			ensureSpace(lineHeight);
			await imageSection('Contractor Selfie', inspection.selfieContractor, margin, y, { align: "center" });
			y += 10;

			ensureSpace(lineHeight);
			await imageSection('Contractor Site Images', inspection.imagesUploadedByContractor, margin, y, { align: "center" });
			y += 15;

			ensureSpace(lineHeight);
			if (enclosures && enclosures.length > 0) {
				for (const enc of enclosures) {
					await handlePdfOrImage(enc.enclosureName, enc.file);
				}
			}
			ensureSpace(lineHeight);
			await handlePdfOrImage('Test Report', inspection.testSiteDocumentsContractor);

		}

		const mergedBlob = await mergeWithExternalPdfs(doc);
		const link = document.createElement('a');
		link.href = URL.createObjectURL(mergedBlob);
		if (rfiName) {
			link.download = `${rfiName}_RfiReport.pdf`;
		}
		link.click();
	};



	const fetchPreview = (rfiId) => {
		axios.get(`${API_BASE_URL}api/rfiLog/getRfiReportDetails/${rfiId}`)
			.then((res) => {
				const data = res.data;
				setSelectedInspection(data.reportDetails);
				setChecklistItems(data.checklistItems);
				setEnclosures(data.enclosures);
				setMeasurement(data.measurementDetails);
			})
			.catch((err) => console.error(err));
	};

	/*	const downloadPDFWithDetails = async (rfiId, idx) => {
			try {
				const res = await axios.get(`${API_BASE_URL}api/rfiLog/getRfiReportDetails/${rfiId}`);
	
				if (res.data?.reportDetails) {
					const inspection = res.data.reportDetails;
	
					inspection.remarks = remarksList[idx] || '';
					inspection.status = statusList[idx] || '';
	
					await generatePDF(
						[inspection],
						res.data.checklistItems || [],
						res.data.enclosures || [],
						res.data.measurementDetails ? [res.data.measurementDetails] : []
					);
	
				} else {
					alert("No inspection details found.");
				}
			} catch (err) {
				console.error("Error fetching details for PDF:", err);
				alert("Failed to generate PDF. Please try again.");
			}
		};*/


	const downloadPDF = async (rfiId, txnId) => {
		try {
			const response = await fetch(`${API_BASE_URL}api/rfiLog/pdf/download/${rfiId}/${txnId}`);
			if (!response.ok) throw new Error("File not found");

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = `${rfiId}_Details_Pdf.pdf`;
			a.click();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			alert(err.message);
		}
	};





	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfiId' },
		{ Header: 'RFI Date', accessor: 'dateOfSubmission' },
		{ Header: 'RFI Description', accessor: 'rfiDescription' },
		{ Header: 'Assigned Contractor', accessor: 'nameOfRepresentative' },
		{ Header: 'RFI Requested By', accessor: 'rfiRequestedBy' },
		{
			Header: 'RFI Sent To',
			columns: [
				{ Header: 'Department', accessor: 'department' },
				{ Header: 'Person', accessor: 'person' }
			]
		},
		{ Header: 'Date Raised', accessor: 'dateRaised' },
		{ Header: 'Date Responded', accessor: 'dateResponded' },
		{
			Header: 'Status',
			accessor: 'displayStatus',
			Cell: ({ row }) => (
				<span style={{ color: row.original.displayColor }}>
					{row.original.displayStatus}
				</span>
			),
		},
		{
			Header: "Notes",
			accessor: "notes",
			Cell: ({ value }) => <NotesCell value={value} />
		},
		{
			Header: 'View',
			columns: [
				{
					Header: 'Preview',
					Cell: ({ row }) => (
						<button onClick={() => fetchPreview(row.original.id)}>
							👁️
						</button>
					)
				},
				{
					Header: 'Download',
					Cell: ({ row }) =>
						(row.original.txnId &&
							(row.original.estatus === 'CON_SUCCESS' || row.original.estatus === 'ENGG_SUCCESS')) ? (
							<button onClick={() => downloadPDF(row.original.rfiId, row.original.txnId, row.index)}>
								⬇️
							</button>
						) : null
				}
			]
		}

	], []);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		prepareRow,
		nextPage,
		previousPage,
		canNextPage,
		canPreviousPage,
		pageOptions,
		state,
		setGlobalFilter,
		setPageSize
	} = useTable(
		{ columns, data: processedData, initialState: { pageSize: 5 } },
		useGlobalFilter,
		usePagination
	);

	const { pageIndex, pageSize, globalFilter } = state;

	return (
		<div className="dashboard">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-table-container">
						<h2 className="section-heading">REQUEST FOR INSPECTION LOG-(RFI LOG)</h2>

						<div className="filters">
							<div className="form-row">
								<div className="form-fields flex-2">
									<label>Project:</label>
									<Select
										options={projectOptions}
										value={formState.project ? { value: formState.project, label: formState.project } : null}
										onChange={(selected) => {
											const project = selected?.value || '';
											const projectId = projectIdMap[project] || '';
											setFormState({ project, work: '', contract: '' });

											if (projectId) {
												axios.get(`${API_BASE_URL}rfi/workNames`, { params: { projectId } })
													.then(res => {
														const map = {};
														const opts = res.data.map(w => {
															map[w.workName] = w.workId;
															return { value: w.workName, label: w.workName };
														});
														setWorkOptions(opts);
														setWorkIdMap(map);
													});
											}
										}}
									/>
								</div>

								<div className="form-fields flex-2">
									<label>Work:</label>
									<Select
										options={workOptions}
										value={formState.work ? workOptions.find(w => w.value === formState.work) : null}
										onChange={(selected) => {
											const work = selected?.value || '';
											const workId = workIdMap[work] || '';
											setFormState(prev => ({ ...prev, work, contract: '' }));

											if (workId) {
												axios.get(`${API_BASE_URL}rfi/contractNames`, { params: { workId } })
													.then(res => {
														const map = {};
														const opts = res.data.map(c => {
															map[c.contractShortName] = c.contractIdFk.trim();
															return { value: c.contractShortName, label: c.contractShortName };
														});
														setContractOptions(opts);
														setContractIdMap(map);
													});
											}
										}}
									/>
								</div>

								<div className="form-fields flex-2">
									<label>Contract:</label>
									<Select
										options={contractOptions}
										value={formState.contract ? contractOptions.find(c => c.value === formState.contract) : null}
										onChange={(selected) => {
											const contract = selected?.value || '';
											setFormState(prev => ({ ...prev, contract }));
										}}
									/>
								</div>

							</div>
						</div>


						<div className="table-top-bar d-flex justify-content-between align-items-center">
							<div className="left-controls">
								<label>
									Show{' '}
									<select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
										{[5, 10, 20, 50].map(size => (
											<option key={size} value={size}>{size}</option>
										))}
									</select>{' '}
									entries
								</label>
							</div>
							<div className="right-controls">
								<input
									className="search-input"
									value={globalFilter || ''}
									onChange={e => setGlobalFilter(e.target.value)}
									placeholder="Search RFI..."
								/>
							</div>
							<div className="reset-button-wrapper">
								<button
									className="reset-button"
									onClick={() => {
										setFormState({ project: '', work: '', contract: '' });
										setWorkOptions([]);
										setContractOptions([]);
										axios.get(`${API_BASE_URL}api/rfiLog/getAllRfiLogDetails`, { withCredentials: true })
											.then(response => {
												if (response.status === 204 || !response.data || response.data.length === 0) {
													setData([]);
													setMessage('No RFIs found.');
												} else {
													setData(response.data);
													setMessage('');
												}
											})
											.catch(() => {
												setMessage('Error loading RFI data.');
											});
									}}
								>
									Reset Filters
								</button>
							</div>

						</div>


						<div className="table-scroll-wrapper">
							<table {...getTableProps()} className="validation-table datatable" border={1}>
								<thead>
									{headerGroups.map((group, i) => (
										<tr {...group.getHeaderGroupProps()} key={i}>
											{group.headers.map((column, idx) => (
												<th {...column.getHeaderProps()} key={idx}>{column.render('Header')}</th>
											))}
										</tr>
									))}
								</thead>
								<tbody {...getTableBodyProps()}>
									{message ? (
										<tr>
											<td colSpan={columns.length} className="message-cell">{message}</td>
										</tr>
									) : (
										page.map((row, i) => {
											prepareRow(row);
											return (
												<tr {...row.getRowProps()} key={i}>
													{row.cells.map((cell, idx) => (
														<td {...cell.getCellProps()} key={idx}>{cell.render('Cell')}</td>
													))}
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
						{selectedInspection && (
							<div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
								<div className="popup-content" onClick={(e) => e.stopPropagation()}>
									<h3>RFI Details Preview</h3>
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
												color: selectedInspection.testStatus === "Rejected"
													? "red"
													: selectedInspection.rfiStatus === "INSPECTION_DONE"
														? "blue"
														: "green",
												fontWeight: "bold",
											}}>
												{selectedInspection.testStatus === "Rejected"
													? "Rejected"
													: selectedInspection.rfiStatus === "INSPECTION_DONE"
														? "Closed"
														: "Active"}
											</p>
										</div>
									</div>


									<div className="form-row align-start">

										<div className="form-fields">
											<label>Consultant:</label>
											<p>N/A</p>
										</div>


										<div className="form-fields">
											<label>RFI ID:</label>
											<p>{selectedInspection.rfiId}</p>
										</div>

										<div className="form-fields">
											<label>Date of Submission:</label>
											<p>{selectedInspection.dateOfCreation}</p>
										</div>


										<div className="form-fields">
											<label>Project:</label>
											<p>{selectedInspection.project}</p>
										</div>
										<div className="form-fields">
											<label>Work:</label>
											<p>{selectedInspection.work}</p>
										</div>

										<div className="form-fields">
											<label>Contract:</label>
											<p>{selectedInspection.contract}</p>
										</div>

										<div className="form-fields">
											<label>Contract ID:</label>
											<p>{selectedInspection.contractId}</p>
										</div>

										<div className="form-fields">
											<label>Structure Type:</label>
											<p>{selectedInspection.structureType}</p>
										</div>
										<div className="form-fields">
											<label>Structure:</label>
											<p>{selectedInspection.structure}</p>
										</div>

										<div className="form-fields">
											<label>Component:</label>
											<p>{selectedInspection.component}</p>
										</div>
										<div className="form-fields">
											<label>Element:</label>
											<p>{selectedInspection.element}</p>
										</div>
										<div className="form-fields">
											<label>Activity:</label>
											<p>{selectedInspection.activity}</p>
										</div>

										<div className="form-fields">
											<label>Rfi Description:</label>
											<p>{selectedInspection.rfiDescription}</p>
										</div>

										<div className="form-fields">
											<label>Type of Rfi:</label>
											<p>{selectedInspection.typeOfRfi}</p>
										</div>


										<div className="form-fields">
											<label>Enclosures:</label>
											<p>{selectedInspection.enclosures}</p>
										</div>

										<div className="form-fields">
											<label>Contractor:</label>
											<p>{selectedInspection.contractor}</p>
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
											<label>Contractor Inspected Date:</label>
											<p>{selectedInspection.conInspDate}</p>
										</div>

										<div className="form-fields">
											<label>Proposed Inspection Date:</label>
											<p>{selectedInspection.proposedDateOfInspection}</p>
										</div>

										<div className="form-fields">
											<label>Actual Inspection Date:</label>
											<p>{selectedInspection.actualDateOfInspection}</p>
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
											<label>Chainage:</label>
											<p>{selectedInspection.chainage}</p>
										</div>

										<div className="form-fields">
											<label>Description:</label>
											<p>{selectedInspection.descriptionByContractor}</p>
										</div>


										<div className="form-fields">
											<label>Contractor Location:</label>
											<p>{selectedInspection.conLocation}</p>
										</div>
										<div className="form-fields">
											<label>Client Location:</label>
											<p>{selectedInspection.conLocation}</p>
										</div>


										<div className="form-fields">
											<label>Inspection Test Type:</label>
											<p>{selectedInspection.typeOfTest}</p>
										</div>

										<div className="form-fields">
											<label>Test Report Approval By Inspector:</label>
											<p>{selectedInspection.testStatus}</p>
										</div>
										<div className="form-fields">
											<label>DyHod:</label>
											<p>{selectedInspection.dyHodUserName}</p>
										</div>

										{selectedInspection.engineerRemarks && (
											<div className="form-fields">
												<label>Engineer Remarks:</label>
												<p>{selectedInspection.engineerRemarks}</p>
											</div>
										)}





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
														<td>{Measurement.measurementType ?? "---"}</td>
														<td>{Measurement.l ?? "---"}</td>
														<td>{Measurement.b ?? "---"}</td>
														<td>{Measurement.h ?? "---"}</td>
														<td>{Measurement.no ?? "---"}</td>
														<td>{Measurement.totalQty ?? "---"}</td>
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
										<h3>Validation Status & Remarks</h3>
										<p><strong> Status:</strong> {selectedInspection.validationStatus || '---'}</p>
										<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>
										{selectedInspection.validationComments !== null &&
											<p><strong>Comments:</strong> {selectedInspection.validationComments || '---'}</p>}

									</div>
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


									<div className="popup-actions">
										<button onClick={() => setSelectedInspection(null)}>Close</button>
										<button onClick={handlePrint}>Print</button>
									</div>
								</div>
							</div>
						)}

						<div className="pagination-bar">
							<span>
								Showing {pageIndex * pageSize + 1} to{' '}
								{Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length} entries
							</span>
							<button onClick={() => previousPage()} disabled={!canPreviousPage}>&lt; Prev</button>
							<span>Page <strong>{pageIndex + 1} of {pageOptions.length}</strong></span>
							<button onClick={() => nextPage()} disabled={!canNextPage}>Next &gt;</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
