import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import HeaderRight from '../HeaderRight/HeaderRight';
import './CreateRfi.css';

const CreateRfi = ({ mode = 'create', formData = {} }) => {

 const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({
    project: '',
    location: '',
    contract: '',
    structureType: '',
    structure: '',
    component: '',
    element: '',
    activity: '',
    rfiDescription: '',
    rfiAction: '',
    typeOfRfi: '',
    nameOfRepresentative: '',
    timeOfInspection: '',
    rfiId: '',
    dateSubmissionRfi: '',
    dateInspection: '',
    addRfiEnclosures: '',
    addRfiLocation: '',
    description: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'edit' && formData) {
      setFormState({
        project: formData.project || '',
        location: formData.location || '',
        contract: formData.contract || '',
        structureType: formData.structureType || '',
        structure: formData.structure || '',
        component: formData.component || '',
        element: formData.element || '',
        activity: formData.activity || '',
        rfiDescription: formData.contract || '',
        rfiAction: formData.rfiAction || '',
        typeOfRfi: formData.typeOfRfi || '',
        nameOfRepresentative: formData.nameOfRepresentative || '',
        timeOfInspection: formData.timeOfInspection || '',
        rfiId: formData.rfiId || '',
        dateSubmissionRfi: formData.dateSubmissionRfi || '',
        dateInspection: formData.dateInspection || '',
        inspectionType: formData.inspectionType || '',
        addRfiEnclosures: formData.addRfiEnclosures || '',
        addRfiLocation: formData.addRfiLocation || '',
        description: formData.description || '',
      });
    }
  }, [mode, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async () => {
    setMessage('');
    try {
      const response = await fetch(
        mode === 'edit'
          ? `http://localhost:8000/api/rfi/update/${formData.id}`
          : 'http://localhost:8000/api/rfi/create',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ RFI ${mode === 'edit' ? 'updated' : 'created'} successfully. RFI No: ${data.rfiNumber}`);
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Network error.');
    }
  };

  const projectOptions = [
    { value: 'Project A', label: 'Project A' },
    { value: 'Project B', label: 'Project B' },
  ];

  const locationOptions = [
    { value: 'Site 1', label: 'Site 1' },
    { value: 'Site 2', label: 'Site 2' },
  ];

    const contractOptions = [
    { value: 'Contract 1', label: 'Contract 1' },
    { value: 'Contract 2', label: 'Contract 2' },
  ];
    const structureTypeOptions = [
      { value: 'Building Work', label: 'Building Work' },
      { value: 'Earthwork', label: 'Earthwork' },
      { value: 'Bridge Work', label: 'Bridge Work' },
      { value: 'Foot Over Bridge & Staircase', label: 'Foot Over Bridge & Staircase' },
      { value: 'Drain', label: 'Drain' },
      { value: 'Quality Control', label: 'Quality Control' },
    ];
      const structureOptions = [
      { value: 'structure 1', label: 'structure 1' },
      { value: 'structure 2', label: 'structure 2' },
    ];
      const componentOptions = [
      { value: 'component 1', label: 'component 1' },
      { value: 'component 2', label: 'component 2' },
    ];
      const elementOptions = [
      { value: 'element 1', label: 'element 1' },
      { value: 'element 2', label: 'element 2' },
    ];
    const activityOptions = [
      { value: 'Bore Log', label: 'Bore Log' },
      { value: 'Site Survey', label: 'Site Survey' },
      { value: 'Piling', label: 'Piling' },
      { value: 'Excavation', label: 'Excavation' },
      { value: 'PCC', label: 'PCC' },
      { value: 'Footing/Pile Cap', label: 'Footing/Pile Cap' },
    ];
    const rfiDescriptionOptions = [
      { value: 'Start of Pile Boring Work', label: 'Start of Pile Boring Work' },
      { value: 'Pile Depth Checking', label: 'Pile Depth Checking' },
      { value: 'Reinforcement Cage Checking', label: 'Reinforcement Cage Checking' },
      { value: 'Steel Cage lowering & approval of concreting for Concreting', label: 'Steel Cage lowering & approval of concreting for Concreting' },
    ];
    const typeOfRfiOptions = [
      { value: 'typeOfRfi 1', label: 'typeOfRfi 1'},
      { value: 'typeOfRfi 2', label: 'typeOfRfi 2'},
    ];
    const nameOfRepresentativeOptions = [
      { value: 'nameOfRepresentative 1', label: 'nameOfRepresentative 1'},
      { value: 'nameOfRepresentative 2', label: 'nameOfRepresentative 2'},
    ];
    const addRfiEnclosuresOptions = [
      { value: 'addRfiEnclosures 1', label: 'addRfiEnclosures 1' },
      { value: 'addRfiEnclosures 2', label: 'addRfiEnclosures 2' },
    ];
  return (
      <div classNameName="dashboard">
          <HeaderRight />
        <div className="right">
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 page-heading">
        {mode === 'edit' ? 'Edit RFI Details' : 'Add RFI Details'}
      </h2>

      {message && (
        <div className={`mb-4 p-2 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="form-row flex-wrap">
            <div className="form-fields flex-2">
              <label htmlFor="project" className="block mb-1">Project:</label>
              <Select
                id="project"
                name="project"
                options={projectOptions}
                value={formState.project ? { value: formState.project, label: formState.project } : null}
                onChange={(selected) => setFormState({ ...formState, project: selected?.value || '' })}
              />
            </div>

            <div className="form-fields flex-2">
              <label htmlFor="location" className="block mb-1">Location:</label>
              <Select
                id="location"
                name="location"
                options={locationOptions}
                value={formState.location ? { value: formState.location, label: formState.location } : null}
                onChange={(selected) => setFormState({ ...formState, location: selected?.value || '' })}
              />
            </div>

            <div className="form-fields flex-1">
              <label htmlFor="contract" className="block mb-1">Contract:</label>
              <Select
                id="contract"
                name="contract"
                options={contractOptions}
                value={formState.contract ? { value: formState.contract, label: formState.contract } : null}
                onChange={(selected) => setFormState({ ...formState, contract: selected?.value || '' })}
              />
            </div>

            <div className="form-fields flex-4">
              <label htmlFor="structureType" className="block mb-1">Structure Type:</label>
              <Select
                id="structureType"
                name="structureType"
                options={structureTypeOptions}
                value={formState.structureType ? { value: formState.structureType, label: formState.structureType } : null}
                onChange={(selected) => setFormState({ ...formState, structureType: selected?.value || '' })}
              />
            </div>

            <div className="form-fields flex-4">
              <label htmlFor="structure" className="block mb-1">Structure:</label>
              <Select
                id="structure"
                name="structure"
                options={structureOptions}
                value={formState.structure ? { value: formState.structure, label: formState.structure } : null}
                onChange={(selected) => setFormState({ ...formState, structure: selected?.value || '' })}
              />
            </div>
            <div className="form-fields flex-4">
              <label htmlFor="component" className="block mb-1">Component:</label>
              <Select
                id="component"
                name="component"
                options={componentOptions}
                value={formState.component ? { value: formState.component, label: formState.component } : null}
                onChange={(selected) => setFormState({ ...formState, component: selected?.value || '' })}
              />
            </div>
            <div className="form-fields flex-4">
              <label htmlFor="element" className="block mb-1">Element:</label>
              <Select
                id="element"
                name="element"
                options={elementOptions}
                value={formState.element ? { value: formState.element, label: formState.element } : null}
                onChange={(selected) => setFormState({ ...formState, element: selected?.value || '' })}
              />
            </div>

            <div className="form-row justify-start">
              <div className="form-fields flex-4">
                <label htmlFor="activity" className="block mb-1">Activity:</label>
                <Select
                  id="activity"
                  name="activity"
                  options={activityOptions}
                  value={formState.activity ? { value: formState.activity, label: formState.activity } : null}
                  onChange={(selected) => setFormState({ ...formState, activity: selected?.value || '' })}
                />
              </div>
              <div className="form-fields flex-4">
                <label htmlFor="rfiDescription" className="block mb-1">RFI Description:</label>
                <Select
                  id="rfiDescription"
                  name="rfiDescription"
                  options={rfiDescriptionOptions}
                  value={formState.rfiDescription ? { value: formState.rfiDescription, label: formState.rfiDescription } : null}
                  onChange={(selected) => setFormState({ ...formState, rfiDescription: selected?.value || '' })}
                />
              </div>
            </div>

          </div>

          <div className="d-flex justify-end">
            <button onClick={() => setStep(2)} className="btn btn-primary">
              Next
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="form-row flex-wrap align-center">
            <div className="form-fields flex-1">
              <label htmlFor="rfiAction" className="block mb-1">Action:</label>
              <input
                type="text"
                id="rfiAction"
                name="rfiAction"
                value={formState.rfiAction}
                onChange={handleChange}
                placeholder="Enter value"
              />
            </div>

            <div className="form-fields flex-1">
              <label htmlFor="typeOfRfi" className="block mb-1">Type of RFI:</label>
              <Select
                id="typeOfRfi"
                name="typeOfRfi"
                options={typeOfRfiOptions}
                value={formState.typeOfRfi ? { value: formState.typeOfRfi, label: formState.typeOfRfi } : null}
                onChange={(selected) => setFormState({ ...formState, typeOfRfi: selected?.value || '' })}
              />
            </div>

            <div className="form-fields flex-1">
              <label htmlFor="nameOfRepresentative" className="block mb-1">Name Of Representative:</label>
              <Select
                id="nameOfRepresentative"
                name="nameOfRepresentative"
                options={nameOfRepresentativeOptions}
                value={formState.nameOfRepresentative ? { value: formState.nameOfRepresentative, label: formState.nameOfRepresentative } : null}
                onChange={(selected) => setFormState({ ...formState, nameOfRepresentative: selected?.value || '' })}
              />
            </div>

            <div className="form-fields flex-1">
              <label htmlFor="timeOfInspection" className="block mb-1">Time Of Inspection:</label>
              <input
                type="time"
                id="timeOfInspection"
                name="timeOfInspection"
                value={formState.timeOfInspection}
                onChange={handleChange}
                placeholder="Enter value"
              />
            </div>

            <div className="form-fields flex-1">
              <label htmlFor="rfiId" className="block mb-1">RFI ID:</label>
              <input
                type="text"
                id="rfiId"
                name="rfiId"
                value={formState.rfiId}
                onChange={handleChange}
                placeholder="Enter value"
              />
            </div>
            <div className="form-fields flex-1">
              <label htmlFor="dateSubmissionRfi" className="block mb-1">Date of Submission of RFI:</label>
              <input
                type="time"
                id="dateSubmissionRfi"
                name="dateSubmissionRfi"
                value={formState.dateSubmissionRfi}
                onChange={handleChange}
                placeholder="Enter value"
              />
            </div>
            <div className="form-fields flex-1">
              <label htmlFor="dateInspection" className="block mb-1">Date of Inspection:</label>
              <input
                type="time"
                id="dateInspection"
                name="dateInspection"
                value={formState.dateInspection}
                onChange={handleChange}
                placeholder="Enter value"
              />
            </div>

          </div>

          <div className="d-flex justify-end gap-20">
            <button onClick={() => setStep(1)} className="btn btn-white">
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary">
              Next
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="form-row flex-wrap align-center">
              <div className="form-fields flex-1">
                <label htmlFor="addRfiEnclosures" className="block mb-1">Enclosures:</label>
                <Select
                    id="addRfiEnclosures"
                    name="addRfiEnclosures"
                    options={addRfiEnclosuresOptions}
                    value={formState.addRfiEnclosures ? { value: formState.addRfiEnclosures, label: formState.addRfiEnclosures } : null}
                    onChange={(selected) => setFormState({ ...formState, addRfiEnclosures: selected?.value || '' })}
                  />
              </div>
              <div className="form-fields flex-1">
                  <label htmlFor="addRfiLocation" className="block mb-1">Location:</label>
                  <input
                    type="time"
                    id="addRfiLocation"
                    name="addRfiLocation"
                    value={formState.addRfiLocation}
                    onChange={handleChange}
                    placeholder="Enter value"
                  />
                </div>

          <div className="form-fields flex-1">
            <label htmlFor="description" className="block mb-1">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter Description"
            />
          </div>
        </div>
          <div className="d-flex justify-end">
            <button onClick={() => setStep(2)} className="btn btn-white">
              Back
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              {mode === 'edit' ? 'Update' : 'Submit'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
    </div>
    </div>
  );
};

export default CreateRfi;
