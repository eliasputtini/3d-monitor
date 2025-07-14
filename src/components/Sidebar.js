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
      <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Navigation</h2>
      <button onClick={() => setCurrentView('3d')} style={buttonStyle(currentView === '3d')}>
        3D View
      </button>
      <button onClick={() => setCurrentView('details')} style={buttonStyle(currentView === 'details')}>
        Details
      </button>
      <button onClick={() => setCurrentView('worldmap')} style={buttonStyle(currentView === 'worldmap')}>
        Worldmap
      </button>
      <button onClick={() => setCurrentView('3dworld')} style={buttonStyle(currentView === '3dworld')}>
        3d world
      </button>
      <button onClick={() => setCurrentView('D3World')} style={buttonStyle(currentView === 'D3World')}>
        d3 world
      </button>
    </div>
  );
}

export default Sidebar;
