// import Box from '@mui/material/Box';
// import Slider from '@mui/material/Slider';

// export default function SliderSizes() {
//   return (
//     <Box sx={{ width: 300 }}>
//       <Slider
//         size="small"
//         defaultValue={70}
//         aria-label="Small"
//         valueLabelDisplay="auto"
//       />
//       <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
//     </Box>
//   );
// }



import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

export default function SliderSizes({ value, onChange }) {
  return (
    <Box
      sx={{
        width: 180,
        padding: "0 10px",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,.6)",
          fontSize: "11px",
          marginBottom: "6px",
        }}
      >
        creativity: {value}
      </div>

      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        valueLabelDisplay="auto"
        min={0}
        max={100}
        color="black"
      />
    </Box>
  );
}