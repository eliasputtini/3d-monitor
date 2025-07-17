import React from 'react';

function Sidebar({ currentView, setCurrentView }) {
  const buttonStyle = (active) => ({
    padding: '10px 15px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: active ? '#00d8ff' : '#14324C',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    fontWeight: active ? 'bold' : 'normal',
  });

  return (
    <div style={{
      width: '220px',
      backgroundColor: '#0b1724',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    }}>
      <button onClick={() => setCurrentView('3DMonitor')} style={buttonStyle(currentView === '3DMonitor')}>
        3D Monitor
      </button>
      <button onClick={() => setCurrentView('details')} style={buttonStyle(currentView === 'details')}>
        Chart Killchain
      </button>
      <button onClick={() => setCurrentView('DottedMap')} style={buttonStyle(currentView === 'DottedMap')}>
        DottedMap
      </button>
      <button onClick={() => setCurrentView('3dworld')} style={buttonStyle(currentView === '3dworld')}>
        ThreeJS 3D Globe
      </button>
      <button onClick={() => setCurrentView('D3World')} style={buttonStyle(currentView === 'D3World')}>
        D3 Globe
      </button>
      <button onClick={() => setCurrentView('flatd3')} style={buttonStyle(currentView === 'flatd3')}>
        D3 Flat
      </button>
      <button onClick={() => setCurrentView('ReactSimpleMap')} style={buttonStyle(currentView === 'ReactSimpleMap')}>
        React Simple Map
      </button>
    </div>
  );
}

export default Sidebar;
