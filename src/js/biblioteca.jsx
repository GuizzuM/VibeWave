// biblioteca.jsx
// Lista de músicas da biblioteca real (escaneada da pasta escolhida pelo usuário).

import React from 'react';
import TrackMenu from './trackMenu.jsx';

export default function Biblioteca({
  tracks,
  query,
  currentTrackId,
  isPlaying,
  favoriteTrackIds = [],
  playlists = [],
  onPlay,
  onToggleFavorite,
  onToggleTrackInPlaylist,
  onGoToPlaylists,
}) {
  const filtered = tracks.filter((track) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.album.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return <div className="empty-state">Nenhuma música encontrada para "{query}".</div>;
  }

  return (
    <div className="song-list">
      {filtered.map((track) => {
        const isCurrent = currentTrackId === track.id;
        return (
          <div
            key={track.id}
            className={`song-row ${isCurrent ? 'active' : ''}`}
            onDoubleClick={() => onPlay(track)}
            title="Clique duas vezes para tocar"
          >
            <span className="song-icon">
              {isCurrent && isPlaying ? '🔊' : '🎵'}
            </span>
            {track.cover ? (
              <img className="song-cover" src={track.cover} alt="" />
            ) : (
              <div className="song-cover song-cover-placeholder">🎵</div>
            )}
            <div className="song-info">
              <span className="song-title">{track.title}</span>
              <span className="song-artist">{track.artist} · {track.album}</span>
            </div>
            <div className="song-actions">
              <TrackMenu
                track={track}
                playlists={playlists}
                onToggleTrackInPlaylist={onToggleTrackInPlaylist}
                onGoToPlaylists={onGoToPlaylists}
              />
              <button
                type="button"
                className={`song-action-btn ${favoriteTrackIds.includes(track.id) ? 'active' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite?.(track);
                }}
                title={favoriteTrackIds.includes(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                {favoriteTrackIds.includes(track.id) ? '★' : '☆'}
              </button>
            </div>
            <span className="song-duration">{track.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
