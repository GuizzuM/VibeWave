// sidebar.jsx
// Menu lateral: Biblioteca, Favoritos e Playlists.

import React from 'react';

const ITEMS = [
  { id: 'biblioteca', label: 'Biblioteca', icon: '🏠' },
  { id: 'favoritos', label: 'Favoritos', icon: '❤️' },
  { id: 'playlists', label: 'Playlists', icon: '📂' },
];

export default function Sidebar({
  active,
  onSelect,
  onPickFolder,
  onPickFiles,
  isScanning,
  isPickingFiles,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon"><img src="src/assets/icons/icon.png" alt="" /></span>
        <span className="sidebar-logo-text">VibeWave</span>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-actions">
        <button
          className="sidebar-add-files"
          onClick={onPickFiles}
          disabled={isPickingFiles || isScanning}
        >
          {isPickingFiles ? 'Importando...' : '+ Adicionar músicas'}
        </button>
        <button
          className="sidebar-add-folder"
          onClick={onPickFolder}
          disabled={isScanning || isPickingFiles}
        >
          {isScanning ? 'Escaneando...' : '+ Adicionar pasta de músicas'}
        </button>
      </div>
    </aside>
  );
}
