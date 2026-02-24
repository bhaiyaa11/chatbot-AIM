// import React, { useState, useEffect } from "react";
// import CreatableSelect from "react-select/creatable";
// import { supabase } from "../../supabase";

// function VideoTone({onChange}) {

//   const [VideoTone, setVideoTone] = useState([]);
//   const [selectedVideoTone, setSelectedVideoTonee] = useState(null);

//   // Load table from Supabase
//   const fetchVideoTone = async () => {
//     const { data, error } = await supabase
//       .from("video_tone")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (data) {
//       const formatted = data.map(c => ({
//         value: c.id,
//         label: c.name
//       }));
//       setVideoTone(formatted);
//     }
//   };

//   useEffect(() => {
//   fetchVideoTone();
//   }, []);

//   // When selecting
//   const handleChange = (option) => {
//     setSelectedVideoTonee(option);
//       const value = Array.isArray(option)
//     ? option.map(o => o.label).join(", ")
//     : option?.label ?? "";
//   onChange?.(value);  // ← notify parent

//   };


//   // When creating new BU
//   const handleCreate = async (inputValue) => {

//     const { data, error } = await supabase
//       .from("video_tone")
//       .insert([{ name: inputValue }])
//       .select()
//       .single();

//   //   if (!error && data) {

//   //     const newOption = {
//   //       value: data.id,
//   //       label: data.name
//   //     };

//   //     setVideoTone(prev => [...prev, newOption]);
//   //     setSelectedVideoTonee(newOption);
//   //   }
//   // };

//     if (!error && data) {
//       const newOption = { value: data.id, label: data.name };
//       setVideoTone(prev => [...prev, newOption]);
//       setSelectedVideoTonee(newOption);
//       onChange?.(newOption.label);  // ← notify parent on create too
//     }
//   };

//   return (
//     <form>
//       <CreatableSelect
//         placeholder="Video Tone"
//         options={VideoTone}
//         value={selectedVideoTone}
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

// export default VideoTone;




import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";

function VideoTone({ onChange }) {
  const [videoTones, setVideoTones] = useState([]);
  const [selectedVideoTones, setSelectedVideoTones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef(null);

  // Load table from Supabase
  const fetchVideoTone = async () => {
    const { data, error } = await supabase
      .from("video_tone")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const formatted = data.map((c) => ({
        value: c.id,
        label: c.name,
      }));
      setVideoTones(formatted);
    }
  };

  useEffect(() => {
    fetchVideoTone();
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

  // Select all / deselect all
  const handleSelectAll = () => {
    const filtered = getFilteredTones();
    const allSelected = filtered.every((c) =>
      selectedVideoTones.find((s) => s.value === c.value)
    );
    let updated;
    if (allSelected) {
      updated = selectedVideoTones.filter(
        (s) => !filtered.find((f) => f.value === s.value)
      );
    } else {
      const newOnes = filtered.filter(
        (f) => !selectedVideoTones.find((s) => s.value === f.value)
      );
      updated = [...selectedVideoTones, ...newOnes];
    }
    setSelectedVideoTones(updated);
    notifyParent(updated);
  };

  // Create new video tone in Supabase
  const handleCreate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("video_tone")
      .insert([{ name: trimmed }])
      .select()
      .single();

    if (!error && data) {
      const newOption = { value: data.id, label: data.name };
      setVideoTones((prev) => [newOption, ...prev]);
      const updated = [...selectedVideoTones, newOption];
      setSelectedVideoTones(updated);
      notifyParent(updated);
      setInputValue("");
      setSearchText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const match = videoTones.find(
        (c) => c.label.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (!match && inputValue.trim()) {
        handleCreate();
      }
    }
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
      : `${selectedVideoTones.length} tones selected`;

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
          color: selectedVideoTones.length === 0 ? "#888" : "white",
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
              placeholder="Search video tones..."
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
          {filteredTones.length === 0 && (
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

          {filteredTones.map((option) => {
            const isChecked = !!selectedVideoTones.find((s) => s.value === option.value);
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
            !videoTones.find(
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

export default VideoTone;
