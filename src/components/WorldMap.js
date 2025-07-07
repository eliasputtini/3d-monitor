import DottedMap from "dotted-map";
import { useState } from "react";

const map = new DottedMap({ height: 60, grid: "vertical" });

map.addPin({ lat: 22.272741, lng: 78.511807, data: "Point 1" });
map.addPin({ lat: 48.8534, lng: 2.3488, data: "Point 2" });

const points = map.getPoints();
const pins = points.filter((point) => point.data);

const svgOptions = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    radius: 0.2,
};

export default function WorldMap() {
    const [pin, setActivePin] = useState(pins[0]);
    const [hoveredPin, setHoveredPin] = useState(null);

    // Calculate proper viewBox based on actual point coordinates
    const allX = points.map((p) => p.x);
    const allY = points.map((p) => p.y);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    // Add some padding around the edges
    const padding = 2;
    const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2
        } ${maxY - minY + padding * 2}`;

    return (
        <div className="App">
            <style jsx>{`
        .App {
          font-family: Arial, sans-serif; 
          background-color: white;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .button-container {
          display: flex;
          gap: 10px;
          padding: 10px 20px;
          flex-shrink: 0;
          background: white;
          border-bottom: 1px solid #ddd;
          overflow: hidden;
          justify-content: center;
        }

        button {
          padding: 8px 16px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }

        button:hover {
          background: #e0e0e0;
        }

        .svg-container {
          flex: 1;
          padding: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }

        svg {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          border: 1px solid #ddd;
          border-radius: 8px;
          object-fit: contain;
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #333;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 14px;
          z-index: 1000;
          pointer-events: none;
        }

        .blink {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0.3;
          }
        }
      `}</style>

            <div className="button-container">
                {pins.map((pinItem) => (
                    <button
                        key={pinItem.data}
                        type="button"
                        onClick={() => setActivePin(pinItem)}
                    >
                        {pinItem.data}
                    </button>
                ))}
            </div>

            <div className="svg-container">
                <svg viewBox={viewBox} style={{ background: svgOptions.backgroundColor }}>
                    {points.map((point) => (
                        <circle
                            key={`${point.x}-${point.y}`}
                            cx={point.x}
                            cy={point.y}
                            r={
                                pin.data === point.data
                                    ? svgOptions.radius * 2
                                    : svgOptions.radius
                            }
                            fill={pin.data === point.data ? "#FF4136" : svgOptions.color}
                            stroke={pin.data === point.data ? "#FF851B" : "none"}
                            strokeWidth={pin.data === point.data ? 0.3 : 0}
                            className={pin.data === point.data ? "blink" : ""}
                            style={{
                                opacity: pin.data === point.data ? 1 : 0.25,
                                filter:
                                    pin.data === point.data
                                        ? "drop-shadow(0 0 1px #FF4136)"
                                        : "none",
                                transition: pin.data === point.data ? "none" : "all 0.2s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={() => setHoveredPin(point)}
                            onMouseLeave={() => setHoveredPin(null)}
                        />
                    ))}
                </svg>
            </div>

            {hoveredPin && hoveredPin.data && (
                <div className="toast">Hovering over: {hoveredPin.data}</div>
            )}
        </div>
    );
}