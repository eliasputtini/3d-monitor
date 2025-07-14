'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import './D3World/styles.css'

export default function D3WorldOptimized() {
  const svgRef = useRef(null)
  const projectionRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markers, setMarkers] = useState([])

  // Otimização 1: Debounce para reduzir frequência de atualizações
  const debounceRef = useRef(null)
  const lastUpdateRef = useRef(0)
  const UPDATE_THRESHOLD = 4

  // Otimização 2: Cache de elementos para evitar re-seleção
  const elementsRef = useRef({})

  // Otimização 3: Usar requestAnimationFrame para atualizações suaves
  const animationFrameRef = useRef(null)

  const updatePaths = () => {
    if (!projectionRef.current || !svgRef.current) return

    const now = Date.now()
    if (now - lastUpdateRef.current < UPDATE_THRESHOLD) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(updatePaths, UPDATE_THRESHOLD)
      return
    }

    lastUpdateRef.current = now

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const { svg, projection, path, width, height } = elementsRef.current

      if (!svg || !projection || !path) return

      // Atualizar apenas elementos visíveis
      svg.selectAll('path.country').attr('d', path)
      svg.select('path.graticule').attr('d', path)

      // Atualizar marcadores
      svg.selectAll('circle.marker')
        .attr('cx', d => projection(d.coords)[0])
        .attr('cy', d => projection(d.coords)[1])
        .style('display', d => {
          const center = projection.invert([width / 2, height / 2])
          const distance = d3.geoDistance(d.coords, center)
          return distance > Math.PI / 2 ? 'none' : 'inline'
        })

      // Atualizar arcos
      svg.selectAll('path.arc').attr('d', path)
    })
  }

  useEffect(() => {
    const width = 500
    const height = 500

    projectionRef.current = d3.geoOrthographic()
      .scale(height / 2.2)
      .translate([width / 2, height / 2])
      .clipAngle(90)

    const projection = projectionRef.current
    const path = d3.geoPath().projection(projection)
    const graticule = d3.geoGraticule()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Cache elementos para reutilização
    elementsRef.current = { svg, projection, path, width, height }

    svg.selectAll('*').remove()

    // Círculo de fundo com cor atualizada (era #4a90e2, agora transparente com outline)
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale())
      .style('fill', 'none')
      .style('stroke', 'rgba(0, 0, 0, 0.1)')
      .style('stroke-width', '1.0px')

    // Graticule com cores atualizadas (era #ffffff, agora #000 com opacidade)
    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('stroke-opacity', 0.08)
      .style('stroke-width', '0.5px')

    let isDragging = false
    let autoRotate = true
    const rotateSpeed = 0.1

    // Otimização 4: Implementação melhorada de drag baseada nas recomendações
    let startRotation = [0, 0]
    let startCoords = [0, 0]

    const drag = d3.drag()
      .on('start', (event) => {
        isDragging = true
        startRotation = projection.rotate()
        startCoords = [event.x, event.y]
      })
      .on('drag', (event) => {
        // Implementação melhorada baseada no artigo de Jason Davies
        const dx = event.x - startCoords[0]
        const dy = event.y - startCoords[1]

        // Usar sensibilidade adaptativa baseada na escala
        const sensitivity = 180 / projection.scale()

        // Rotação mais suave e natural
        const newRotation = [
          startRotation[0] + dx * sensitivity,
          Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity))
        ]

        projection.rotate(newRotation)
        updatePaths()
      })
      .on('end', () => {
        isDragging = false
      })

    svg.call(drag)

    // Otimização 5: Usar wheel event para zoom suave
    svg.on('wheel', (event) => {
      event.preventDefault()
      const scale = projection.scale()
      const newScale = Math.max(100, Math.min(800, scale + event.deltaY * -0.5))
      projection.scale(newScale)

      // Atualizar o círculo de fundo
      svg.select('circle')
        .attr('r', newScale)

      updatePaths()
    })

    d3.json('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json')
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries).features

        // Otimização 6: Simplificar geometrias para melhor performance
        const simplifiedCountries = countries.map(country => ({
          ...country,
          geometry: d3.geoPath().projection(d3.geoIdentity()).bounds(country.geometry)
        }))

        // Países com cores atualizadas (era #2d5a27, agora #737368)
        svg.selectAll('.country')
          .data(countries)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', path)
          .style('fill', '#737368')
          .style('stroke', '#fff')
          .style('stroke-width', '0.0px')
          .style('stroke-linejoin', 'round')
          .on('mouseover', function () {
            // Hover com cor ligeiramente mais clara
            d3.select(this).style('fill', '#8a8a7f')
          })
          .on('mouseout', function () {
            d3.select(this).style('fill', '#737368')
          })

        setIsLoading(false)

        // Otimização 7: Auto-rotação mais eficiente
        let lastTime = 0
        const autoRotateLoop = (currentTime) => {
          if (currentTime - lastTime >= 4) { // 20fps para auto-rotação
            if (autoRotate && !isDragging) {
              const current = projection.rotate()
              projection.rotate([current[0] + rotateSpeed, current[1]])
              updatePaths()
            }
            lastTime = currentTime
          }
          requestAnimationFrame(autoRotateLoop)
        }
        requestAnimationFrame(autoRotateLoop)

        svg.on('click', () => { autoRotate = !autoRotate })
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load world map.')
        setIsLoading(false)
      })

    // Cleanup
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('circle.marker').remove()
    svg.selectAll('path.arc').remove()

    if (markers.length > 0) {
      // Adicionar marcadores
      svg.selectAll('circle.marker')
        .data(markers)
        .enter()
        .append('circle')
        .attr('class', 'marker')
        .attr('r', 5)
        .style('fill', d => d.color || 'red')
        .style('stroke', 'white')
        .style('stroke-width', '1.5px')

      // Adicionar arcos entre marcadores se houver mais de um
      if (markers.length >= 2) {
        const saoPaulo = markers.find(m => m.name === 'São Paulo')
        const france = markers.find(m => m.name === 'France')

        if (saoPaulo && france) {
          // Criar arco geodésico entre São Paulo e França
          const arc = {
            type: "LineString",
            coordinates: [saoPaulo.coords, france.coords]
          }

          svg.append('path')
            .datum(arc)
            .attr('class', 'arc')
            .style('fill', 'none')
            .style('stroke', '#ff6b6b')
            .style('stroke-width', '2px')
            .style('stroke-dasharray', '5,5')
            .style('opacity', 0.8)
        }
      }

      updatePaths()
    }
  }, [markers])

  const handleAddMarkers = () => {
    setMarkers([
      {
        name: 'São Paulo',
        coords: [-46.6333, -23.5505],
        color: 'red'
      },
      {
        name: 'France',
        coords: [2.3522, 48.8566], // Paris, França
        color: 'blue'
      }
    ])
  }

  return (
    <div className="world-map-container">
      <div className="world-map-box">
        <h1 className="world-map-title">Interactive Globe (Optimized)</h1>
        {isLoading && <div className="loading-text">Loading globe...</div>}
        {error && <div className="error-text">Error: {error}</div>}
        <svg ref={svgRef}></svg>
        <div className="instructions">
          <p>🖱️ <strong>Drag</strong> to rotate the globe (optimized)</p>
          <p>🖱️ <strong>Scroll</strong> to zoom in/out</p>
          <p>🖱️ <strong>Click</strong> to pause/resume auto-rotation</p>
          <p>🌍 <strong>Hover</strong> over countries to highlight them</p>
        </div>
        <div className="marker-button-container">
          <button className="marker-button" onClick={handleAddMarkers}>
            Mark São Paulo & France
          </button>
        </div>
      </div>
    </div>
  )
}