// pesquisa.jsx
// Barra de pesquisa em tempo real (por nome da música/artista).

import React from 'react';

export default function Pesquisa({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Pesquisar músicas, artistas, álbuns..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
