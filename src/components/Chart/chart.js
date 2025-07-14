import React, { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Modified data with mostly zeros (empty spaces) and some low/medium/high values
const data = [
  [0, 0.8, 0, 0.9],
  [0, 0.9, 0, 0.2],
  [0, 0.15, 0, 0],
  [0.7, 0, 0.8, 0],
  [0.25, 0, 0, 0],
  [0.5, 0, 0.6, 0.1],
  [0, 0, 0.15, 0],
];

const types = ['Initial Access', 'Execution', 'Exploitation', 'Installation', 'Lateral Movement', 'Command and Control', 'Impact'];
const parameters = ['Network', 'Operational System', 'Applications', 'Files'];

const getColor = (value) => {
  if (value < 0.3) return new THREE.Color().setHSL(115 / 360, 1, 0.63); // green
  if (value < 0.6) return new THREE.Color().setHSL(52 / 360, 1, 0.68); // yellow
  return new THREE.Color().setHSL(3 / 360, 1, 0.61); // red
};
const getColorCSS = (value) => {
  if (value < 0.3) return 'hsl(115, 34%, 63%)';
  if (value < 0.6) return 'hsl(52, 65%, 68%)';
  return 'hsl(3, 71%, 61%)';
};

const Grid = () => {
  return (
    <group>


      {/* Horizontal lines (Z-axis) - Black */}
      {Array.from({ length: 5 }, (_, i) => {
        const z = i * 1.2 - 2.4;
        return (
          <line key={`horizontal-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  -4.8, 0, z,
                  3.6, 0, z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#14213d" opacity={0.6} transparent />
          </line>
        );
      })}

      {/* Black line in the corner */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-4.8, 0, -2.4, -4.8, 4, -2.4])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#14213d" />
      </line>
    </group>
  );
};


import { Html } from '@react-three/drei';

const Bars = () => {
  return (
    <group>
      {data.map((row, x) =>
        row.map((value, z) => {
          if (value === 0) return null;
          const height = value * 4;
          const color = getColor(value);
          const position = [x * 1.2 - 4.2, height + 0.5, z * 1.2 - 1.8];

          return (
            <group key={`bar-${x}-${z}`}>
              {/* Bar */}
              <mesh
                position={[
                  x * 1.2 - 4.2,
                  height / 2,
                  z * 1.2 - 1.8
                ]}
                castShadow={false}
                receiveShadow={true}

              >
                <boxGeometry args={[0.8, height, 0.8]} />
                <meshLambertMaterial color={color} />
              </mesh>

              {/* HTML Label (always faces camera) */}
              <Html
                position={position}
                center
                occlude
                style={{
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div style={{
                  backgroundColor: getColorCSS(value),
                  padding: '2px 6px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  whiteSpace: 'nowrap'
                }}>
                  {10 * value.toFixed(1)}
                </div>
              </Html>
            </group>
          );
        })
      )}
    </group>
  );
};

const Labels = ({ isTopView }) => {
  return (
    <group>
      {types.map((type, i) => (
        <Text
          key={`label-x-${i}`}
          position={[i * 1.2 - 4.2, 0, 5.5]}
          rotation={
            isTopView
              ? [-Math.PI / 2, 0, Math.PI / 2] // upright for top view
              : [0, Math.PI / 2, 0] // flat for angle view
          }
          fontSize={0.3}
          color="#14213d"
          anchorX="left" // 👈 aligns to left
          anchorY="middle"
        >
          {type}
        </Text>
      ))}
      {parameters.map((param, i) => (
        <Text
          key={`label-z-${i}`}
          position={[4, 0, i * 1.2 - 1.8]}
          rotation={
            isTopView
              ? [-Math.PI / 2, 0, 0] // upright for top view
              : [2 * Math.PI, 0, 0] // flat for angle view
          }
          fontSize={0.3}
          color="#14213d"
          anchorX="left" // 👈 aligns to left
          anchorY="middle"
        >
          {param}
        </Text>
      ))}
    </group>
  );
};



const CameraController = ({ isTopView, onTransitionComplete }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const currentUp = useRef(new THREE.Vector3(0, 1, 0)); // Start with Y-up
  const targetUp = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);
  const transitionProgress = useRef(0);

  // Views
  const angleView = {
    position: new THREE.Vector3(8, 8, 8),
    zoom: 50,
    up: new THREE.Vector3(0, 1, 0) // Y-up for angled view
  };

  const topView = {
    position: new THREE.Vector3(0, 15, 0),
    zoom: 80,
    up: new THREE.Vector3(-1, 0, 0) // X-down for top view (as per your working case)
  };

  useFrame((state, delta) => {
    if (isTransitioning.current) {
      transitionProgress.current += delta * 2; // Adjust speed here

      if (transitionProgress.current >= 1) {
        transitionProgress.current = 1;
        isTransitioning.current = false;
        if (onTransitionComplete) onTransitionComplete();
      }

      const progress = THREE.MathUtils.smoothstep(transitionProgress.current, 0, 1);
      const target = isTopView ? topView : angleView;

      // Interpolate position
      camera.position.lerpVectors(currentPosition.current, target.position, progress);

      // Interpolate zoom
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, target.zoom, progress);
      camera.updateProjectionMatrix();

      // Interpolate up vector smoothly
      const newUp = new THREE.Vector3().lerpVectors(
        currentUp.current,
        targetUp.current,
        progress
      );
      camera.up.copy(newUp);
      camera.lookAt(0, 0, 0);
    }
  });

  React.useEffect(() => {
    currentPosition.current.copy(camera.position);
    const target = isTopView ? topView : angleView;
    targetPosition.current.copy(target.position);

    // Store current and target up vectors
    currentUp.current.copy(camera.up);
    targetUp.current.copy(isTopView ? topView.up : angleView.up);

    isTransitioning.current = true;
    transitionProgress.current = 0;
  }, [isTopView]);

  return null;
};

const ThreeDBarChartCanvas = () => {
  const [isTopView, setIsTopView] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleView = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setIsTopView(!isTopView);
    }
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  return (
    <>
      <button
        onClick={toggleView}
        disabled={isTransitioning}
        style={{
          position: 'absolute',
          left: '10%',
          top: '50%',
          padding: '10px 16px',
          borderRadius: '8px',
          fontWeight: 500,
          backgroundColor: isTransitioning ? '#aaa' : '#2563eb', // gray or blue
          color: isTransitioning ? '#eee' : '#fff',
          cursor: isTransitioning ? 'not-allowed' : 'pointer',
          boxShadow: isTransitioning ? 'none' : '0 4px 10px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          transform: isTransitioning ? 'none' : 'scale(1.0)',
          zIndex: 10,
        }}
      >
        {isTransitioning ? 'Switching...' : isTopView ? 'Angle View' : 'Top View'}
      </button>


      <Canvas
        orthographic
        dpr={[1, 2]}
        camera={{ position: [8, 8, 8], zoom: 50 }}
      >
        <color attach="background" args={['#f0f2ff']} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[8, 10, 5]}
          intensity={0.6}
        />
        <OrthographicCamera makeDefault position={[8, 8, 8]} zoom={50} />
        <CameraController
          isTopView={isTopView}
          onTransitionComplete={handleTransitionComplete}
        />

        <Grid />
        <Bars />
        <Labels isTopView={isTopView} />
        <OrbitControls
          enableRotate={!isTopView}
          enableZoom={true}
          enablePan={true}
        />
      </Canvas>
    </>
  );
};

export default ThreeDBarChartCanvas;