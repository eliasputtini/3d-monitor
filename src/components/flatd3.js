'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

export default function FlatWorldMap() {
  const svgRef = useRef(null)
  const projectionRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markers, setMarkers] = useState([])
  const [currentProjection, setCurrentProjection] = useState('naturalEarth')

  // Cache de elementos para evitar re-seleção
  const elementsRef = useRef({})

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

    const width = 900
    const height = 500

    let newProjection
    switch (projectionType) {
      case 'mercator':
        newProjection = d3.geoMercator()
          .scale(140)
          .translate([width / 2, height / 2])
        break
      case 'naturalEarth':
        newProjection = d3.geoNaturalEarth1()
          .scale(140)
          .translate([width / 2, height / 2])
        break
      case 'orthographic':
        newProjection = d3.geoOrthographic()
          .scale(200)
          .translate([width / 2, height / 2])
          .clipAngle(90)
        break
      case 'equirectangular':
        newProjection = d3.geoEquirectangular()
          .scale(140)
          .translate([width / 2, height / 2])
        break
      default:
        newProjection = d3.geoNaturalEarth1()
          .scale(140)
          .translate([width / 2, height / 2])
    }

    projectionRef.current = newProjection
    elementsRef.current.projection = newProjection
    elementsRef.current.path = d3.geoPath().projection(newProjection)

    updatePaths()
    setCurrentProjection(projectionType)
  }

  useEffect(() => {
    const width = 900
    const height = 500

    // Inicializar com projeção Natural Earth
    projectionRef.current = d3.geoNaturalEarth1()
      .scale(140)
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
      .style('fill', '#f0f8ff')
      .style('stroke', 'rgba(0, 0, 0, 0.1)')
      .style('stroke-width', '1px')

    // Graticule (linhas de grade)
    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('stroke-opacity', 0.08)
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
          .style('fill', '#737368')
          .style('stroke', '#fff')
          .style('stroke-width', '0.5px')
          .style('stroke-linejoin', 'round')
          .on('mouseover', function () {
            d3.select(this).style('fill', '#8a8a7f')
          })
          .on('mouseout', function () {
            d3.select(this).style('fill', '#737368')
          })

        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load world map.')
        setIsLoading(false)
      })

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
        .attr('r', 6)
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

  const handleClearMarkers = () => {
    setMarkers([])
  }

  const projectionOptions = [
    { value: 'naturalEarth', label: 'Natural Earth' },
    { value: 'mercator', label: 'Mercator' },
    { value: 'robinson', label: 'Robinson' },
    { value: 'equirectangular', label: 'Equirectangular' }
  ]

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '920px', 
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: '#333',
          fontSize: '24px'
        }}>
          Interactive Flat World Map
        </h1>
        
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#666'
          }}>
            Loading world map...
          </div>
        )}
        
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#d32f2f'
          }}>
            Error: {error}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px'
        }}>
          <svg ref={svgRef} style={{ 
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}></svg>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button 
              onClick={handleAddMarkers}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Mark São Paulo & France
            </button>
            <button 
              onClick={handleClearMarkers}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Markers
            </button>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px'
          }}>
            <label style={{ fontWeight: 'bold' }}>Projection:</label>
            {projectionOptions.map(option => (
              <button
                key={option.value}
                onClick={() => changeProjection(option.value)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: currentProjection === option.value ? '#2196F3' : '#e0e0e0',
                  color: currentProjection === option.value ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            <p>🖱️ <strong>Drag</strong> to pan the map</p>
            <p>🖱️ <strong>Scroll</strong> to zoom in/out</p>
            <p>🌍 <strong>Hover</strong> over countries to highlight them</p>
            <p>🗺️ <strong>Switch projections</strong> to see different map views</p>
          </div>
        </div>
      </div>
    </div>
  )
}