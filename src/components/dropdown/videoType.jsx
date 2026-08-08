import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import "./dropdown.css";

function Videotype({ onChange }) {
  const [videoTypes, setVideoTypes] = useState([]);
  const [selectedVideoTypes, setSelectedVideoTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  const fetchVideotype = async () => {
    const { data, error } = await supabase
      .from("video_type")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const formatted = data.map((c) => ({ value: c.id, label: c.name }));
      setVideoTypes(formatted);
    }
  };

  useEffect(() => { fetchVideotype(); }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const notifyParent = (selected) => {
    const value = selected.map((o) => o.label).join(", ");
    onChange?.(value);
  };

  const handleCheckboxChange = (option) => {
    const alreadySelected = selectedVideoTypes.find((c) => c.value === option.value);
    let updated;
    if (alreadySelected) {
      updated = selectedVideoTypes.filter((c) => c.value !== option.value);
    } else {
      updated = [...selectedVideoTypes, option];
    }
    setSelectedVideoTypes(updated);
    notifyParent(updated);
  };

  const handleSelectAll = () => {
    const filtered = getFilteredTypes();
    const allSelected = filtered.every((c) => selectedVideoTypes.find((s) => s.value === c.value));
    let updated;
    if (allSelected) {
      updated = selectedVideoTypes.filter((s) => !filtered.find((f) => f.value === s.value));
    } else {
      const newOnes = filtered.filter((f) => !selectedVideoTypes.find((s) => s.value === f.value));
      updated = [...selectedVideoTypes, ...newOnes];
    }
    setSelectedVideoTypes(updated);
    notifyParent(updated);
  };

  // const handleCreate = async () => {
  //   const trimmed = inputValue.trim();
  //   if (!trimmed) return;
  //   const { data, error } = await supabase.from("video_type").insert([{ name: trimmed }]).select().single();
  //   if (!error && data) {
  //     const newOption = { value: data.id, label: data.name };
  //     setVideoTypes((prev) => [newOption, ...prev]);
  //     const updated = [...selectedVideoTypes, newOption];
  //     setSelectedVideoTypes(updated);
  //     notifyParent(updated);
  //     setInputValue("");
  //     setSearchText("");
  //   }
  // };

  const handleKeyDown = (e) => {
    // if (e.key === "Enter") {
    //   e.preventDefault();
    //   const match = videoTypes.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase());
    //   if (!match && inputValue.trim()) handleCreate();
    // }
  };

  const getFilteredTypes = () => {
    const query = searchText.toLowerCase();
    return videoTypes.filter((c) => c.label.toLowerCase().includes(query));
  };

  const filteredTypes = getFilteredTypes();
  const allFilteredSelected =
    filteredTypes.length > 0 &&
    filteredTypes.every((c) => selectedVideoTypes.find((s) => s.value === c.value));

  const displayLabel =
    selectedVideoTypes.length === 0
      ? "Video Type"
      : selectedVideoTypes.length === 1
      ? selectedVideoTypes[0].label
      : `${selectedVideoTypes.length} types`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>

      {/* ── Trigger ── */}
      {/* <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${selectedVideoTypes.length > 0 ? "has-value" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="dropdown-trigger-label">{displayLabel}</span>
        <span className="dropdown-trigger-chevron">▼</span>
      </div> */}

      <div className="star-border-container" style={{ padding: "2px 0" }}>
  <div
    className="border-gradient-bottom"
    style={{ background: "radial-gradient(circle, #ffffff, transparent 10%)", animationDuration: "2.5s" }}
  />
  <div
    className="border-gradient-top"
    style={{ background: "radial-gradient(circle, #ffffff, transparent 10%)", animationDuration: "2.5s" }}
  />
  <div
    className={`dropdown-trigger inner-content ${isOpen ? "open" : ""} ${selectedVideoTypes.length > 0 ? "has-value" : ""}`}
    onClick={() => setIsOpen((prev) => !prev)}
  >
    <span className="dropdown-trigger-label">{displayLabel}</span>
    <span className="dropdown-trigger-chevron">▼</span>
  </div>
</div>

      {/* ── Panel ── */}
      {isOpen && (
        <div className="dropdown-panel">

          <div className="dropdown-search-wrap">
            <input
              autoFocus
              type="text"
              placeholder="Search video types..."
              value={searchText}
              className="dropdown-search"
              onChange={(e) => { setSearchText(e.target.value); setInputValue(e.target.value); }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="dropdown-select-all" onClick={handleSelectAll}>
            <input type="checkbox" checked={allFilteredSelected} readOnly />
            <span>Select All</span>
          </div>

          {filteredTypes.length === 0 && (
            <div className="dropdown-empty">
            No results found.
            </div>
          )}

          {filteredTypes.map((option) => {
            const isChecked = !!selectedVideoTypes.find((s) => s.value === option.value);
            return (
              <div
                key={option.value}
                className={`dropdown-option ${isChecked ? "checked" : ""}`}
                onClick={() => handleCheckboxChange(option)}
              >
                <input type="checkbox" checked={isChecked} readOnly />
                <span>{option.label}</span>
              </div>
            );
          })}

          {/* {inputValue.trim() && !videoTypes.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()) && (
            <div className="dropdown-create" onClick={handleCreate}>
              <span className="dropdown-create-icon">＋</span>
              <span>Create "{inputValue.trim()}"</span>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}

export default Videotype;