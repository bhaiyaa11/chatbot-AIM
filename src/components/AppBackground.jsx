// AppBackground.jsx
import Grainient from './Grainient';

const AppBackground = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
    }}
  >
<Grainient
  color1="#0c0a14"
  color2="#1c1a46"
  color3="#2f2ba3"
  timeSpeed={0}
  colorBalance={0}
  warpStrength={1.05}
  warpFrequency={0}
  warpSpeed={0.1}
  warpAmplitude={5}
  blendAngle={-180}
  blendSoftness={0.21}
  rotationAmount={0}
  noiseScale={0}
  grainAmount={0.05}
  grainScale={1.5}
  grainAnimated={false}
  contrast={1.3}
  gamma={1.0}
  saturation={0.9}
  centerX={0}
  centerY={0}
  zoom={1}
/>
  </div>
);

export default AppBackground;