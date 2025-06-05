import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const data = [
  [0.1, 0.2, 0.15, 0.25],
  [0.2, 0.9, 0.1, 0.3],
  [0.1, 0.15, 0.2, 0.18],
  [0.7, 0.2, 0.8, 0.1],
  [0.25, 0.1, 0.2, 0.15],
  [0.5, 0.2, 0.6, 0.1],
  [0.2, 0.1, 0.15, 0.25],
  [0.2, 0.8, 0.1, 0.9]
];

const types = ['Initial Access', 'Execution', 'Exploitation', 'Installation', 'Lateral Movement', 'Command and Control', 'Impact'];
const parameters = ['Network', 'Operational System', 'Applications', 'Files'];

const getColor = (value) => {
  if (value < 0.3) return new THREE.Color().setHSL(115 / 360, 0.34, 0.63); // green
  if (value < 0.6) return new THREE.Color().setHSL(52 / 360, 0.65, 0.68); // yellow
  return new THREE.Color().setHSL(3 / 360, 0.71, 0.61); // red
};

const Bars = () => {
  return (
    <group>
      {data.map((row, x) =>
        row.map((value, z) => {
          const height = value * 4;
          const color = getColor(value);
          return (
            <mesh
              key={`bar-${x}-${z}`}
              position={[
                x * 1.2 - 4.2,
                height / 2,
                z * 1.2 - 1.8
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.8, height, 0.8]} />
              <meshLambertMaterial color={color} />
            </mesh>
          );
        })
      )}
    </group>
  );
};

const Labels = () => {
  return (
    <group>
      {types.map((type, i) => (
        <Text
          key={`label-x-${i}`}
          position={[i * 1.2 - 4.2, -0.5, 3.2]}
          rotation={[0, Math.PI / 2, 0]} // rotate 90° left around Y axis
          fontSize={0.3}
          color="#000"
        >
          {type}
        </Text>
      ))}
      {parameters.map((param, i) => (
        <Text
          key={`label-z-${i}`}
          position={[4.8, -0.5, i * 1.2 - 1.8]}
          fontSize={0.3}
          color="#000"
        >
          {param}
        </Text>
      ))}
      {['Low', 'Medium', 'High'].map((label, i) => (
        <Text
          key={`label-y-${i}`}
          position={[5.5, (i + 1) * 1.3, 3]}
          fontSize={0.3}
          color="#000"
        >
          {label}
        </Text>
      ))}
    </group>
  );
};

const ThreeDBarChartCanvas = () => {
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 2]}
      camera={{ position: [8, 8, 8], zoom: 50 }}
    >
      <color attach="background" args={['#f0f2ff']} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 10, 5]}
        castShadow
        intensity={0.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <OrthographicCamera makeDefault position={[8, 8, 8]} zoom={50} />
      <Bars />
      <Labels />
      <OrbitControls enableRotate={true} enableZoom={false} />
    </Canvas>
  );
};

export default ThreeDBarChartCanvas;
