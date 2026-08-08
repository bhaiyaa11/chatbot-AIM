
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import "./dropdown.css";

function Clients({ onChange }) {
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  // Load clients from Supabase
  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("client")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const formatted = data.map((c) => ({ value: c.id, label: c.name }));
      setClients(formatted);
    }
  };

  useEffect(() => { fetchClients(); }, []);

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
    const alreadySelected = selectedClients.find((c) => c.value === option.value);
    let updated;
    if (alreadySelected) {
      updated = selectedClients.filter((c) => c.value !== option.value);
    } else {
      updated = [...selectedClients, option];
    }
    setSelectedClients(updated);
    notifyParent(updated);
  };

  const handleSelectAll = () => {
    const filtered = getFilteredClients();
    const allSelected = filtered.every((c) => selectedClients.find((s) => s.value === c.value));
    let updated;
    if (allSelected) {
      updated = selectedClients.filter((s) => !filtered.find((f) => f.value === s.value));
    } else {
      const newOnes = filtered.filter((f) => !selectedClients.find((s) => s.value === f.value));
      updated = [...selectedClients, ...newOnes];
    }
    setSelectedClients(updated);
    notifyParent(updated);
  };

  // const handleCreate = async () => {
  //   const trimmed = inputValue.trim();
  //   if (!trimmed) return;
  //   const { data, error } = await supabase.from("client").insert([{ name: trimmed }]).select().single();
  //   if (!error && data) {
  //     const newOption = { value: data.id, label: data.name };
  //     setClients((prev) => [newOption, ...prev]);
  //     const updated = [...selectedClients, newOption];
  //     setSelectedClients(updated);
  //     notifyParent(updated);
  //     setInputValue("");
  //     setSearchText("");
  //   }
  // };

  const handleKeyDown = (e) => {
    // if (e.key === "Enter") {
    //   e.preventDefault();
    //   const match = clients.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase());
    //   if (!match && inputValue.trim()) handleCreate();
    // }
  };

  const getFilteredClients = () => {
    const query = searchText.toLowerCase();
    return clients.filter((c) => c.label.toLowerCase().includes(query));
  };

  const filteredClients = getFilteredClients();
  const allFilteredSelected =
    filteredClients.length > 0 &&
    filteredClients.every((c) => selectedClients.find((s) => s.value === c.value));

  const displayLabel =
    selectedClients.length === 0
      ? "Client"
      : selectedClients.length === 1
      ? selectedClients[0].label
      : `${selectedClients.length} clients`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>

      {/* ── Trigger ── */}
      {/* <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${selectedClients.length > 0 ? "has-value" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="dropdown-trigger-label">{displayLabel}</span>
        <span className="dropdown-trigger-chevron">▼</span>
      </div> */}

      {/* ── Trigger ── */}
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
    className={`dropdown-trigger inner-content ${isOpen ? "open" : ""} ${selectedClients.length > 0 ? "has-value" : ""}`}
    onClick={() => setIsOpen((prev) => !prev)}
  >
    <span className="dropdown-trigger-label">{displayLabel}</span>
    <span className="dropdown-trigger-chevron">▼</span>
  </div>
</div>

      {/* ── Panel ── */}
      {isOpen && (
        <div className="dropdown-panel">

          {/* Search */}
          <div className="dropdown-search-wrap">
            <input
              autoFocus
              type="text"
              placeholder="Search clients..."
              value={searchText}
              className="dropdown-search"
              onChange={(e) => { setSearchText(e.target.value); setInputValue(e.target.value); }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Select All */}
          <div className="dropdown-select-all" onClick={handleSelectAll}>
            <input type="checkbox" checked={allFilteredSelected} readOnly />
            <span>Select All</span>
          </div>

          {/* Empty */}
          {filteredClients.length === 0 && (
            <div className="dropdown-empty">
              No results found.
            </div>
          )}

          {/* Options */}
          {filteredClients.map((option) => {
            const isChecked = !!selectedClients.find((s) => s.value === option.value);
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

          {/* Create new */}
          {/* {inputValue.trim() && !clients.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()) && (
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

export default Clients;