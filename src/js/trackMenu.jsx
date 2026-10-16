// trackMenu.jsx
// Menu de três pontos (⋮) para adicionar/remover uma música de playlists.

import React, { useEffect, useRef, useState } from 'react';

export default function TrackMenu({
  track,
  playlists = [],
  onToggleTrackInPlaylist,
  onGoToPlaylists,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleToggle(playlistId) {
    onToggleTrackInPlaylist?.(playlistId, track);
  }

  return (
    <div className="track-menu" ref={containerRef}>
      <button
        type="button"
        className="song-action-btn track-menu-btn"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        title="Adicionar à playlist"
        aria-expanded={open}
      >
        ⋮
      </button>

      {open && (
        <div className="track-menu-dropdown" onClick={(event) => event.stopPropagation()}>
          {playlists.length === 0 ? (
            <div className="track-menu-empty">
              <span>Nenhuma playlist criada</span>
              <button
                type="button"
                className="track-menu-create-link"
                onClick={() => {
                  setOpen(false);
                  onGoToPlaylists?.();
                }}
              >
                Criar playlist
              </button>
            </div>
          ) : (
            playlists.map((playlist) => {
              const isInPlaylist = playlist.trackIds.includes(track.id);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  className={`track-menu-item ${isInPlaylist ? 'active' : ''}`}
                  onClick={() => handleToggle(playlist.id)}
                >
                  <span className="track-menu-check">{isInPlaylist ? '✓' : ''}</span>
                  <span className="track-menu-label">{playlist.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
