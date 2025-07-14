// App.jsx ou InteractiveGlobe.jsx
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import R3fGlobe from 'r3f-globe';

const GlobeViz = () => {
  // Coordenadas de São Paulo e França
  const spCoords = { lat: -23.5505, lng: -46.6333 };
  const franceCoords = { lat: 46.2276, lng: 2.2137 };

  // Dados do arco de São Paulo para França
  const arcsData = useMemo(() => [
    {
      startLat: spCoords.lat,
      startLng: spCoords.lng,
      endLat: franceCoords.lat,
      endLng: franceCoords.lng,
      color: '#ff6b6b'
    }
  ], []);

  // Dados dos anéis de propagação nos IPs
  const ringsData = useMemo(() => [
    // Anéis em São Paulo
    {
      lat: spCoords.lat,
      lng: spCoords.lng,
      maxRadius: 8,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: '#ff6b6b'
    },
    // Anéis na França
    {
      lat: franceCoords.lat,
      lng: franceCoords.lng,
      maxRadius: 12,
      propagationSpeed: 0.8,
      repeatPeriod: 2000,
      color: '#4ecdc4'
    }
  ], []);

  // Dados dos rótulos com IP 192.168.0.1
  const labelsData = useMemo(() => [
    {
      lat: spCoords.lat,
      lng: spCoords.lng,
      text: 'SP - IP: 192.168.0.1',
      color: '#ffffff',
      size: 1.2
    },
    {
      lat: franceCoords.lat,
      lng: franceCoords.lng,
      text: 'France - IP: 192.168.0.1',
      color: '#ffffff',
      size: 1.2
    }
  ], []);

  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"

      // Arco
      arcsData={arcsData}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcStroke={0.5}
      arcAltitude={0.3}
      arcDashLength={0.8}
      arcDashGap={0.6}
      arcDashAnimateTime={2000}

      // Anéis de propagação
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringMaxRadius="maxRadius"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      ringColor="color"

      // Rótulos
      labelsData={labelsData}
      labelLat="lat"
      labelLng="lng"
      labelText="text"
      labelColor="color"
      labelSize="size"
      labelAltitude={0.01}
      labelIncludeDot={true}
      labelDotRadius={0.3}
    />
  );
};

export default function SimpleGlobeApp() {
  return (
    <div style={{ height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 350], fov: 50 }}>
        <OrbitControls
          minDistance={101}
          maxDistance={1000}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.1}
        />
        <color attach="background" args={['#000']} />
        <ambientLight intensity={Math.PI} />
        <directionalLight intensity={0.6 * Math.PI} />
        <GlobeViz />
      </Canvas>
    </div>
  );
}