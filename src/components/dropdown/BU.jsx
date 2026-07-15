// import React, { useState, useEffect, useRef } from "react";
// import { supabase } from "../../supabase";
// import "./dropdown.css";

// function Business_Unit({ onChange }) {
//   const [businessUnits, setBusinessUnits] = useState([]);
//   const [selectedBusinessUnits, setSelectedBusinessUnits] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [inputValue, setInputValue] = useState("");
//   const dropdownRef = useRef(null);

//   const fetchBusiness_Unit = async () => {
//     const { data, error } = await supabase
//       .from("business_unit")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (data) {
//       const formatted = data.map((c) => ({ value: c.id, label: c.name }));
//       setBusinessUnits(formatted);
//     }
//   };

//   useEffect(() => { fetchBusiness_Unit(); }, []);

//   useEffect(() => {
//     const handleOutsideClick = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setIsOpen(false);
//         setSearchText("");
//       }
//     };
//     document.addEventListener("mousedown", handleOutsideClick);
//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, []);

//   const notifyParent = (selected) => {
//     const value = selected.map((o) => o.label).join(", ");
//     onChange?.(value);
//   };

//   const handleCheckboxChange = (option) => {
//     const alreadySelected = selectedBusinessUnits.find((c) => c.value === option.value);
//     let updated;
//     if (alreadySelected) {
//       updated = selectedBusinessUnits.filter((c) => c.value !== option.value);
//     } else {
//       updated = [...selectedBusinessUnits, option];
//     }
//     setSelectedBusinessUnits(updated);
//     notifyParent(updated);
//   };

//   const handleSelectAll = () => {
//     const filtered = getFilteredUnits();
//     const allSelected = filtered.every((c) => selectedBusinessUnits.find((s) => s.value === c.value));
//     let updated;
//     if (allSelected) {
//       updated = selectedBusinessUnits.filter((s) => !filtered.find((f) => f.value === s.value));
//     } else {
//       const newOnes = filtered.filter((f) => !selectedBusinessUnits.find((s) => s.value === f.value));
//       updated = [...selectedBusinessUnits, ...newOnes];
//     }
//     setSelectedBusinessUnits(updated);
//     notifyParent(updated);
//   };

//   const handleCreate = async () => {
//     const trimmed = inputValue.trim();
//     if (!trimmed) return;
//     const { data, error } = await supabase.from("business_unit").insert([{ name: trimmed }]).select().single();
//     if (!error && data) {
//       const newOption = { value: data.id, label: data.name };
//       setBusinessUnits((prev) => [newOption, ...prev]);
//       const updated = [...selectedBusinessUnits, newOption];
//       setSelectedBusinessUnits(updated);
//       notifyParent(updated);
//       setInputValue("");
//       setSearchText("");
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const match = businessUnits.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase());
//       if (!match && inputValue.trim()) handleCreate();
//     }
//   };

//   const getFilteredUnits = () => {
//     const query = searchText.toLowerCase();
//     return businessUnits.filter((c) => c.label.toLowerCase().includes(query));
//   };

//   const filteredUnits = getFilteredUnits();
//   const allFilteredSelected =
//     filteredUnits.length > 0 &&
//     filteredUnits.every((c) => selectedBusinessUnits.find((s) => s.value === c.value));

//   const displayLabel =
//     selectedBusinessUnits.length === 0
//       ? "Business Unit"
//       : selectedBusinessUnits.length === 1
//       ? selectedBusinessUnits[0].label
//       : `${selectedBusinessUnits.length} units`;

//   return (
//     <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>

//       {/* ── Trigger ── */}
//       <div
//         className={`dropdown-trigger ${isOpen ? "open" : ""} ${selectedBusinessUnits.length > 0 ? "has-value" : ""}`}
//         onClick={() => setIsOpen((prev) => !prev)}
//       >
//         <span className="dropdown-trigger-label">{displayLabel}</span>
//         <span className="dropdown-trigger-chevron">▼</span>
//       </div>

//       {/* ── Panel ── */}
//       {isOpen && (
//         <div className="dropdown-panel">

//           <div className="dropdown-search-wrap">
//             <input
//               autoFocus
//               type="text"
//               placeholder="Search business units..."
//               value={searchText}
//               className="dropdown-search"
//               onChange={(e) => { setSearchText(e.target.value); setInputValue(e.target.value); }}
//               onKeyDown={handleKeyDown}
//             />
//           </div>

//           <div className="dropdown-select-all" onClick={handleSelectAll}>
//             <input type="checkbox" checked={allFilteredSelected} readOnly />
//             <span>Select All</span>
//           </div>

//           {filteredUnits.length === 0 && (
//             <div className="dropdown-empty">
//               No results. Press Enter to create "{inputValue}"
//             </div>
//           )}

//           {filteredUnits.map((option) => {
//             const isChecked = !!selectedBusinessUnits.find((s) => s.value === option.value);
//             return (
//               <div
//                 key={option.value}
//                 className={`dropdown-option ${isChecked ? "checked" : ""}`}
//                 onClick={() => handleCheckboxChange(option)}
//               >
//                 <input type="checkbox" checked={isChecked} readOnly />
//                 <span>{option.label}</span>
//               </div>
//             );
//           })}

//           {inputValue.trim() && !businessUnits.find((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()) && (
//             <div className="dropdown-create" onClick={handleCreate}>
//               <span className="dropdown-create-icon">＋</span>
//               <span>Create "{inputValue.trim()}"</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default Business_Unit;