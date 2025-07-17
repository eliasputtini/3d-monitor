import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
  Line,
  ZoomableGroup
} from "react-simple-maps";

const geoUrl =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json";

export default function AnimatedLineFadeOut() {
  return (
    <div style={{ background: "#000", height: "100vh", overflow: "hidden" }}>

      {/* Control Card */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 10,
        margin: '20px 20px 0 20px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          🌍 Interactive World Map - Mercator
        </h1>


      </div>
      {/* Instructions overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '12px',
        lineHeight: '1.4',
        maxWidth: '300px'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>🕹️ Controls:</div>
        <div>🖱️ <strong>Drag</strong> to pan • <strong>Scroll</strong> to zoom</div>
        <div>🌍 <strong>Hover</strong> countries to highlight</div>
      </div>
      <style>{`
        html, body, #root {
          margin: 0; padding: 0; height: 100%; width: 100%;
          overflow: hidden;
        }
        svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        @keyframes drawLine {
          0% {
            stroke-dashoffset: 1000;
            opacity: 1;
          }
          70% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .animated-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 3s ease forwards infinite;
          stroke-linecap: round;
        }
      `}</style>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130 }}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Sphere stroke="#888" fill="#000" strokeWidth={0.5} />
          <Graticule stroke="#333" strokeWidth={0.5} />

          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  stroke="#444"
                  strokeWidth={0.3}
                  fill="#2a2a2a"
                  style={{
                    default: { fill: "#2a2a2a", outline: "none" },
                    hover: { fill: "#3a3a3a", outline: "none" },
                    pressed: { fill: "#2a2a2a", outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Your animated line */}
          <Line
            from={[2.3522, 48.8566]}
            to={[-74.006, 40.7128]}
            stroke="#FF5533"
            strokeWidth={4}
            strokeLinecap="round"
            className="animated-line"
          />

          {/* Markers */}
          <Marker coordinates={[2.3522, 48.8566]}>
            <circle r={4} fill="#FF5533" />
            <circle r={2} fill="#fff" />
          </Marker>

          <Marker coordinates={[-74.006, 40.7128]}>
            <circle r={4} fill="#FF5533" />
            <circle r={2} fill="#fff" />
          </Marker>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
