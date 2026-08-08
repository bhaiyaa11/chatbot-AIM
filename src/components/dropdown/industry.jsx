import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import "./dropdown.css";

function Industrys({ onChange }) {
  const [industries, setIndustries] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  const fetchIndustries = async () => {
    const { data, error } = await supabase
      .from("industry")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Industry fetch error:", error);
      return;
    }

    const formatted = data.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    setIndustries(formatted);
  };

  useEffect(() => {
    fetchIndustries();
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

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const notifyParent = (selected) => {
    const value = selected.map((item) => item.label).join(", ");
    onChange?.(value);
  };

  const handleCheckboxChange = (option) => {
    const alreadySelected = selectedIndustries.some(
      (item) => item.value === option.value
    );

    const updated = alreadySelected
      ? selectedIndustries.filter((item) => item.value !== option.value)
      : [...selectedIndustries, option];

    setSelectedIndustries(updated);
    notifyParent(updated);
  };

  const getFilteredIndustries = () => {
    return industries.filter((item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleSelectAll = () => {
    const filtered = getFilteredIndustries();

    const allSelected = filtered.every((item) =>
      selectedIndustries.some((selected) => selected.value === item.value)
    );

    let updated;

    if (allSelected) {
      updated = selectedIndustries.filter(
        (selected) =>
          !filtered.some((item) => item.value === selected.value)
      );
    } else {
      const newItems = filtered.filter(
        (item) =>
          !selectedIndustries.some(
            (selected) => selected.value === item.value
          )
      );

      updated = [...selectedIndustries, ...newItems];
    }

    setSelectedIndustries(updated);
    notifyParent(updated);
  };

  // const handleCreate = async () => {
  //   const trimmed = inputValue.trim();

  //   if (!trimmed) return;

  //   const alreadyExists = industries.some(
  //     (item) => item.label.toLowerCase() === trimmed.toLowerCase()
  //   );

  //   if (alreadyExists) return;

  //   const { data, error } = await supabase
  //     .from("industry")
  //     .insert([{ name: trimmed }])
  //     .select()
  //     .single();

  //   if (error) {
  //     console.error("Industry insert error:", error);
  //     return;
  //   }

  //   const newOption = {
  //     value: data.id,
  //     label: data.name,
  //   };

  //   setIndustries((prev) => [newOption, ...prev]);

  //   const updated = [...selectedIndustries, newOption];

  //   setSelectedIndustries(updated);
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

  const filteredIndustries = getFilteredIndustries();

  const allFilteredSelected =
    filteredIndustries.length > 0 &&
    filteredIndustries.every((item) =>
      selectedIndustries.some(
        (selected) => selected.value === item.value
      )
    );

  const displayLabel =
    selectedIndustries.length === 0
      ? "Industry"
      : selectedIndustries.length === 1
      ? selectedIndustries[0].label
      : `${selectedIndustries.length} Industries`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {/* <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${
          selectedIndustries.length > 0 ? "has-value" : ""
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
    className={`dropdown-trigger inner-content ${isOpen ? "open" : ""} ${selectedIndustries.length > 0 ? "has-value" : ""}`}
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
              placeholder="Search industries..."
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

          {/* {filteredIndustries.length === 0 && (
            <div className="dropdown-empty">
              No industries found. Press Enter to create "{inputValue}"
            </div>
          )} */}
          {filteredIndustries.length === 0 && (
            <div className="dropdown-empty">
              No industries found.
            </div>
          )}

          {filteredIndustries.map((option) => {
            const isChecked = selectedIndustries.some(
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
            !industries.some(
              (item) =>
                item.label.toLowerCase() ===
                inputValue.trim().toLowerCase()
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

export default Industrys;