import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import './crt.css'
import Sidebar from './components/Sidebar'
import ThreeD_BarChart from './components/Chart/chart'
const modelUrl = "/assets/model.gltf"
import WorldMap from './components/WorldMap'
import World3D from './components/3dWorld'
import D3World from './components/D3World'
import Flatd3 from './components/flatd3'
import mock from './mock.json'

function Loading() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  )
}


const mockModels = mock.data.map((item, index) => ({
  id: item.id,
  label: item.name,
  ip: item.ip,
  active: item.status === 'active',
  score: item.scaScore ?? 0,
}))

function RaycasterController({ setHoveredIndex }) {
  const { camera, scene, raycaster, pointer } = useThree()

  useEffect(() => {
    const handlePointerMove = () => {
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      let obj = intersects[0]?.object
      while (obj && !obj.userData.hasOwnProperty('index')) obj = obj.parent
      setHoveredIndex(obj?.userData?.index ?? null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [camera, raycaster, scene, pointer, setHoveredIndex])

  return null
}

function Model({ position, scale = 0.5, index, hoveredIndex, setHoveredIndex, data }) {
  const ref = useRef()
  const { scene } = useGLTF(modelUrl)
  const [clicked, setClicked] = useState(false)
  const [showVideo, setShowVideo] = useState(false) // Start with radar
  const [clickCount, setClickCount] = useState(0)
  const clickTimeoutRef = useRef(null)
  const clonedScene = useRef()

  const isHovered = hoveredIndex === index
  const modelLabel = useMemo(() => data?.label || `Model ${index + 1}`, [data, index])
  const isActive = data?.active
  const ip = data?.ip || `192.168.0.${index + 10}`
  const score = data?.score ?? (30 + index * 7 % 70)

  // Handle radar double-click
  const handleRadarClick = (e) => {
    e.stopPropagation()

    setClickCount(prev => prev + 1)

    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // Set timeout to reset click count
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0)
    }, 300) // 300ms window for double-click

    // Check if it's a double-click
    if (clickCount + 1 >= 2) {
      setShowVideo(true)
      setClickCount(0)
      clearTimeout(clickTimeoutRef.current)
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  // Your existing useMemo and useEffect code for materials...
  useMemo(() => {
    if (scene && !clonedScene.current) {
      clonedScene.current = scene.clone(true)
      clonedScene.current.traverse((node) => {
        if (node.isMesh && node.material) {
          if (Array.isArray(node.material)) {
            node.material = node.material.map(mat => {
              const newMat = mat.clone()
              newMat.userData = { originalColor: mat.color?.clone() || new THREE.Color('orange') }
              return newMat
            })
          } else {
            node.material = node.material.clone()
            node.material.userData = { originalColor: node.material.color?.clone() || new THREE.Color('orange') }
          }
        }
      })
    }
  }, [scene])

  useEffect(() => {
    if (clonedScene.current) {
      clonedScene.current.traverse((node) => {
        if (node.isMesh && node.material) {
          const applyStyle = (mat) => {
            mat.transparent = true

            if (!isActive) {
              mat.opacity = 0.45
            } else {
              mat.opacity = 1
              if (isHovered) {
                mat.color.set('#b0ecff')
              } else {
                mat.color.copy(mat.userData?.originalColor ?? new THREE.Color('orange'))
              }
            }
          }

          if (Array.isArray(node.material)) node.material.forEach(applyStyle)
          else applyStyle(node.material)
        }
      })
    }
  }, [isHovered, isActive])

  if (!clonedScene.current && !scene) return null

  return (
    <group position={position}>
      <primitive
        ref={ref}
        object={clonedScene.current || scene.clone(true)}
        rotation={[0, Math.PI * 3 / 2, 0]}
        scale={[scale, scale, scale]}
        onClick={(e) => { e.stopPropagation(); setClicked(!clicked) }}
        userData={{ index }}
      />

      {isActive && (
        <Html position={[-0.28, 0.55, 0.28]} transform occlude rotation={[0, Math.PI / 2, 0]}>
          <div className="container" style={{
            background: 'white',
            color: 'black',
            fontSize: '2px',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            whiteSpace: 'nowrap',
            width: 20,
            height: 18
          }}>
            {showVideo ? (
              <iframe
                src="https://www.youtube.com/embed/5E3Yb4AWNNs"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  width: '200px',
                  height: '200px',
                  border: 'none',
                  transform: 'scale(0.1)',
                  transformOrigin: 'top left',
                }}
              />
            ) : (
              <img
                src="/assets/radar.gif"
                alt="Active Status"
                onClick={handleRadarClick}
                style={{
                  width: '20px',
                  height: '18px',
                  cursor: 'pointer',
                  filter: 'saturate(1000%)',
                }}
              />
            )}
          </div>
        </Html>
      )}

      {/* Your existing Html label code... */}
      <Html position={[-0.5, 2, 0.3]} center occlude>
        <div
          style={{
            background: isActive ? '#14324C' : '#0B1724',
            color: isActive ? 'white' : '#888',
            opacity: isActive ? 1 : 0.9,
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            marginBottom: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            minWidth: '140px',
            transition: 'opacity 0.3s, background-color 0.3s, color 0.3s',
          }}
        >
          <div style={{ marginBottom: '4px' }}>{modelLabel}</div>
          <div style={{ fontSize: '11px', color: isActive ? '#ccc' : '#666', marginBottom: '8px' }}>{ip}</div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#444', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${score}%`,
                backgroundColor: isActive ? '#00d8ff' : '#555',
                borderRadius: '3px',
              }}
            />
          </div>
          <div style={{ fontSize: '11px', textAlign: 'right', marginTop: '2px', color: isActive ? '#aaa' : '#666' }}>
            {`SCA: ${score}%`}
          </div>
        </div>
      </Html>
    </group>
  )
}

function ModelGrid() {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const spacing = 3.5

  return (
    <>
      <RaycasterController setHoveredIndex={setHoveredIndex} />
      {mockModels.map((model, index) => (
        <Model
          key={`model-${model.id}`}
          position={[(index % 4 - 1.5) * spacing, 0, (Math.floor(index / 4) - 1) * spacing]}
          index={index}
          scale={0.5}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          data={model}
        />
      ))}
    </>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState('3d')

  useEffect(() => {
    useGLTF.preload(modelUrl)
  }, [])

  const renderContent = () => {
    switch (currentView) {
      case '3d':
        return (
          <>
            <Canvas orthographic camera={{ zoom: 80, position: [10, 10, 10], near: 0.1, far: 1000 }}>
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
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 4}
              />
            </Canvas>

            <img
              src="/assets/logo.svg"
              alt="Logo"
              style={{ position: 'absolute', top: '10px', left: '10px', width: '200px', height: 'auto' }}
            />
          </>
        )
      case 'details':
        return (
          <>
            <ThreeD_BarChart />
            <img
              src="/assets/logo.svg"
              alt="Logo"
              style={{ position: 'absolute', top: '10px', left: '10px', width: '200px', height: 'auto' }}
            />
          </>
        )
      case 'worldmap':
        return (
          <>
            <WorldMap />
            <img
              src="/assets/logo.svg"
              alt="Logo"
              style={{ position: 'absolute', top: '10px', left: '10px', width: '200px', height: 'auto' }}
            />
          </ >
        )
      case '3dworld':
        return (
          <>
            <World3D />
            <img
              src="/assets/logo.svg"
              alt="Logo"
              style={{ position: 'absolute', top: '10px', left: '10px', width: '200px', height: 'auto' }}
            />
          </ >
        )
      case 'D3World':
        return (
          <>
            <D3World />
            <img
              src="/assets/logo.svg"
              alt="Logo"
              style={{ position: 'absolute', top: '10px', left: '10px', width: '200px', height: 'auto' }}
            />
          </ >
        )
      case 'flatd3':
        return (
          <>
            <Flatd3 />
            <img
              src="/assets/logo.svg"
              alt="Logo"
              style={{ position: 'absolute', top: '10px', left: '10px', width: '200px', height: 'auto' }}
            />
          </ >
        )
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative' }}>
        {renderContent()}
      </div>
    </div>
  )
}