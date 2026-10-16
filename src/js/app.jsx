// app.jsx
// Componente raiz do BF Music: organiza Sidebar, pesquisa, lista de músicas e player.

import React, { useState } from 'react';
import Sidebar from './sidebar.jsx';
import Pesquisa from './pesquisa.jsx';
import Biblioteca from './biblioteca.jsx';
import Player from './player.jsx';
import { usePlayer } from './usePlayer.js';

function createPlaylistId() {
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mergeTracks(prevTracks, newTracks) {
  const existingPaths = new Set(prevTracks.map((t) => t.filePath));
  const newOnes = newTracks.filter((t) => !existingPaths.has(t.filePath));
  return [...prevTracks, ...newOnes];
}

export default function App() {
  const [activeSection, setActiveSection] = useState('biblioteca');
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isPickingFiles, setIsPickingFiles] = useState(false);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const player = usePlayer(tracks);
  const favoriteTracks = tracks.filter((track) => favoriteTrackIds.includes(track.id));
  const activePlaylist = playlists.find((playlist) => playlist.id === activePlaylistId) || null;
  const playlistTracks = activePlaylist
    ? tracks.filter((track) => activePlaylist.trackIds.includes(track.id))
    : [];

  async function handlePickFolder() {
    if (!window.bfmusic?.pickMusicFolder) return;

    setIsScanning(true);
    try {
      const result = await window.bfmusic.pickMusicFolder();
      if (result?.tracks) {
        setTracks((prevTracks) => mergeTracks(prevTracks, result.tracks));
      }
    } finally {
      setIsScanning(false);
    }
  }

  async function handlePickFiles() {
    if (!window.bfmusic?.pickMusicFiles) return;

    setIsPickingFiles(true);
    try {
      const result = await window.bfmusic.pickMusicFiles();
      if (result?.tracks) {
        setTracks((prevTracks) => mergeTracks(prevTracks, result.tracks));
      }
    } finally {
      setIsPickingFiles(false);
    }
  }

  function handlePlayTrack(track) {
    const index = tracks.findIndex((t) => t.id === track.id);
    if (index >= 0) player.play(index);
  }

  function handleToggleFavorite(track) {
    setFavoriteTrackIds((prev) => {
      if (prev.includes(track.id)) {
        return prev.filter((id) => id !== track.id);
      }
      return [...prev, track.id];
    });
  }

  function handleCreatePlaylist() {
    const newPlaylist = {
      id: createPlaylistId(),
      name: 'Sem Nome',
      trackIds: [],
      isEditing: true,
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setActivePlaylistId(newPlaylist.id);
  }

  function handleRenamePlaylist(playlistId, newName) {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, name: trimmed, isEditing: false }
          : playlist
      )
    );
  }

  function handleCancelRename(playlistId) {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, isEditing: false }
          : playlist
      )
    );
  }

  function handleStartRename(playlistId) {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, isEditing: true } : playlist
      )
    );
  }

  function handleToggleTrackInPlaylist(playlistId, track) {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;

        const hasTrack = playlist.trackIds.includes(track.id);
        return {
          ...playlist,
          trackIds: hasTrack
            ? playlist.trackIds.filter((id) => id !== track.id)
            : [...playlist.trackIds, track.id],
        };
      })
    );
  }

  function handleDeletePlaylist(playlistId) {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
    if (activePlaylistId === playlistId) {
      setActivePlaylistId(null);
    }
  }

  function handleGoToPlaylists() {
    setActiveSection('playlists');
  }

  const bibliotecaProps = {
    query,
    currentTrackId: player.currentTrack?.id,
    isPlaying: player.isPlaying,
    favoriteTrackIds,
    playlists,
    onPlay: handlePlayTrack,
    onToggleFavorite: handleToggleFavorite,
    onToggleTrackInPlaylist: handleToggleTrackInPlaylist,
    onGoToPlaylists: handleGoToPlaylists,
  };

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <Pesquisa value={query} onChange={setQuery} />
      </div>

      <div className="app-body">
        <Sidebar
          active={activeSection}
          onSelect={setActiveSection}
          onPickFolder={handlePickFolder}
          onPickFiles={handlePickFiles}
          isScanning={isScanning}
          isPickingFiles={isPickingFiles}
        />

        <main className="app-content">
          <h2 className="section-title">
            {activeSection === 'biblioteca' && 'Biblioteca'}
            {activeSection === 'favoritos' && 'Favoritos'}
            {activeSection === 'playlists' && 'Playlists'}
          </h2>

          {activeSection === 'biblioteca' && (
            <>
              {tracks.length === 0 && !isScanning && !isPickingFiles && (
                <div className="empty-state">
                  Nenhuma música na biblioteca ainda.
                  <br />
                  Use "+ Adicionar músicas" ou "+ Adicionar pasta de músicas" na barra lateral
                  para importar suas músicas.
                </div>
              )}
              {(isScanning || isPickingFiles) && (
                <div className="empty-state">
                  {isScanning ? 'Escaneando pasta, aguarde...' : 'Importando músicas, aguarde...'}
                </div>
              )}
              {tracks.length > 0 && (
                <Biblioteca tracks={tracks} {...bibliotecaProps} />
              )}
            </>
          )}

          {activeSection === 'favoritos' && (
            favoriteTracks.length === 0 ? (
              <div className="empty-state">Nenhuma música favoritada ainda. ❤️</div>
            ) : (
              <Biblioteca tracks={favoriteTracks} {...bibliotecaProps} />
            )
          )}

          {activeSection === 'playlists' && (
            activePlaylist ? (
              <>
                <button className="playlist-back" onClick={() => setActivePlaylistId(null)}>
                  ← Voltar às playlists
                </button>
                <div className="section-subtitle">{activePlaylist.name}</div>
                {playlistTracks.length === 0 ? (
                  <div className="empty-state">
                    Esta playlist ainda está vazia. Use o menu ⋮ em qualquer música para
                    adicioná-la aqui.
                  </div>
                ) : (
                  <Biblioteca tracks={playlistTracks} {...bibliotecaProps} />
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="playlist-create-btn"
                  onClick={handleCreatePlaylist}
                >
                  + Criar playlist
                </button>

                {playlists.length === 0 ? (
                  <div className="empty-state">
                    Nenhuma playlist criada ainda. Clique em "+ Criar playlist" para começar.
                  </div>
                ) : (
                  <div className="song-list">
                    {playlists.map((playlist) => (
                      <div key={playlist.id} className="playlist-row">
                        {playlist.isEditing ? (
                          <form
                            className="playlist-rename-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              handleRenamePlaylist(playlist.id, event.currentTarget.name.value);
                            }}
                          >
                            <input
                              type="text"
                              name="name"
                              className="playlist-rename-input"
                              defaultValue={playlist.name}
                              autoFocus
                              onBlur={(event) =>
                                handleRenamePlaylist(playlist.id, event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                  handleCancelRename(playlist.id);
                                }
                              }}
                            />
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="playlist-folder-row"
                            onClick={() => setActivePlaylistId(playlist.id)}
                          >
                            <span className="song-icon">📁</span>
                            <div className="song-info">
                              <span className="song-title">{playlist.name}</span>
                              <span className="song-artist">
                                {playlist.trackIds.length}{' '}
                                {playlist.trackIds.length === 1 ? 'música' : 'músicas'}
                              </span>
                            </div>
                            <span className="song-duration">Abrir</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="playlist-rename-btn"
                          onClick={() => handleStartRename(playlist.id)}
                          title="Renomear"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="playlist-delete-btn"
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          title="Excluir playlist"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          )}
        </main>
      </div>

      <Player
        track={player.currentTrack}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        onTogglePlay={player.togglePlay}
        onNext={player.next}
        onPrev={player.prev}
        onSeek={player.seek}
        onVolumeChange={player.setVolume}
      />
    </div>
  );
}
