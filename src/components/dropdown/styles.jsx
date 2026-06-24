import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import "./dropdown.css";

function Styles({ onChange }) {
  const [styles, setStyles] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  const fetchStyles = async () => {
    const { data, error } = await supabase
      .from("styles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Styles fetch error:", error);
      return;
    }

    const formatted = (data || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));

    setStyles(formatted);
  };

  useEffect(() => {
    fetchStyles();
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
    const alreadySelected = selectedStyles.some(
      (item) => item.value === option.value
    );

    const updated = alreadySelected
      ? selectedStyles.filter((item) => item.value !== option.value)
      : [...selectedStyles, option];

    setSelectedStyles(updated);
    notifyParent(updated);
  };

  const getFilteredStyles = () =>
    styles.filter((item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase())
    );

  const handleSelectAll = () => {
    const filtered = getFilteredStyles();

    const allSelected = filtered.every((item) =>
      selectedStyles.some((selected) => selected.value === item.value)
    );

    const updated = allSelected
      ? selectedStyles.filter(
          (selected) =>
            !filtered.some((item) => item.value === selected.value)
        )
      : [
          ...selectedStyles,
          ...filtered.filter(
            (item) =>
              !selectedStyles.some(
                (selected) => selected.value === item.value
              )
          ),
        ];

    setSelectedStyles(updated);
    notifyParent(updated);
  };

  const handleCreate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const alreadyExists = styles.some(
      (item) => item.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) return;

    const { data, error } = await supabase
      .from("styles")
      .insert([{ name: trimmed }])
      .select()
      .single();

    if (error) {
      console.error("Styles insert error:", error);
      return;
    }

    const newOption = { value: data.id, label: data.name };
    const updated = [...selectedStyles, newOption];

    setStyles((prev) => [newOption, ...prev]);
    setSelectedStyles(updated);
    notifyParent(updated);

    setInputValue("");
    setSearchText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  };

  const filteredStyles = getFilteredStyles();

  const allFilteredSelected =
    filteredStyles.length > 0 &&
    filteredStyles.every((item) =>
      selectedStyles.some((selected) => selected.value === item.value)
    );

  const displayLabel =
    selectedStyles.length === 0
      ? "Video Style"
      : selectedStyles.length === 1
      ? selectedStyles[0].label
      : `${selectedStyles.length} Styles`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${
          selectedStyles.length > 0 ? "has-value" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="dropdown-trigger-label">{displayLabel}</span>
        <span className="dropdown-trigger-chevron">▼</span>
      </div>

      {isOpen && (
        <div className="dropdown-panel">
          <div className="dropdown-search-wrap">
            <input
              autoFocus
              type="text"
              placeholder="Search styles..."
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

          {filteredStyles.length === 0 && (
            <div className="dropdown-empty">
              No styles found. Press Enter to create "{inputValue}"
            </div>
          )}

          {filteredStyles.map((option) => {
            const isChecked = selectedStyles.some(
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

          {inputValue.trim() &&
            !styles.some(
              (item) =>
                item.label.toLowerCase() === inputValue.trim().toLowerCase()
            ) && (
              <div className="dropdown-create" onClick={handleCreate}>
                <span className="dropdown-create-icon">＋</span>
                <span>Create "{inputValue.trim()}"</span>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default Styles;