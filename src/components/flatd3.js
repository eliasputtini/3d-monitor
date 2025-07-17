'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

export default function FlatWorldMap() {
  const svgRef = useRef(null)
  const projectionRef = useRef(null)
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
  ])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)

  const elementsRef = useRef({})
  const zoomTransformRef = useRef(d3.zoomIdentity)

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


  const addMarkersAndArcs = () => {
    if (!elementsRef.current.svg || !mapLoaded) return

    const svg = elementsRef.current.svg
    const projection = elementsRef.current.projection
    const path = elementsRef.current.path

    svg.selectAll('circle.marker').remove()
    svg.selectAll('path.arc').remove()

    if (markers.length > 0) {
      svg.selectAll('circle.marker')
        .data(markers)
        .enter()
        .append('circle')
        .attr('class', 'marker')
        .attr('r', 8)
        .attr('cx', d => {
          const projected = projection(d.coords)
          return projected ? projected[0] : -1000
        })
        .attr('cy', d => {
          const projected = projection(d.coords)
          return projected ? projected[1] : -1000
        })
        .style('fill', d => d.color || 'red')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .style('display', d => {
          const projected = projection(d.coords)
          return projected ? 'inline' : 'none'
        })

      if (markers.length >= 2) {
        const saoPaulo = markers.find(m => m.name === 'São Paulo')
        const france = markers.find(m => m.name === 'France')

        if (saoPaulo && france) {
          const drawArcLoop = () => {
            const arc = {
              type: "LineString",
              coordinates: [saoPaulo.coords, france.coords]
            }

            const arcPath = svg.append('path')
              .datum(arc)
              .attr('class', 'arc')
              .attr('d', path)
              .style('fill', 'none')
              .style('stroke', '#ff6b6b')
              .style('stroke-width', '3px')
              .style('stroke-linecap', 'round')
              .style('opacity', 0.8)
              .style('stroke-dasharray', function () {
                const length = this.getTotalLength()
                return `${length} ${length}`
              })
              .style('stroke-dashoffset', function () {
                return this.getTotalLength()
              })
              .attr('transform', zoomTransformRef.current)

            arcPath.transition()
              .duration(1500)
              .ease(d3.easeCubicOut)
              .style('stroke-dashoffset', 0)
              .on('end', function () {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style('stroke-width', '3px')
                  .style('opacity', 0.8)
                  .on('end', function () {
                    d3.select(this)
                      .transition()
                      .duration(800)
                      .ease(d3.easeCubicIn)
                      .style('opacity', 0)
                      .style('stroke-width', '1px')
                      .on('end', function () {
                        d3.select(this).remove()
                        drawArcLoop()
                      })
                  })
              })
          }

          drawArcLoop()
        }
      }
    }
  }

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const { width, height } = dimensions
    const scale = Math.min(width, height) / 6

    projectionRef.current = d3.geoMercator()
      .scale(scale * 2)
      .translate([width / 2, height / 2])

    const projection = projectionRef.current
    const path = d3.geoPath().projection(projection)
    const graticule = d3.geoGraticule()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    elementsRef.current = { svg, projection, path, width, height }

    svg.selectAll('*').remove()

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#0a0a0a')
      .style('stroke', 'rgba(255, 255, 255, 0.1)')
      .style('stroke-width', '1px')

    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#333')
      .style('stroke-opacity', 0.3)
      .style('stroke-width', '0.5px')

    const zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        const { transform } = event
        zoomTransformRef.current = transform

        svg.selectAll('path.country').attr('transform', transform)
        svg.selectAll('path.graticule').attr('transform', transform)
        svg.selectAll('circle.marker').attr('transform', transform)
        svg.selectAll('path.arc').attr('transform', transform)
      })

    svg.call(zoom)

    d3.json('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json')
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries).features

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

        setMapLoaded(true)
      })


  }, [dimensions])

  useEffect(() => {
    if (mapLoaded) {
      addMarkersAndArcs()
    }
  }, [markers, mapLoaded])

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
        <h1 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          🌍 Interactive World Map - Mercator
        </h1>


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
        </div>
      </div>
    </div>
  )
}