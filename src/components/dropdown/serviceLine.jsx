import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import "./dropdown.css";

function ServiceLine({ onChange }) {
  const [serviceLines, setServiceLines] = useState([]);
  const [selectedServiceLines, setSelectedServiceLines] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  const fetchServiceLines = async () => {
    const { data, error } = await supabase
      .from("service_line")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Service line fetch error:", error);
      return;
    }

    const formatted = (data || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));

    setServiceLines(formatted);
  };

  useEffect(() => {
    fetchServiceLines();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText("");
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const notifyParent = (selected) => {
    onChange?.(selected.map((item) => item.label).join(", "));
  };

  const handleCheckboxChange = (option) => {
    const alreadySelected = selectedServiceLines.some(
      (item) => item.value === option.value
    );

    const updated = alreadySelected
      ? selectedServiceLines.filter((item) => item.value !== option.value)
      : [...selectedServiceLines, option];

    setSelectedServiceLines(updated);
    notifyParent(updated);
  };

  const getFilteredServiceLines = () =>
    serviceLines.filter((item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase())
    );

  const handleSelectAll = () => {
    const filtered = getFilteredServiceLines();

    const allSelected = filtered.every((item) =>
      selectedServiceLines.some((selected) => selected.value === item.value)
    );

    const updated = allSelected
      ? selectedServiceLines.filter(
          (selected) =>
            !filtered.some((item) => item.value === selected.value)
        )
      : [
          ...selectedServiceLines,
          ...filtered.filter(
            (item) =>
              !selectedServiceLines.some(
                (selected) => selected.value === item.value
              )
          ),
        ];

    setSelectedServiceLines(updated);
    notifyParent(updated);
  };

  // const handleCreate = async () => {
  //   const trimmed = inputValue.trim();
  //   if (!trimmed) return;

  //   const alreadyExists = serviceLines.some(
  //     (item) => item.label.toLowerCase() === trimmed.toLowerCase()
  //   );

  //   if (alreadyExists) return;

  //   const { data, error } = await supabase
  //     .from("service_line")
  //     .insert([{ name: trimmed }])
  //     .select()
  //     .single();

  //   if (error) {
  //     console.error("Service line insert error:", error);
  //     return;
  //   }

  //   const newOption = { value: data.id, label: data.name };
  //   const updated = [...selectedServiceLines, newOption];

  //   setServiceLines((prev) => [newOption, ...prev]);
  //   setSelectedServiceLines(updated);
  //   notifyParent(updated);

  //   setInputValue("");
  //   setSearchText("");
  // };

  const handleKeyDown = (e) => {
    // if (e.key === "Enter") {
    //   e.preventDefault();
    //   handleCreate();
    // }
  };

  const filteredServiceLines = getFilteredServiceLines();

  const allFilteredSelected =
    filteredServiceLines.length > 0 &&
    filteredServiceLines.every((item) =>
      selectedServiceLines.some(
        (selected) => selected.value === item.value
      )
    );

  const displayLabel =
    selectedServiceLines.length === 0
      ? "Services"
      : selectedServiceLines.length === 1
      ? selectedServiceLines[0].label
      : `${selectedServiceLines.length} Services`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {/* <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${
          selectedServiceLines.length > 0 ? "has-value" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="dropdown-trigger-label">{displayLabel}</span>
        <span className="dropdown-trigger-chevron">▼</span>
      </div> */}

      <div className="star-border-container" style={{ padding: "2px 0" }}>
  <div className="border-gradient-bottom" style={{ background: "radial-gradient(circle, #ffffff, transparent 10%)", animationDuration: "2.5s" }} />
  <div className="border-gradient-top" style={{ background: "radial-gradient(circle, #ffffff, transparent 10%)", animationDuration: "2.5s" }} />
  <div
    className={`dropdown-trigger inner-content ${isOpen ? "open" : ""} ${selectedServiceLines.length > 0 ? "has-value" : ""}`}
    onClick={() => setIsOpen((prev) => !prev)}
  >
    <span className="dropdown-trigger-label">{displayLabel}</span>
    <span className="dropdown-trigger-chevron">▼</span>
  </div>
</div>

      {isOpen && (
        <div className="dropdown-panel">
          <div className="dropdown-search-wrap">
            <input
              autoFocus
              type="text"
              placeholder="Search services..."
              value={searchText}
              className="dropdown-search"
              onChange={(e) => {
                setSearchText(e.target.value);
                setInputValue(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="dropdown-select-all" onClick={handleSelectAll}>
            <input type="checkbox" checked={allFilteredSelected} readOnly />
            <span>Select All</span>
          </div>

          {/* {filteredServiceLines.length === 0 && (
            <div className="dropdown-empty">
              No service lines found. Press Enter to create "{inputValue}"
            </div>
          )} */}
          {filteredServiceLines.length === 0 && (
            <div className="dropdown-empty">
              No services found.
            </div>
          )}

          {filteredServiceLines.map((option) => {
            const isChecked = selectedServiceLines.some(
              (selected) => selected.value === option.value
            );

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

          {/* {inputValue.trim() &&
            !serviceLines.some(
              (item) =>
                item.label.toLowerCase() === inputValue.trim().toLowerCase()
            ) && (
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

export default ServiceLine;