import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
  Line,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json";

const flightRoute = {
  from: { coord: [-46.636, -23.548], city: "São Paulo" }, // São Paulo coordinates
  to: { coord: [2.349, 48.853], city: "Paris" }, // Paris, France coordinates
};

function ReactSimpleMap() {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  return (
    <div style={{ backgroundColor: "#000", height: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        
        .animated-line {
          stroke-dasharray: 10 5;
          animation: dash 1s linear infinite;
        }
        
        .pulsing-marker {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .draggable-map {
          cursor: grab;
        }
        
        .draggable-map:active {
          cursor: grabbing;
        }
      `}</style>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Sphere stroke="#888" fill="#000" strokeWidth={0.5} />
          <Graticule stroke="#333" strokeWidth={0.5} />

          <Geographies geography={geoUrl}>
            {({ geographies }) => {
              return geographies.map((geo) => {
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    stroke="#444"
                    strokeWidth={0.3}
                    fill="#2a2a2a"
                    style={{
                      default: {
                        fill: "#2a2a2a",
                        stroke: "#444",
                        strokeWidth: 0.3,
                        outline: "none",
                      },
                      hover: {
                        fill: "#3a3a3a",
                        stroke: "#555",
                        strokeWidth: 0.3,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#2a2a2a",
                        stroke: "#444",
                        strokeWidth: 0.3,
                        outline: "none",
                      },
                    }}
                  />
                );
              });
            }}
          </Geographies>

          {/* Animated flight route from São Paulo to Paris */}
          <g>
            <Line
              from={flightRoute.from.coord}
              to={flightRoute.to.coord}
              stroke="#ff6b6b"
              strokeWidth={2}
              strokeLinecap="round"
              className="animated-line"
            />
            <Marker coordinates={flightRoute.from.coord}>
              <circle r={4} fill="#ff6b6b" className="pulsing-marker" />
              <circle r={2} fill="#fff" />
            </Marker>
            <Marker coordinates={flightRoute.to.coord}>
              <circle r={4} fill="#ff6b6b" className="pulsing-marker" />
              <circle r={2} fill="#fff" />
            </Marker>
          </g>

          {/* City labels */}
          <Marker coordinates={flightRoute.from.coord}>
            <text
              textAnchor="middle"
              y={-10}
              style={{ fontFamily: "Arial", fontSize: "12px", fill: "#fff" }}
            >
              {flightRoute.from.city}
            </text>
          </Marker>
          <Marker coordinates={flightRoute.to.coord}>
            <text
              textAnchor="middle"
              y={-10}
              style={{ fontFamily: "Arial", fontSize: "12px", fill: "#fff" }}
            >
              {flightRoute.to.city}
            </text>
          </Marker>
        </ZoomableGroup>
      </ComposableMap>

      {/* Control instructions */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "rgba(255,255,255,0.2)",
        backdropFilter: 'blur(10px)',
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        fontFamily: "Arial"
      }}>
        <div>🖱️ Click and drag to pan</div>
        <div>🖱️ Scroll to zoom</div>
      </div>
    </div>
  );
}

export default ReactSimpleMap;