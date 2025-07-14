import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

// Earth texture data URL (simple blue marble effect)
const createEarthTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Create a simple earth-like texture
  const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
  gradient.addColorStop(0, '#4a90e2');
  gradient.addColorStop(0.5, '#2563eb');
  gradient.addColorStop(1, '#1e40af');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  
  // Add some continent-like shapes
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(100, 100, 40, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.ellipse(300, 80, 50, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.ellipse(400, 150, 30, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas;
};

// Convert lat/lng to 3D position on sphere
const latLngToVector3 = (lat, lng, radius = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Animated connection line component
const ConnectionLine = ({ start, end, progress = 1 }) => {
  const lineRef = useRef();
  
  useFrame(() => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array;
      const segmentCount = 50;
      
      // Ensure start and end points are on the surface (radius 2)
      const startSurface = start.clone().normalize().multiplyScalar(2);
      const endSurface = end.clone().normalize().multiplyScalar(2);
      
      // Calculate smooth curved path using spherical interpolation
      const startNorm = startSurface.clone().normalize();
      const endNorm = endSurface.clone().normalize();
      
      // Create quaternions for smooth rotation
      const quaternionStart = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), 
        startNorm
      );
      const quaternionEnd = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), 
        endNorm
      );
      
      for (let i = 0; i <= segmentCount; i++) {
        const t = i / segmentCount;
        const actualT = Math.min(t, progress);
        
        // Smooth quaternion interpolation
        const quaternion = new THREE.Quaternion()
          .slerpQuaternions(quaternionStart, quaternionEnd, actualT);
        
        // Apply height curve (starts at surface, arcs up, ends at surface)
        const heightMultiplier = 2.0 + Math.sin(actualT * Math.PI) * 0.8;
        
        // Get point on sphere surface
        const point = new THREE.Vector3(0, heightMultiplier, 0)
          .applyQuaternion(quaternion);
        
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }
      
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={51}
          array={new Float32Array(51 * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff6b6b" linewidth={3} />
    </line>
  );
};

// Location marker component
const LocationMarker = ({ position, label, color = "#ff6b6b" }) => {
  const markerRef = useRef();
  
  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={markerRef} args={[0.05, 16, 16]}>
        <meshBasicMaterial color={color} />
      </Sphere>
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Main Earth component
const Earth = ({ locations, connections, onEarthClick }) => {
  const earthRef = useRef();
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });
  
  const handleClick = (event) => {
    event.stopPropagation();
    
    // Get mouse position
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Cast ray
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(earthRef.current);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      // Convert 3D point back to lat/lng (approximate)
      const lat = Math.asin(point.y / 2) * (180 / Math.PI);
      const lng = Math.atan2(point.z, -point.x) * (180 / Math.PI);
      
      onEarthClick(lat, lng, point);
    }
  };
  
  const earthTexture = React.useMemo(() => {
    const canvas = createEarthTexture();
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  return (
    <>
      <Sphere ref={earthRef} args={[2, 64, 64]} onClick={handleClick}>
        <meshPhongMaterial map={earthTexture} />
      </Sphere>
      
      {locations.map((location, index) => (
        <LocationMarker
          key={index}
          position={location.position}
          label={location.label}
          color={location.color}
        />
      ))}
      
      {connections.map((connection, index) => (
        <ConnectionLine
          key={index}
          start={connection.start}
          end={connection.end}
          progress={connection.progress}
        />
      ))}
    </>
  );
};

// Main component
const InteractiveGlobe = () => {
  const [locations, setLocations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pingProgress, setPingProgress] = useState({});
  
  const handleEarthClick = (lat, lng, position) => {
    const newLocation = {
      id: Date.now(),
      position: position.clone(),
      label: `Point ${locations.length + 1}`,
      lat,
      lng,
      color: locations.length === 0 ? "#00ff00" : "#ff6b6b"
    };
    
    if (selectedLocation) {
      // Create connection
      const connectionId = `${selectedLocation.id}-${newLocation.id}`;
      const newConnection = {
        id: connectionId,
        start: selectedLocation.position,
        end: position.clone(),
        progress: 0
      };
      
      setConnections(prev => [...prev, newConnection]);
      setLocations(prev => [...prev, newLocation]);
      setSelectedLocation(null);
      
      // Animate ping
      animatePing(connectionId);
    } else {
      setLocations(prev => [...prev, newLocation]);
      setSelectedLocation(newLocation);
    }
  };
  
  const animatePing = (connectionId) => {
    const startTime = Date.now();
    const duration = 2000; // 2 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, progress }
            : conn
        )
      );
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };
  
  const clearAll = () => {
    setLocations([]);
    setConnections([]);
    setSelectedLocation(null);
  };
  
  const triggerPing = () => {
    connections.forEach(connection => {
      animatePing(connection.id);
    });
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Earth
          locations={locations}
          connections={connections}
          onEarthClick={handleEarthClick}
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
        />
        
        {/* Starfield background */}
        <mesh>
          <sphereGeometry args={[100, 64, 64]} />
          <meshBasicMaterial color="#000814" side={THREE.BackSide} />
        </mesh>
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        zIndex: 1000
      }}>
        <h2>Network Globe Visualizer</h2>
        <p>Click on the globe to place points and create connections</p>
        <p>Status: {selectedLocation ? 'Select destination point' : 'Select source point'}</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={clearAll}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
          <button
            onClick={triggerPing}
            disabled={connections.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: connections.length === 0 ? '#666' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: connections.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Trigger Ping
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGlobe;