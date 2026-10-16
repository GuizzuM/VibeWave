// player.jsx
// Barra inferior do player: capa, controles reais, progresso (com seek) e volume.

import React from 'react';

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Player({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
}) {
  if (!track) {
    return (
      <footer className="player-bar player-bar-empty">
        <span>Selecione uma música para começar a ouvir 🎧</span>
      </footer>
    );
  }

  function handleProgressClick(e) {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)) * (duration || 0));
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="player-bar">
      {track.cover ? (
        <img className="player-cover" src={track.cover} alt="" />
      ) : (
        <div className="player-cover">🖼️</div>
      )}

      <div className="player-info">
        <span className="player-title">{track.title}</span>
        <span className="player-artist">{track.artist}</span>
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <button className="player-btn" onClick={onPrev}>⏮</button>
          <button className="player-btn player-btn-main" onClick={onTogglePlay}>
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button className="player-btn" onClick={onNext}>⏭</button>
        </div>

        <div className="player-progress">
          <span className="time">{formatTime(currentTime)}</span>
          <div className="progress-track" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
        />
      </div>
    </footer>
  );
}
