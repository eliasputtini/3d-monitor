'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

export default function FlatWorldMap() {
  const svgRef = useRef(null)
  const projectionRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markers, setMarkers] = useState([
    {
      name: 'São Paulo',
      coords: [-46.6333, -23.5505],
      color: '#ff4444'
    },
    {
      name: 'France',
      coords: [2.3522, 48.8566], // Paris, França
      color: '#4444ff'
    },
    {
      name: 'China',
      coords: [116.4074, 39.9042], // Beijing, China
      color: '#44ff44'
    }
  ])
  const [currentProjection, setCurrentProjection] = useState('mercator')
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Cache de elementos para evitar re-seleção
  const elementsRef = useRef({})

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const updatePaths = () => {
    if (!projectionRef.current || !svgRef.current) return

    const { svg, projection, path } = elementsRef.current

    if (!svg || !projection || !path) return

    // Atualizar países
    svg.selectAll('path.country').attr('d', path)
    svg.select('path.graticule').attr('d', path)

    // Atualizar marcadores
    svg.selectAll('circle.marker')
      .attr('cx', d => {
        const projected = projection(d.coords)
        return projected ? projected[0] : -1000
      })
      .attr('cy', d => {
        const projected = projection(d.coords)
        return projected ? projected[1] : -1000
      })
      .style('display', d => {
        const projected = projection(d.coords)
        return projected ? 'inline' : 'none'
      })

    // Atualizar arcos
    svg.selectAll('path.arc').attr('d', path)
  }

  const changeProjection = (projectionType) => {
    if (!elementsRef.current.svg) return

    const { width, height } = dimensions
    if (width === 0 || height === 0) return

    let newProjection
    const scale = Math.min(width, height) / 6 // Responsive scaling

    switch (projectionType) {
      case 'mercator':
        newProjection = d3.geoMercator()
          .scale(scale * 2)
          .translate([width / 2, height / 2])
        break
      case 'naturalEarth':
        newProjection = d3.geoNaturalEarth1()
          .scale(scale * 1.5)
          .translate([width / 2.3, height / 2.3])
        break
      case 'orthographic':
        newProjection = d3.geoOrthographic()
          .scale(scale * 2)
          .translate([width / 2.3, height / 2.3])
          .clipAngle(90)
        break
      case 'equirectangular':
        newProjection = d3.geoEquirectangular()
          .scale(scale * 2)
          .translate([width / 2, height / 2])
        break
      default:
        newProjection = d3.geoMercator()
          .scale(scale * 2)
          .translate([width / 2, height / 2])
    }

    projectionRef.current = newProjection
    elementsRef.current.projection = newProjection
    elementsRef.current.path = d3.geoPath().projection(newProjection)

    updatePaths()
    setCurrentProjection(projectionType)
  }

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const { width, height } = dimensions
    const scale = Math.min(width, height) / 6
    //default projekction
    projectionRef.current = d3.geoMercator()
      .scale(scale * 2)
      .translate([width / 2, height / 2])

    const projection = projectionRef.current
    const path = d3.geoPath().projection(projection)
    const graticule = d3.geoGraticule()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Cache elementos para reutilização
    elementsRef.current = { svg, projection, path, width, height }

    svg.selectAll('*').remove()

    // Fundo do mapa
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#0a0a0a')
      .style('stroke', 'rgba(255, 255, 255, 0.1)')
      .style('stroke-width', '1px')

    // Graticule (linhas de grade)
    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#333')
      .style('stroke-opacity', 0.3)
      .style('stroke-width', '0.5px')

    // Implementar pan e zoom para mapa flat
    const zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        const { transform } = event
        svg.selectAll('path.country').attr('transform', transform)
        svg.selectAll('path.graticule').attr('transform', transform)
        svg.selectAll('circle.marker').attr('transform', transform)
        svg.selectAll('path.arc').attr('transform', transform)
      })

    svg.call(zoom)

    // Carregar dados do mundo
    d3.json('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json')
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries).features

        // Países
        svg.selectAll('.country')
          .data(countries)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', path)
          .style('fill', '#2a2a2a')
          .style('stroke', '#444')
          .style('stroke-width', '0.5px')
          .style('stroke-linejoin', 'round')
          .on('mouseover', function () {
            d3.select(this).style('fill', '#3a3a3a')
          })
          .on('mouseout', function () {
            d3.select(this).style('fill', '#2a2a2a')
          })

        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load world map.')
        setIsLoading(false)
      })

  }, [dimensions])

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
        .attr('r', 8)
        .style('fill', d => d.color || 'red')
        .style('stroke', 'white')
        .style('stroke-width', '2px')

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
            .style('stroke-width', '3px')
            .style('stroke-dasharray', '5,5')
            .style('opacity', 0.8)
        }
      }

      updatePaths()
    }
  }, [markers])



  const handleClearMarkers = () => {
    setMarkers([])
  }

  const projectionOptions = [
    { value: 'mercator', label: 'Mercator' },
    { value: 'naturalEarth', label: 'Natural Earth' },
    { value: 'equirectangular', label: 'Equirectangular' },
    { value: 'orthographic', label: 'Orthographic' }
  ]

  return (
    <div style={{
      flex: 1,
      height: '100vh',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Control Card */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 10,
        margin: '20px 20px 0 20px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            🌍 Interactive World Map
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center'
          }}>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>🗺️</span>
              {projectionOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => changeProjection(option.value)}
                  style={{
                    padding: '6px 12px',
                    background: currentProjection === option.value
                      ? 'linear-gradient(45deg, #2196F3, #1976D2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: currentProjection === option.value
                      ? '0 4px 15px rgba(33, 150, 243, 0.3)'
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentProjection !== option.value) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentProjection !== option.value) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(isLoading || error) && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            color: isLoading ? '#fff' : '#ff6b6b',
            fontSize: '14px',
            marginTop: '10px'
          }}>
            {isLoading ? '🌐 Loading world map...' : `❌ Error: ${error}`}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: 'grab'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.cursor = 'grabbing'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.cursor = 'grab'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.cursor = 'grab'
          }}
        />

        {/* Instructions overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontSize: '12px',
          lineHeight: '1.4',
          maxWidth: '300px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>🕹️ Controls:</div>
          <div>🖱️ <strong>Drag</strong> to pan • <strong>Scroll</strong> to zoom</div>
          <div>🌍 <strong>Hover</strong> countries to highlight</div>
          <div>🗺️ <strong>Switch projections</strong> for different views</div>
        </div>
      </div>
    </div>
  )
}