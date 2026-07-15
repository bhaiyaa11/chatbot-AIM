import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import "./dropdown.css";

function VideoTone({ onChange }) {
  const [videoTones, setVideoTones] = useState([]);
  const [selectedVideoTones, setSelectedVideoTones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  const fetchVideoTone = async () => {
    const { data, error } = await supabase
      .from("video_tone")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const formatted = data.map((c) => ({ value: c.id, label: c.name }));
      setVideoTones(formatted);
    }
  };

  useEffect(() => { fetchVideoTone(); }, []);

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
    const alreadySelected = selectedVideoTones.find((c) => c.value === option.value);
    let updated;
    if (alreadySelected) {
      updated = selectedVideoTones.filter((c) => c.value !== option.value);
    } else {
      updated = [...selectedVideoTones, option];
    }
    setSelectedVideoTones(updated);
    notifyParent(updated);
  };

  const handleSelectAll = () => {
    const filtered = getFilteredTones();
    const allSelected = filtered.every((c) => selectedVideoTones.find((s) => s.value === c.value));
    let updated;
    if (allSelected) {
      updated = selectedVideoTones.filter((s) => !filtered.find((f) => f.value === s.value));
    } else {
      const newOnes = filtered.filter((f) => !selectedVideoTones.find((s) => s.value === f.value));
      updated = [...selectedVideoTones, ...newOnes];
    }
    setSelectedVideoTones(updated);
    notifyParent(updated);
  };

  // const handleCreate = async () => {
  //   const trimmed = inputValue.trim();
  //   if (!trimmed) return;
  //   const { data, error } = await supabase.from("video_tone").insert([{ name: trimmed }]).select().single();
  //   if (!error && data) {
  //     const newOption = { value: data.id, label: data.name };
  //     setVideoTones((prev) => [newOption, ...prev]);
  //     const updated = [...selectedVideoTones, newOption];
  //     setSelectedVideoTones(updated);
  //     notifyParent(updated);
  //     setInputValue("");
  //     setSearchText("");
  //   }
  // };

  const handleKeyDown = (e) => {
    // if (e.key === "Enter") {
    //   e.preventDefault();
    //   const match = videoTones.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase());
    //   if (!match && inputValue.trim()) handleCreate();
    // }
  };

  const getFilteredTones = () => {
    const query = searchText.toLowerCase();
    return videoTones.filter((c) => c.label.toLowerCase().includes(query));
  };

  const filteredTones = getFilteredTones();
  const allFilteredSelected =
    filteredTones.length > 0 &&
    filteredTones.every((c) => selectedVideoTones.find((s) => s.value === c.value));

  const displayLabel =
    selectedVideoTones.length === 0
      ? "Video Tone"
      : selectedVideoTones.length === 1
      ? selectedVideoTones[0].label
      : `${selectedVideoTones.length} tones`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>

      {/* ── Trigger ── */}
      <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${selectedVideoTones.length > 0 ? "has-value" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="dropdown-trigger-label">{displayLabel}</span>
        <span className="dropdown-trigger-chevron">▼</span>
      </div>

      {/* ── Panel ── */}
      {isOpen && (
        <div className="dropdown-panel">

          <div className="dropdown-search-wrap">
            <input
              autoFocus
              type="text"
              placeholder="Search video tones..."
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

          {filteredTones.length === 0 && (
            <div className="dropdown-empty">
              No results found.
            </div>
          )}

          {filteredTones.map((option) => {
            const isChecked = !!selectedVideoTones.find((s) => s.value === option.value);
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

          {/* {inputValue.trim() && !videoTones.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()) && (
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

export default VideoTone;