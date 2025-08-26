import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import CameraCapture from '../CameraCapture/CameraCapture';
import './InspectionForm.css';

//const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();

const initialChecklist = [
  { id: 1, description: 'Drawing Approved and available', status: '', contractorRemark: '', aeRemark: '' },
  { id: 2, description: 'Shuttering aligned and dimensionally correct', status: '', contractorRemark: '', aeRemark: '' },
  { id: 3, description: 'Cleaning of shuttering and application of shuttering oil is OK', status: '', contractorRemark: '', aeRemark: '' },
  { id: 4, description: 'Joint packing of shutter joint has been done', status: '', contractorRemark: '', aeRemark: '' },
  { id: 5, description: 'Bar bending schedule approved and available', status: '', contractorRemark: '', aeRemark: '' },
  { id: 6, description: 'Adequate cover block, chairs and spacer are provided', status: '', contractorRemark: '', aeRemark: '' },
  { id: 7, description: 'Alignment and binding of reinforcement is satisfactory & as per drawing', status: '', contractorRemark: '', aeRemark: '' },
  { id: 8, description: 'Access and walkway for checking is available', status: '', contractorRemark: '', aeRemark: '' },
  { id: 9, description: 'Mix design is approved', status: '', contractorRemark: '', aeRemark: '' },
  { id: 10, description: 'Sufficient vibrators and needles are available in running condition', status: '', contractorRemark: '', aeRemark: '' },
  { id: 11, description: 'Adequate props or supports provided', status: '', contractorRemark: '', aeRemark: '' },
  { id: 12, description: 'Level pegs has been fixed for concrete top finishing if required', status: '', contractorRemark: '', aeRemark: '' },
  { id: 13, description: 'Concrete pump/boom placer is available if required', status: '', contractorRemark: '', aeRemark: '' },
  { id: 14, description: 'DG and lighting arrangement is available if required', status: '', contractorRemark: '', aeRemark: '' },
  { id: 15, description: 'Curing arrangements are made', status: '', contractorRemark: '', aeRemark: '' },
  { id: 16, description: 'Proper approach for transit mixer is available', status: '', contractorRemark: '', aeRemark: '' },
  { id: 17, description: "Adequate PPE's provided", status: '', contractorRemark: '', aeRemark: '' }
];  

export default function InspectionForm() {
  const location = useLocation();
  const id = location.state?.rfi;
  const skipSelfie = location.state?.skipSelfie;
  const [step, setStep] = useState(skipSelfie ? 2 : 1);
  const [rfiData, setRfiData] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [contractorRep, setContractorRep] = useState('');
  const [selfieImage, setSelfieImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([null, null, null, null]);

  const [enclosureStates, setEnclosureStates] = useState({});
  const [checklistPopup, setChecklistPopup] = useState(null);
  const [uploadPopup, setUploadPopup] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('environment');
  const [gradeOfConcrete, setGradeOfConcrete] = useState('');
  const [chainage, setChainage] = useState('');
  const [inspectionStatus, setInspectionStatus] = useState('');
  const [testInLab, setTestInLab] = useState(null);
  const [inspectionId, setInspectionId] = useState(null);
  const [testReportFile, setTestReportFile] = useState(null);
  const [dateOfInspection, setDateOfInspection] = useState('');
  const [timeOfInspection, setTimeOfInspection] = useState('');
  const [enclosuresData, setEnclosuresData] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
  const selfieRef = useRef(null);
  const firstGalleryRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetch(`${API_BASE_URL}rfi/rfi-details/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setRfiData(data);
          setContractorRep(data.nameOfRepresentative || '');
          if (data.enclosures) {
            const enclosuresArr = Array.isArray(data.enclosures)
              ? data.enclosures
              : data.enclosures.split(",").map(enc => enc.trim());

            const formatted = enclosuresArr.map((enc, index) => ({
              id: `${data.id}-${index}`,
              rfiDescription: data.rfiDescription,
              enclosure: enc
            }));

            setEnclosuresData(formatted);
          }

          if (Array.isArray(data.inspectionDetails) && data.inspectionDetails.length > 0) {
            const latestInspection = data.inspectionDetails.reduce((latest, current) =>
              current.id > latest.id ? current : latest
            );
            setInspectionId(latestInspection.id);
          } else {
            const savedId = localStorage.getItem("latestInspectionId");
            if (savedId) {
              setInspectionId(parseInt(savedId));
            }
          }
        })
        .catch(err => console.error("Error fetching RFI details:", err));
    }
  }, [id, API_BASE_URL]);

  useEffect(() => {
    const now = new Date();
    setDateOfInspection(now.toISOString().split("T")[0]);
    setTimeOfInspection(now.toTimeString().split(" ")[0].slice(0, 5));
  }, []);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setLocationText(data.display_name || `Lat: ${lat}, Lng: ${lng}`);
          } catch {
            setLocationText(`Lat: ${lat}, Lng: ${lng}`);
          }
        },
        () => setLocationText('Location access denied')
      );
    }
  };

  function dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleChecklistSubmit = async (id, data, grade) => {
    const enclosure = enclosuresData.find(e => e.id === id)?.enclosure || '';
    const dto = {
      rfiId: rfiData.id,
      enclosureName: enclosure,
      gradeOfConcrete: grade,
      drawingApproved: data[0]?.status,
      drawingRemarkContractor: data[0]?.contractorRemark,
      drawingRemarkAE: data[0]?.aeRemark,
      alignmentOk: data[1]?.status,
      alignmentRemarkContractor: data[1]?.contractorRemark,
      alignmentRemarkAE: data[1]?.aeRemark,
      cleaningOk: data[2]?.status || "",
      cleaningRemarkContractor: data[2]?.contractorRemark || "",
      cleaningRemarkEngineer: data[2]?.aeRemark || "",
      jointPacking: data[3]?.status || "",
      jointPackingRemarkContractor: data[3]?.contractorRemark || "",
      jointPackingRemarkEngineer: data[3]?.aeRemark || "",
      barBendingApproved: data[4]?.status || "",
      barBendingRemarkContractor: data[4]?.contractorRemark || "",
      barBendingRemarkEngineer: data[4]?.aeRemark || "",
      coverBlockProvided: data[5]?.status || "",
      coverBlockRemarkContractor: data[5]?.contractorRemark || "",
      coverBlockRemarkEngineer: data[5]?.aeRemark || "",
      reinforcementAlignment: data[6]?.status || "",
      reinforcementRemarkContractor: data[6]?.contractorRemark || "",
      reinforcementRemarkEngineer: data[6]?.aeRemark || "",
      walkwayAvailable: data[7]?.status || "",
      walkwayRemarkContractor: data[7]?.contractorRemark || "",
      walkwayRemarkEngineer: data[7]?.aeRemark || "",
      mixDesignApproved: data[8]?.status || "",
      mixDesignRemarkContractor: data[8]?.contractorRemark || "",
      mixDesignRemarkEngineer: data[8]?.aeRemark || "",
      vibratorsAvailable: data[9]?.status || "",
      vibratorsRemarkContractor: data[9]?.contractorRemark || "",
      vibratorsRemarkEngineer: data[9]?.aeRemark || "",
      propsProvided: data[10]?.status || "",
      propsRemarkContractor: data[10]?.contractorRemark || "",
      propsRemarkEngineer: data[10]?.aeRemark || "",
      levelPegsFixed: data[11]?.status || "",
      levelPegsRemarkContractor: data[11]?.contractorRemark || "",
      levelPegsRemarkEngineer: data[11]?.aeRemark || "",
      concretePumpAvailable: data[12]?.status || "",
      concretePumpRemarkContractor: data[12]?.contractorRemark || "",
      concretePumpRemarkEngineer: data[12]?.aeRemark || "",
      dgLightingAvailable: data[13]?.status || "",
      dgLightingRemarkContractor: data[13]?.contractorRemark || "",
      dgLightingRemarkEngineer: data[13]?.aeRemark || "",
      curingArrangements: data[14]?.status || "",
      curingRemarkContractor: data[14]?.contractorRemark || "",
      curingRemarkEngineer: data[14]?.aeRemark || "",
      transitMixerApproach: data[15]?.status || "",
      transitMixerRemarkContractor: data[15]?.contractorRemark || "",
      transitMixerRemarkEngineer: data[15]?.aeRemark || "",
      ppeProvided: data[16]?.status || "",
      ppeRemarkContractor: data[16]?.contractorRemark || "",
      ppeRemarkEngineer: data[16]?.aeRemark || "",
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(dto));

    try {
      const res = await fetch(`${API_BASE_URL}rfi/save`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const text = await res.text();
      if (!res.ok) {
        alert(`Checklist save failed: ${res.status} - ${text}`);
        return;
      }

      setEnclosureStates(prev => ({
        ...prev,
        [id]: {
          checklist: data,
          gradeOfConcrete: grade,
          checklistDone: true,
        }
      }));
      setChecklistPopup(null);
    } catch (err) {
      console.error("Checklist save failed:", err);
      alert("Checklist save failed: " + err.message);
    }
  };

  const handleSubmitConfirmed = async () => {
    const formData = new FormData();
    const id = inspectionId ?? parseInt(localStorage.getItem("latestInspectionId"));
    const payload = {
      inspectionId: id,
      rfiId: rfiData.id,
      inspectionStatus: inspectionStatus || null,
      testInsiteLab: testInLab || null,
    };
    formData.append("data", JSON.stringify(payload));
    if (testReportFile) {
      formData.append("testReport", testReportFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}rfi/inspection/submit`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert(`❌ Failed to submit inspection: ${errorText}`);
        return;
      }

      const message = await res.text();
      alert(message);
      localStorage.removeItem("latestInspectionId");
      window.location.href = `${window.location.origin}/rfiSystem/Inspection`;
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Error: " + err.message);
    }
  };

  const handleUploadSubmit = async (id, file) => {
    const enclosure = enclosuresData.find(e => e.id === id)?.enclosure || '';
    const formData = new FormData();

    formData.append('rfiId', rfiData.id);
    formData.append('file', file);
    formData.append('enclosureName', enclosure);

    try {
      const res = await fetch(`${API_BASE_URL}rfi/upload`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Upload failed:", text);
        alert(`Upload failed: ${text}`);
        return;
      }
      setEnclosureStates(prev => ({ ...prev, [id]: { ...prev[id], uploadedFile: file } }));
      setUploadPopup(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Checklist save failed: " + err.message);
    }
  };

  const handleSaveInspection = async () => {
    if (!selfieImage) {
      alert('❌ Selfie image is required.');
      selfieRef.current?.focus();
      return;
    }
    const hasGallery = Object.values(galleryImages).some((img) => img);
    if (!hasGallery) {
      alert('❌ At least one site image is required.');
      firstGalleryRef.current?.focus();
      return;
    }
    const formData = new FormData();
    const inspectionPayload = {
      rfiId: rfiData.id,
      location: locationText,
      chainage: chainage,
      nameOfRepresentative: contractorRep
    };

    formData.append('data', JSON.stringify(inspectionPayload));

    if (selfieImage) {
      if (selfieImage instanceof File) {
        formData.append('selfie', selfieImage);
      } else if (typeof selfieImage === 'string' && selfieImage.startsWith('data:image/')) {
        const selfieFile = dataURLtoFile(selfieImage, 'selfie.jpg');
        formData.append('selfie', selfieFile);
      }
    }

    galleryImages.forEach((img, index) => {
      if (img instanceof File) {
        formData.append('siteImages', img);
      } else if (typeof img === 'string' && img.startsWith('data:image/')) {
        const converted = dataURLtoFile(img, `siteImage${index + 1}.jpg`);
        formData.append('siteImages', converted);
      }
    });

    try {
      const res = await fetch(`${API_BASE_URL}rfi/start`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      });
      const idText = await res.text();
      const id = parseInt(idText);
      setInspectionId(id);
      localStorage.setItem("latestInspectionId", id);

      alert("Inspection saved successfully. ID: " + id);
    } catch (err) {
      console.error("Inspection save failed:", err);
      alert(`❌ Inspection save failed: ${err.message}`);
    }
  };

  const fetchChecklistData = async (rfiId, enclosureName) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}rfi/getChecklist?rfiId=${rfiId}&enclosureName=${encodeURIComponent(enclosureName)}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Checklist fetch failed: ${res.status}`);

      const flat = await res.json();

      const checklist = [
        { id: 1, description: "Drawing Approved and available", status: flat.drawingApproved, contractorRemark: flat.drawingRemarkContractor, aeRemark: flat.drawingRemarkAE },
        { id: 2, description: "Shuttering aligned and dimensionally correct", status: flat.alignmentOk, contractorRemark: flat.alignmentRemarkContractor, aeRemark: flat.alignmentRemarkAE },
        { id: 3, description: 'Cleaning of shuttering and application of shuttering oil is OK', status: flat.cleaningOk, contractorRemark: flat.cleaningRemarkContractor, aeRemark: flat.cleaningRemarkEngineer },
        { id: 4, description: 'Joint packing of shutter joint has been done', status: flat.jointPacking, contractorRemark: flat.jointPackingRemarkContractor, aeRemark: flat.jointPackingRemarkEngineer },
        { id: 5, description: 'Bar bending schedule approved and available', status: flat.barBendingApproved, contractorRemark: flat.barBendingRemarkContractor, aeRemark: flat.barBendingRemarkEngineer },
        { id: 6, description: 'Adequate cover block, chairs and spacer are provided', status: flat.coverBlockProvided, contractorRemark: flat.coverBlockRemarkContractor, aeRemark: flat.coverBlockRemarkEngineer },
        { id: 7, description: 'Alignment and binding of reinforcement is satisfactory & as per drawing', status: flat.reinforcementAlignment, contractorRemark: flat.reinforcementRemarkContractor, aeRemark: flat.reinforcementRemarkEngineer },
        { id: 8, description: 'Access and walkway for checking is available', status: flat.walkwayAvailable, contractorRemark: flat.walkwayRemarkContractor, aeRemark: flat.walkwayRemarkEngineer },
        { id: 9, description: 'Mix design is approved', status: flat.mixDesignApproved, contractorRemark: flat.mixDesignRemarkContractor, aeRemark: flat.mixDesignRemarkEngineer },
        { id: 10, description: 'Sufficient vibrators and needles are available in running condition', status: flat.vibratorsAvailable, contractorRemark: flat.vibratorsRemarkContractor, aeRemark: flat.vibratorsRemarkEngineer },
        { id: 11, description: 'Adequate props or supports provided', status: flat.propsProvided, contractorRemark: flat.propsRemarkContractor, aeRemark: flat.propsRemarkEngineer },
        { id: 12, description: 'Level pegs has been fixed for concrete top finishing if required', status: flat.levelPegsFixed, contractorRemark: flat.levelPegsRemarkContractor, aeRemark: flat.levelPegsRemarkEngineer },
        { id: 13, description: 'Concrete pump/boom placer is available if required', status: flat.concretePumpAvailable, contractorRemark: flat.concretePumpRemarkContractor, aeRemark: flat.concretePumpRemarkEngineer },
        { id: 14, description: 'DG and lighting arrangement is available if required', status: flat.dgLightingAvailable, contractorRemark: flat.dgLightingRemarkContractor, aeRemark: flat.dgLightingRemarkEngineer },
        { id: 15, description: 'Curing arrangements are made', status: flat.curingArrangements, contractorRemark: flat.curingRemarkContractor, aeRemark: flat.curingRemarkEngineer },
        { id: 16, description: 'Proper approach for transit mixer is available', status: flat.transitMixerApproach, contractorRemark: flat.transitMixerRemarkContractor, aeRemark: flat.transitMixerRemarkEngineer },
        { id: 17, description: "Adequate PPE's provided", status: flat.ppeProvided, contractorRemark: flat.ppeRemarkContractor, aeRemark: flat.ppeRemarkEngineer },
      ];

      return {
        checklist,
        gradeOfConcrete: flat.gradeOfConcrete || "",
      };
    } catch (error) {
      console.error("Error fetching checklist:", error);
      return null;
    }
  };

  if (!rfiData) return <div>Loading RFI details...</div>;

  return (
    <div className="dashboard create-rfi inspection-form">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-inspection-form">

            {step === 1 && (
              <div className="form-step">
                <h2>RFI Inspection - Step 1</h2>
                <div className="form-grid">
                  <div className="form-left">
                    <label>RFI ID:</label><input type="text" readOnly value={rfiData.rfi_Id} />
                    <label>Project:</label><input type="text" readOnly value={rfiData.project} />
                    <label>Contract:</label><input type="text" readOnly value={rfiData.contract} />
                    <label>Structure:</label><input type="text" readOnly value={rfiData.structure} />
                    <label>Activity:</label><input type="text" readOnly value={rfiData.activity} />
                    <label>RFI Description:</label><input type="text" readOnly value={rfiData.rfiDescription} />
                    <label>Description:</label><input type="text" readOnly value={rfiData.description} />
                    <label>Chainage:</label>
                    <input type="text" value={rfiData?.inspectionDetails?.[rfiData.inspectionDetails.length - 1]?.chainage} onChange={e => setChainage(e.target.value)} />
                  </div>
                  <div className="upload-section">
                    <label>Selfie:</label>
                    {selfieImage ? (
                      <img src={selfieImage} alt="Selfie" className="selfie-preview" />
                    ) : (
                      <button onClick={() => { setCameraMode('user'); setShowCamera('selfie'); }}>📷 Capture Selfie</button>
                    )}
                    {!selfieImage && <p className="error">*Selfie required</p>}
                  </div>
                </div>
                <button disabled={!selfieImage} onClick={() => setStep(2)} className="next-btn">Next</button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>RFI Inspection - Step 2</h2>
                <div className="form-grid">
                  <div className="form-left">
                    <label>Location:</label>
                    <input value={locationText} onFocus={fetchLocation} onChange={e => setLocationText(e.target.value)} />
                    <label>Date of Inspection:</label>
                    <input type="date" value={dateOfInspection} onChange={e => setDateOfInspection(e.target.value)} />
                    <label>Time of Inspection:</label>
                    <input type="time" value={timeOfInspection} onChange={e => setTimeOfInspection(e.target.value)} />
                    <label>Contractor's Representative:</label>
                    <input type="text" value={contractorRep} onChange={e => setContractorRep(e.target.value)} />
                  </div>
                  <div className="upload-grid">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="capture-option">
                        <button onClick={() => { setCameraMode('environment'); setShowCamera(`gallery-${i}`); }}>
                          📷 Capture Image {i + 1}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const updated = [...galleryImages];
                              updated[i] = file;
                              setGalleryImages(updated);
                            }
                          }}
                        />
                        {galleryImages[i] && (
                          <img
                            src={galleryImages[i] instanceof File ? URL.createObjectURL(galleryImages[i]) : galleryImages[i]}
                            alt={`Site ${i + 1}`}
                            className="gallery-preview"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <h3>Enclosures</h3>
                <table className="enclosure-table">
                  <thead>
                    <tr>
                      <th>RFI Description</th>
                      <th>Enclosure</th>
                      <th>Action</th>
                      <th>Uploaded</th>
                      <th>Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enclosuresData.map((e, index) => {
                      const state = enclosureStates[e.id] || {};
                      const rfiReportFilepath = rfiData.inspectionDetails?.[0]?.testSiteDocuments || '';

                      const enclosureFile = rfiData.enclosure?.find(enc =>
                        enc.enclosureName?.trim().toLowerCase() === e.enclosure?.trim().toLowerCase()
                      )?.enclosureUploadFile;

                      return (
                        <tr key={e.id}>
                          <td>{e.rfiDescription}</td>
                          <td>{e.enclosure}</td>

                          <td>
                            <button disabled={state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Open</button>{' '}
                            <button disabled={!state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Edit</button>
                            {deptFK?.toLowerCase() !== 'engg' && (
                              <button onClick={() => setUploadPopup(e.id)}>Upload</button>
                            )}
                          </td>

                          <td>
                            {enclosureFile ? (
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `${API_BASE_URL.replace(/\/$/, '')}/rfi/DownloadPrev?filepath=${encodeURIComponent(enclosureFile)}`;
                                  link.download = enclosureFile.split(/[\\/]/).pop();
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                style={{ padding: '4px 10px', cursor: 'pointer' }}
                              >
                                Download Enclosure
                              </button>
                            ) : (
                              '---'
                            )}
                          </td>

                          {index === 0 && (
                            <td rowSpan={enclosuresData.length}>
                              {rfiReportFilepath && (
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `${API_BASE_URL.replace(/\/$/, '')}/rfi/DownloadPrev?filepath=${encodeURIComponent(rfiReportFilepath)}`;
                                    link.download = rfiReportFilepath.split(/[\\/]/).pop();
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  Download Test Report
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* ✅ Inline Confirm Inspection section (no popup) */}
				<hr style={{ margin: "30px 0" }} />
                <div className="confirm-inspection w-100" style={{ marginTop: '1rem', padding: '12px', border: '1px solid #ddd', borderRadius: 8 }}>
                  <h3>Confirm Inspection</h3>
                  <div className="d-flex align-center gap-20">
                    <div className="form-fields">
                      <label>Tests in Site/Lab</label>
                      {deptFK?.toLowerCase() === "engg" ? (
                        <p style={{ color: "green", border: "2px solid grey", padding: 6 }}>
                          {rfiData?.inspectionDetails
                            ?.find(d => d.uploadedBy === "CON")
                            ?.inspectionStatus || "Not Uploaded"}
                        </p>
                      ) : (
                        <select
                          value={inspectionStatus}
                          onChange={(e) => setInspectionStatus(e.target.value)}
                        >
                          <option value=""disabled hidden>Select</option>
                          <option value="VISUAL">Visual</option>
                          <option value="LAB_TEST">Lab Test</option>
                          <option value="SITE_TEST">Site Test</option>
                        </select>
                      )}
                    </div>
                    <div className="form-fields">
                      {deptFK?.toLowerCase() !== 'engg' && inspectionStatus !== 'VISUAL' && (
                        <>
                          <label>Upload Test Report Here</label>
                          <input
                            type="file"
                            onChange={(e) => setTestReportFile(e.target.files[0])}
              
                          />
                        
                        </>
                      )}
                    </div>
                    <div className="form-fields">
                      {deptFK?.toLowerCase() === 'engg' && (
                        <>
                          <label>Inspection Status</label>
                          <select
                            value={
                              testInLab !== null && testInLab !== undefined
                                ? testInLab.toString()
                                : rfiData?.inspectionDetails?.find(d => d.uploadedBy === "Engg")?.testInsiteLab || ''
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === 'Accepted') setTestInLab('Accepted');
                              else if (value === 'Rejected') setTestInLab('Rejected');
                              else setTestInLab(null);
                            }}
                          >
                            <option value="">Select</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  <h4><b>Area :</b></h4>
                  <div className="form-row">
                    <div className="form-fields">
                      <label>Length</label>
                      <input type="text" name='area_length' id='area_length' />
                    </div>
                    <div className="form-fields">
                      <label>Breadth</label>
                      <input type="text" name='area_breadth' id='area_breadth' />
                    </div>
                    <div className="form-fields">
                      <label>Height</label>
                      <input type="text" name='area_height' id='area_height' />
                    </div>
                  </div>

                  <h4><b>Volume: </b></h4>
                  <div className="form-row">
                    <div className="form-fields">
                      <label>Length</label>
                      <input type="text" name='volume_length' id='volume_length' />
                    </div>
                    <div className="form-fields">
                      <label>Breadth</label>
                      <input type="text" name='volume_breadth' id='volume_breadth' />
                    </div>
                    <div className="form-fields">
                      <label>Height</label>
                      <input type="text" name='volume_height' id='volume_height' />
                    </div>
                  </div>
                  
                </div>

                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-blue" onClick={handleSaveInspection}>Save</button>
                  {/* ⬇️ Direct submit, no popup */}
                  <button className="btn btn-green" onClick={handleSubmitConfirmed}>Submit</button>
                </div>
              </div>
            )}

            {checklistPopup && (
              <ChecklistPopup
                rfiData={rfiData}
                enclosureName={enclosuresData.find(e => e.id === checklistPopup)?.enclosure}
                data={enclosureStates[checklistPopup]?.checklist || initialChecklist}
                fetchChecklistData={fetchChecklistData}
                onDone={(data, grade) =>
                  handleChecklistSubmit(checklistPopup, data, grade)
                }
                onClose={() => setChecklistPopup(null)}
              />
            )}

            {uploadPopup && (
              <UploadPopup
                onSubmit={file => handleUploadSubmit(uploadPopup, file)}
                onClose={() => setUploadPopup(null)}
              />
            )}

            {showCamera && (
              <div className="popup">
                <CameraCapture
                  facingMode={cameraMode}
                  onCapture={(img) => {
                    if (showCamera === 'selfie') setSelfieImage(img);
                    else {
                      const index = parseInt(showCamera.split('-')[1]);
                      if (!isNaN(index)) {
                        const updated = [...galleryImages];
                        updated[index] = img;
                        setGalleryImages(updated);
                      }
                    }
                    setShowCamera(false);
                  }}
                  onCancel={() => setShowCamera(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistPopup({ rfiData, enclosureName, data, fetchChecklistData, onDone, onClose }) {
  const [checklist, setChecklist] = useState(data);
  const [gradeOfConcrete, setGradeOfConcrete] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!rfiData?.id || !enclosureName) return;
      const result = await fetchChecklistData(rfiData.id, enclosureName);
      if (result?.checklist) {
        setChecklist(result.checklist);
        setGradeOfConcrete(result.gradeOfConcrete || '');
      }
    };
    if (rfiData?.id && enclosureName) {
      fetchData();
    }
  }, [rfiData?.id, enclosureName, fetchChecklistData]);

  const handleChange = (id, field, value) => {
    setChecklist(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleDone = () => {
    const invalid = checklist.filter(row => !['YES', 'NO', 'NA'].includes(row.status));
    if (invalid.length > 0) {
      setErrorMsg('⚠️ Please select YES, NO, or N/A for **all** checklist items.');
      return;
    }
    setErrorMsg('');
    onDone(checklist, gradeOfConcrete);
  };
  return (
    <div className="popup">
      <div className="form-row">
        <div className="form-fields flex-1">
          <label>Name Of Work:</label>
          <input type="text" readOnly value={rfiData.work || ''} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-fields flex-2">
          <label>Location:</label>
          <input type="text" name="location_ch"
            value={rfiData?.inspectionDetails?.[0]?.location || ""} readOnly />
        </div>
        <div className="form-fields flex-2">
          <label>Date:</label>
          <input type="text" name="date" value={rfiData.dateOfInspection || ''} readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-fields flex-2">
          <label>Structure Type:</label>
          <input type="text" name="structure_type" value={rfiData.structureType || ''} readOnly />
        </div>
        <div className="form-fields flex-2">
          <label>Component:</label>
          <input type="text" name="component" value={rfiData.component || ''} readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-fields flex-2">
          <label>RFI No:</label>
          <input type="text" name="rfi_id" value={rfiData.rfi_Id || ''} readOnly />
        </div>
        <div className="form-fields flex-2">
          <label>Grade of Concrete/Steel: </label>
          <input
            type="text"
            name="concrete_grade"
            id="concrete_grade"
            value={gradeOfConcrete}
            onChange={e => setGradeOfConcrete(e.target.value)}
            readOnly={deptFK !== 'contractor'}
          />
        </div>
      </div>
      <h3>CHECKLIST FOR CONCRETE/SHUTTERING & REINFORCEMENT</h3>

      <table>
        <thead>
          <tr><th>ID</th><th>Description</th><th>Yes</th><th>No</th><th>N/A</th><th>Contractor Remark</th><th>Engineer Remark</th></tr>
        </thead>
        <tbody>
          {checklist.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.description}</td>
              <td><input type="radio" checked={row.status === 'YES'} onChange={() => handleChange(row.id, 'status', 'YES')} readOnly={deptFK !== 'contractor'} /></td>
              <td><input type="radio" checked={row.status === 'NO'} onChange={() => handleChange(row.id, 'status', 'NO')} readOnly={deptFK !== 'contractor'} /></td>
              <td><input type="radio" checked={row.status === 'NA'} onChange={() => handleChange(row.id, 'status', 'NA')} readOnly={deptFK !== 'contractor'} /></td>
              <td><input value={row.contractorRemark} onChange={e => handleChange(row.id, 'contractorRemark', e.target.value)} disabled={deptFK !== 'contractor'} /></td>
              <td><input value={row.aeRemark} onChange={e => handleChange(row.id, 'aeRemark', e.target.value)} disabled={deptFK !== 'engg'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>{errorMsg}</div>
      )}

      <div className="popup-actions">
        <button onClick={handleDone}>Done</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function UploadPopup({ onSubmit, onClose }) {
  const [file, setFile] = useState(null);

  return (
    <div className="popup">
      <h3>Upload File</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <div className="popup-actions">
        <button disabled={!file} onClick={() => onSubmit(file)}>Upload</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
