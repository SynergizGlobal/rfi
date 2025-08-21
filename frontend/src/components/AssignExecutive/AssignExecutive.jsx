import React, { useState, useRef, useEffect } from "react";
import HeaderRight from "../HeaderRight/HeaderRight";
import "./AssignExecutive.css";

const AssignExecutive = () => {
  // state
  const [executives, setExecutives] = useState([]); // selected names
  const [execOpen, setExecOpen] = useState(false);
  const execRef = useRef(null);

  const allExecutives = ["Sunil", "Ajay", "Mukul", "Akash", "Subhash"];

  // click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (execRef.current && !execRef.current.contains(event.target)) {
        setExecOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // toggle selection
  const toggleExecutive = (name) => {
    setExecutives((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="dashboard credted-rfi inspection assign-executive">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">Assign Executives</h2>

            {/* Form */}
            <form className="assign-form">
              <div className="form-group">
                <label>Project</label>
                <select>
                  <option>-- Select Project --</option>
                  <option>Project 1</option>
                  <option>Project 2</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work</label>
                <select>
                  <option>-- Select Work --</option>
                  <option>Work 1</option>
                  <option>Work 2</option>
                </select>
              </div>

              <div className="form-group">
                <label>Contract <span className="required">*</span></label>
                <select>
                  <option>-- Select Contract --</option>
                  <option>Contract A</option>
                  <option>Contract B</option>
                </select>
              </div>

              <div className="form-group">
                <label>Structure Type <span className="required">*</span></label>
                <select>
                  <option>Bridge Work</option>
                  <option>Tunnel Work</option>
                </select>
              </div>

              <div className="form-group">
                <label>Structure <span className="required">*</span></label>
                <select>
                  <option>ROB</option>
                  <option>FOB</option>
                </select>
              </div>

              {/* Executives Multi-Select */}
              <div className="form-group" ref={execRef}>
                <label>Assign Executives</label>
                <div
                  className="multi-select-input"
                  onClick={() => setExecOpen(!execOpen)}
                >
                  {executives.length > 0
                    ? executives.join(", ")
                    : "Select Executives"}
                  <span className="arrow">&#9662;</span>
                </div>
                {execOpen && (
                  <div className="multi-select-dropdown">
                    {allExecutives.map((name) => (
                      <label key={name} className="dropdown-option">
                        <input
                          type="checkbox"
                          checked={executives.includes(name)}
                          onChange={() => toggleExecutive(name)}
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="save-btn">
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignExecutive;
