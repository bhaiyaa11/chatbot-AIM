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
      color1="#1a1c26"
      color2="#24126b"
      color3="#3a135e"
      timeSpeed={0.3}
      colorBalance={0.35}
      warpStrength={1.05}
      warpFrequency={0}
      warpSpeed={0.2}
      warpAmplitude={5}
      blendAngle={-180}
      blendSoftness={0.21}
      rotationAmount={0}
      noiseScale={0}
      grainAmount={0.1}
      grainScale={1.3}
      grainAnimated={false}
      contrast={1.8}
      gamma={1.0}
      saturation={1.0}
      centerX={0.38}
      centerY={0.0}
      zoom={2.65}
    />
  </div>
);

export default AppBackground;