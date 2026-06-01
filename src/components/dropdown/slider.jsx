import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

export default function SliderSizes({ value, onChange }) {
  return (
    <Box sx={{ width: 180, px: 1 }}>
      <div
        style={{
          color: "rgba(255,255,255,.6)",
          fontSize: "11px",
          marginBottom: "6px",
          textAlign: "center",
        }}
      >
        Human AI Ratio: {value}
      </div>

      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        valueLabelDisplay="auto"
        min={0}
        max={100}
        color="black"
        shiftStep={30}
        step={10}
        marks
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "rgba(255,255,255,.6)",
          fontSize: "11px",
          marginTop: "-4px",

        }}
      >
        <span>HUMAN</span>
        <span>AI</span>
      </div>
    </Box>
  );
}




