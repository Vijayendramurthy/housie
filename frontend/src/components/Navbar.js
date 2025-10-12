import React from 'react';

function Navbar({ user, onLogout }) {
  return (
    <nav style={{
      width: '100%',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      color: '#fff',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      <div style={{ fontWeight: 700, fontSize: 20 }}>Housie Game</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 16 }}>
            <span style={{ fontWeight: 500 }}>{user.name}</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>{user.email}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            background: '#fff',
            color: '#764ba2',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;