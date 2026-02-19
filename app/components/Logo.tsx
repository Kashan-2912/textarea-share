// Effect inspired by Paper's Liquid Metal effect
  
import MetallicPaint from "./MetallicPaint";

// Replace with your own SVG path
// NOTE: Your SVG should have padding around the shape to prevent cutoff
// It should have a black fill color to allow the metallic effect to show through
const logo = "/logo.svg";

export default function Logo() {
  return (
    <div style={{ width: '100%', height: '30px', position: 'relative' }}>
      {/* Mobile: Simple SVG (lg:hidden) */}
      <img 
        src={logo} 
        alt="Share Pad Logo" 
        className="block lg:hidden h-full w-auto object-contain"
      />

      {/* Desktop: Metallic Paint (hidden lg:block) */}
      <div className="hidden lg:block w-full h-full">
        <MetallicPaint
          imageSrc={logo}
          // Pattern
          seed={42}
          scale={4}
          patternSharpness={1}
          noiseScale={0.5}
          // Animation
          speed={0.1}
          liquid={0.75}
          mouseAnimation={false}
          // Visual
          brightness={2}
          contrast={0.5}
          refraction={0.01}
          blur={0.015}
          chromaticSpread={2}
          fresnel={1}
          angle={0}
          waveAmplitude={1}
          distortion={1}
          contour={0.2}
          // Colors
          lightColor="#ffea00"
          darkColor="#0011ff"
          tintColor="#a8e524"
        />
      </div>
    </div>
  );
}