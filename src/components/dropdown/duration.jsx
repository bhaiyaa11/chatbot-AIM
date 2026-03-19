
// import { useState } from "react";


// const DURATION_OPTIONS = [
//   "30 seconds",
//   "60 seconds",
//   "90 seconds",
//   "2 minutes",
//   "3 minutes",
//   "5 minutes",
// ];

// function Duration({ onChange }) {
//   const [selected, setSelected] = useState("");

//   const handleChange = (e) => {
//     setSelected(e.target.value);
//     onChange(e.target.value);
//   };

//   return (
//     <select
//       className="dropdown"
//       value={selected}
//       onChange={handleChange}
//       style={{          
//         borderRadius: "40px",
//         backgroundColor: "black",
//         color: "rgb(136, 136, 136)",
//         border: "1px solid #3a3a3a",
//         boxShadow: "0 20px 20px rgb(64, 59, 59)",
//       }}
//     >
//       <option value="">Duration</option>
//       {DURATION_OPTIONS.map((opt) => (
//         <option key={opt} value={opt}>
//           {opt}
//         </option>
//       ))}
//     </select>
//   );
// }

// export default Duration;




import { useState } from "react";
import "./dropdown.css";

const DURATION_OPTIONS = [
  "30 seconds",
  "60 seconds",
  "90 seconds",
  "2 minutes",
  "3 minutes",
  "5 minutes",
];

function Duration({ onChange }) {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    setSelected(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="dropdown-select-wrap">
      <select
        className="dropdown-select"
        value={selected}
        onChange={handleChange}
        style={{ color: selected ? "#e5e5e5" : "#ababab" }}
      >
        <option value="">Duration</option>
        {DURATION_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default Duration;