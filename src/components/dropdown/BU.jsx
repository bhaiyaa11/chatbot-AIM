// import React, { useState, useEffect } from "react";
// import CreatableSelect from "react-select/creatable";
// import { supabase } from "../../supabase";

// function Business_Unit({onChange}) {

//   const [Business_Unit, setBusniess_Unit] = useState([]);
//   const [selectedBusiness_Unit, setSelectedBusiness_unit] = useState(null);

//   // Load BU from Supabase
//   const fetchBusiness_Unit = async () => {
//     const { data, error } = await supabase
//       .from("business_unit")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (data) {
//       const formatted = data.map(c => ({
//         value: c.id,
//         label: c.name
//       }));
//       setBusniess_Unit(formatted);
//     }
//   };

//   useEffect(() => {
//     fetchBusiness_Unit();
//   }, []);

//   // When selecting
//   const handleChange = (option) => {
//     setSelectedBusiness_unit(option);
//       const value = Array.isArray(option)
//     ? option.map(o => o.label).join(", ")
//     : option?.label ?? "";
//   onChange?.(value);  // ← notify parent
 
//   };

//   // When creating new BU
//   const handleCreate = async (inputValue) => {

//     const { data, error } = await supabase
//       .from("business_unit")
//       .insert([{ name: inputValue }])
//       .select()
//       .single();

//   //   if (!error && data) {

//   //     const newOption = {
//   //       value: data.id,
//   //       label: data.name
//   //     };

//   //     setBusniess_Unit(prev => [...prev, newOption]);
//   //     setSelectedBusiness_unit(newOption);
//   //   }
//   // };

//     if (!error && data) {
//       const newOption = { value: data.id, label: data.name };
//       setBusniess_Unit(prev => [...prev, newOption]);
//       setSelectedBusiness_unit(newOption);
//       onChange?.(newOption.label);  // ← notify parent on create too
//     }
//   };

//   return (
//     <form> 
//       <CreatableSelect
//         placeholder="Business Unit"
//         options={Business_Unit}
//         value={selectedBusiness_Unit}
//         onChange={handleChange}
//         onCreateOption={handleCreate}
//         isClearable
//         isMulti
//         styles={{
//           control: (provided) => ({
//             ...provided,
//             borderRadius: "40px",
//             backgroundColor: "black",
//             color: "white",
//             border: "1px solid #3a3a3a",
//             boxShadow: "0 20px 20px rgb(64, 59, 59)",
//           }),
//         }}
//       />
//     </form>
//   );
// }

// export default Business_Unit;






import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";

function Business_Unit({ onChange }) {
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  // Load BU from Supabase
  const fetchBusiness_Unit = async () => {
    const { data, error } = await supabase
      .from("business_unit")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const formatted = data.map((c) => ({
        value: c.id,
        label: c.name,
      }));
      setBusinessUnits(formatted);
    }
  };

  useEffect(() => {
    fetchBusiness_Unit();
  }, []);

  // Close dropdown on outside click
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

  // Notify parent whenever selection changes
  const notifyParent = (selected) => {
    const value = selected.map((o) => o.label).join(", ");
    onChange?.(value);
  };

  // Toggle a checkbox option
  const handleCheckboxChange = (option) => {
    const alreadySelected = selectedBusinessUnits.find((c) => c.value === option.value);
    let updated;
    if (alreadySelected) {
      updated = selectedBusinessUnits.filter((c) => c.value !== option.value);
    } else {
      updated = [...selectedBusinessUnits, option];
    }
    setSelectedBusinessUnits(updated);
    notifyParent(updated);
  };

  // Select all / deselect all
  const handleSelectAll = () => {
    const filtered = getFilteredUnits();
    const allSelected = filtered.every((c) =>
      selectedBusinessUnits.find((s) => s.value === c.value)
    );
    let updated;
    if (allSelected) {
      updated = selectedBusinessUnits.filter(
        (s) => !filtered.find((f) => f.value === s.value)
      );
    } else {
      const newOnes = filtered.filter(
        (f) => !selectedBusinessUnits.find((s) => s.value === f.value)
      );
      updated = [...selectedBusinessUnits, ...newOnes];
    }
    setSelectedBusinessUnits(updated);
    notifyParent(updated);
  };

  // Create new BU in Supabase
  const handleCreate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("business_unit")
      .insert([{ name: trimmed }])
      .select()
      .single();

    if (!error && data) {
      const newOption = { value: data.id, label: data.name };
      setBusinessUnits((prev) => [newOption, ...prev]);
      const updated = [...selectedBusinessUnits, newOption];
      setSelectedBusinessUnits(updated);
      notifyParent(updated);
      setInputValue("");
      setSearchText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const match = businessUnits.find(
        (c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (!match && inputValue.trim()) {
        handleCreate();
      }
    }
  };

  const getFilteredUnits = () => {
    const query = searchText.toLowerCase();
    return businessUnits.filter((c) => c.label.toLowerCase().includes(query));
  };

  const filteredUnits = getFilteredUnits();
  const allFilteredSelected =
    filteredUnits.length > 0 &&
    filteredUnits.every((c) => selectedBusinessUnits.find((s) => s.value === c.value));

  const displayLabel =
    selectedBusinessUnits.length === 0
      ? "Business Unit"
      : selectedBusinessUnits.length === 1
      ? selectedBusinessUnits[0].label
      : `${selectedBusinessUnits.length} units selected`;

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "40px",
          backgroundColor: "black",
          color: selectedBusinessUnits.length === 0 ? "#888" : "white",
          border: "1px solid #3a3a3a",
          boxShadow: "0 20px 20px rgb(64, 59, 59)",
          padding: "8px 16px",
          cursor: "pointer",
          minHeight: "38px",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "14px" }}>{displayLabel}</span>
        <span style={{ fontSize: "10px", color: "#888", marginLeft: "8px" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            backgroundColor: "#111",
            border: "1px solid #3a3a3a",
            borderRadius: "12px",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {/* Search bar */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #2a2a2a" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search business units..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setInputValue(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "6px",
                color: "white",
                padding: "6px 10px",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Select All */}
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid #222",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
            onClick={handleSelectAll}
          >
            <input
              type="checkbox"
              checked={allFilteredSelected}
              readOnly
              style={{ accentColor: "#4f8ef7", cursor: "pointer" }}
            />
            <span style={{ color: "#ccc", fontSize: "13px", fontWeight: 500 }}>
              Select All
            </span>
          </div>

          {/* Options */}
          {filteredUnits.length === 0 && (
            <div
              style={{
                padding: "10px 14px",
                color: "#666",
                fontSize: "13px",
              }}
            >
              <span>No results. Press Enter to create "{inputValue}"</span>
            </div>
          )}

          {filteredUnits.map((option) => {
            const isChecked = !!selectedBusinessUnits.find((s) => s.value === option.value);
            return (
              <div
                key={option.value}
                onClick={() => handleCheckboxChange(option)}
                style={{
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  backgroundColor: isChecked ? "#1a2a3a" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  !isChecked && (e.currentTarget.style.backgroundColor = "#1e1e1e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = isChecked ? "#1a2a3a" : "transparent")
                }
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  style={{ accentColor: "#4f8ef7", cursor: "pointer" }}
                />
                <span style={{ color: "white", fontSize: "13px" }}>{option.label}</span>
              </div>
            );
          })}

          {/* Create new option */}
          {inputValue.trim() &&
            !businessUnits.find(
              (c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()
            ) && (
              <div
                onClick={handleCreate}
                style={{
                  padding: "8px 14px",
                  color: "#4f8ef7",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderTop: "1px solid #222",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1a1a2e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span>＋</span>
                <span>Create "{inputValue.trim()}"</span>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default Business_Unit;
