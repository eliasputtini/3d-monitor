import { useRef, useState, Suspense, useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import './crt.css'

const modelUrl = "/assets/model.gltf"

function Loading() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  )
}

const mock = {
  "count": 8,
  "data": [
    {
      "id": "110",
      "name": "win2019",
      "ip": "192.168.82.103",
      "os": {
        "name": "Microsoft Windows Server 2019 Standard Evaluation",
        "platform": "windows",
        "version": "10.0.17763"
      },
      "scaScore": 50,
      "group": [
        "windows",
        "servers"
      ],
      "status": "active",
      "lastKeepAlive": "2025-05-08T20:10:55Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2025-02-12T14:41:34Z",
      "category": "server",
      "customGroup": ""
    },
    {
      "id": "113",
      "name": "ubunturce",
      "ip": "192.168.82.105",
      "os": {
        "name": "Ubuntu",
        "platform": "ubuntu",
        "version": "18.04.6 LTS"
      },
      "scaScore": 10,
      "group": [
        "linux"
      ],
      "status": "active",
      "lastKeepAlive": "2025-05-08T20:10:55Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2025-04-30T14:51:49Z",
      "category": "endpoint",
      "customGroup": ""
    },
    {
      "id": "112",
      "name": "debian",
      "ip": "192.168.82.101",
      "os": {
        "name": "Debian GNU/Linux",
        "platform": "debian",
        "version": "11"
      },
      "scaScore": 20,
      "group": [
        "linux"
      ],
      "status": "inactive",
      "lastKeepAlive": "2025-05-08T20:10:52Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2025-04-08T13:54:20Z",
      "category": "endpoint",
      "customGroup": ""
    },
    {
      "id": "108",
      "name": "redhat-9",
      "ip": "192.168.82.104",
      "os": {
        "name": "Red Hat Enterprise Linux",
        "platform": "rhel",
        "version": "8.9"
      },
      "scaScore": 90,
      "group": [
        "linux"
      ],
      "status": "active",
      "lastKeepAlive": "2025-05-08T20:10:51Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2024-12-17T08:09:20Z",
      "category": "endpoint",
      "customGroup": ""
    },
    {
      "id": "115",
      "name": "lab",
      "ip": "192.168.82.100",
      "os": {
        "name": "Ubuntu",
        "platform": "ubuntu",
        "version": "22.04"
      },
      "scaScore": 0,
      "group": [
        "linux"
      ],
      "status": "active",
      "lastKeepAlive": "2025-05-08T20:10:51Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2025-05-06T12:37:37Z",
      "category": "endpoint",
      "customGroup": ""
    },
    {
      "id": "008",
      "name": "Vigilant-Sensor-Rocky",
      "ip": "192.168.82.108",
      "os": {
        "name": "Rocky Linux",
        "platform": "rocky",
        "version": "8.10"
      },
      "scaScore": 20,
      "group": [
        "sensores",
        "Sensores"
      ],
      "status": "inactive",
      "lastKeepAlive": "2025-05-08T20:10:50Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2024-02-06T21:39:07Z",
      "category": "sensor",
      "customGroup": "Sensores"
    },
    {
      "id": "104",
      "name": "WIN-276NJNFQ1S8",
      "ip": "192.168.82.102",
      "os": {
        "name": "Microsoft Windows Server 2019 Standard Evaluation",
        "platform": "windows",
        "version": "10.0.17763"
      },
      "scaScore": 30,
      "group": [
        "windows",
        "endpoint"
      ],
      "status": "active",
      "lastKeepAlive": "2025-05-08T20:10:49Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2024-12-11T13:17:17Z",
      "category": "endpoint",
      "customGroup": ""
    },
    {
      "id": "114",
      "name": "Teste",
      "ip": "192.168.15.8",
      "os": {
        "name": "Microsoft Windows 11 Pro",
        "platform": "windows",
        "version": "10.0.22631"
      },
      "scaScore": 40,
      "group": [
        "windows",
        "servers"
      ],
      "status": "disconnected",
      "lastKeepAlive": "2025-05-07T10:37:31Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2025-05-05T21:50:51Z",
      "category": "server",
      "customGroup": ""
    },
    {
      "id": "114",
      "name": "EMERSONSILV38BC",
      "ip": "192.168.15.81",
      "os": {
        "name": "Microsoft Windows 11 Pro",
        "platform": "windows",
        "version": "10.0.22631"
      },
      "scaScore": 40,
      "group": [
        "windows",
        "servers"
      ],
      "status": "disconnected",
      "lastKeepAlive": "2025-05-07T10:37:31Z",
      "manager": "Vigilant-LabMalware.vigilant.com.br",
      "node_name": "node01",
      "dateAdd": "2025-05-05T21:50:51Z",
      "category": "server",
      "customGroup": ""
    }
  ]
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
  const clonedScene = useRef()

  const isHovered = hoveredIndex === index
  const modelLabel = useMemo(() => data?.label || `Model ${index + 1}`, [data, index])
  const isActive = data?.active
  const ip = data?.ip || `192.168.0.${index + 10}`
  const score = data?.score ?? (30 + index * 7 % 70)

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
            mat.transparent = true // allow transparency

            if (!isActive) {
              mat.opacity = 0.5 // make it transparent 
            } else {
              mat.opacity = 1 // fully visible
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
        <Html position={[-0.27, 0.6, 0.29]} transform occlude rotation={[0, Math.PI / 2, 0]} pointerEvents='none'>
          <div class="container" style={{
            pointerEvents: 'none', background: 'white', color: 'black', fontSize: '2px', fontFamily: 'Arial, sans-serif', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', border: '1px solid #ddd', whiteSpace: 'nowrap', width: 20, height: 20
          }}> ON</div>
        </Html>
      )}

      <Html position={[0, 2, 0.3]} center occlude>
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
  useEffect(() => {
    useGLTF.preload(modelUrl)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
    </div>
  )
}


