import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Simple loading component for Suspense fallback
function Loading() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  )
}

// Individual model component
function Model({ position, scale = 0.5 }) {
  const ref = useRef()
  const modelUrl = "/assets/model.gltf" // Update this path to match your file location
  const { scene } = useGLTF(modelUrl)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Create a unique clone with unique materials
  const clonedScene = useRef()
  
  // Clone the scene and its materials once with useMemo
  useMemo(() => {
    if (scene && !clonedScene.current) {
      // Deep clone the scene
      clonedScene.current = scene.clone(true)
      
      // Clone all materials to make them unique
      clonedScene.current.traverse((node) => {
        if (node.isMesh && node.material) {
          // Handle both single materials and material arrays
          if (Array.isArray(node.material)) {
            node.material = node.material.map(mat => {
              const newMat = mat.clone()
              // Store original color
              newMat.userData = newMat.userData || {}
              newMat.userData.originalColor = newMat.color ? newMat.color.clone() : new THREE.Color('orange')
              return newMat
            })
          } else {
            node.material = node.material.clone()
            // Store original color
            node.material.userData = node.material.userData || {}
            node.material.userData.originalColor = node.material.color ? 
              node.material.color.clone() : new THREE.Color('orange')
          }
        }
      })
    }
    return true
  }, [scene])
  
  // Implement a debounced hover effect to prevent rapid changes
  useEffect(() => {
    let timeoutId = null;
    
    if (clonedScene.current) {
      // Clear any pending timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      // Set a timeout to apply the hover effect
      timeoutId = setTimeout(() => {
        clonedScene.current.traverse((node) => {
          if (node.isMesh && node.material) {
            try {
              // Handle both single materials and material arrays
              if (Array.isArray(node.material)) {
                node.material.forEach(mat => {
                  if (mat.color) {
                    if (hovered) {
                      mat.color.set('hotpink')
                    } else if (mat.userData && mat.userData.originalColor) {
                      mat.color.copy(mat.userData.originalColor)
                    }
                  }
                })
              } else if (node.material.color) {
                if (hovered) {
                  node.material.color.set('hotpink')
                } else if (node.material.userData && node.material.userData.originalColor) {
                  node.material.color.copy(node.material.userData.originalColor)
                }
              }
            } catch (error) {
              console.error("Error applying hover effect:", error)
            }
          }
        })
      }, 50); // Small delay to prevent flickering
    }
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hovered])
  
  // Handle click/scale effect
  useEffect(() => {
    if (ref.current) {
      ref.current.scale.set(
        clicked ? scale * 1.5 : scale,
        clicked ? scale * 1.5 : scale,
        clicked ? scale * 1.5 : scale
      )
    }
  }, [clicked, scale])

  // Only render if we have a cloned scene
  if (!clonedScene.current && !scene) return null

  return (
    <primitive
      ref={ref}
      object={clonedScene.current || scene.clone(true)}
      position={position}
      rotation={[0, -1.5, 0]} // All models facing same direction
      scale={[scale, scale, scale]}
      onClick={() => setClicked(!clicked)}
      onPointerEnter={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
    />
  )
}

// Create 10 models arranged in a grid
function ModelGrid() {
  const gridSize = 3 // 3x3 grid + 1 extra = 10 models
  const spacing = 3.5 // Increased spacing for larger models
  
  const modelPositions = []
  
  // Generate positions for 10 models
  let modelCount = 0
  for (let x = 0; x < gridSize + 1; x++) {
    for (let z = 0; z < gridSize; z++) {
      if (modelCount < 10) {
        const posX = (x - gridSize / 2) * spacing
        const posZ = (z - gridSize / 2) * spacing
        modelPositions.push([posX, 0, posZ])
        modelCount++
      }
    }
  }
  
  return (
    <>
      {modelPositions.map((position, index) => (
        <Model 
          key={`model-${index}`} 
          position={position}
          scale={0.5} // Adjust this value based on your model size
        />
      ))}
    </>
  )
}

// Preload the model to improve performance
const modelUrl = "/assets/model.gltf" // Update this path to match your file location

export default function App() {
  // Preload the model once at the app level
  useEffect(() => {
    useGLTF.preload(modelUrl)
  }, [])
  
  return (
    <Canvas 
      orthographic 
      camera={{ 
        zoom: 40, 
        position: [10, 10, 10],
        near: 0.1,
        far: 1000
      }}
    >
      <color attach="background" args={['#f0f2ff']} />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <directionalLight intensity={0.8} position={[5, 5, 5]} />
      
      <Suspense fallback={<Loading />}>
        <ModelGrid />
      </Suspense>
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        makeDefault
        target={[0, 0, 0]}
        // Isometric view angles
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 4}
      />
    </Canvas>
  )
}