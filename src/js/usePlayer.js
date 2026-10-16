// usePlayer.js
// Hook que controla um elemento <audio> real: play/pause, próxima/anterior,
// progresso (seek) e volume. Usado pelo App e repassado ao componente Player.

import { useEffect, useRef, useState, useCallback } from 'react';

export function usePlayer(tracks) {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);

  // Cria o elemento <audio> uma única vez.
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
  }

  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null;

  // Troca a fonte do áudio sempre que a faixa atual muda.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.src;
    audio.currentTime = 0;
    setCurrentTime(0);

    if (isPlaying) {
      audio.play().catch((err) => console.warn('Não foi possível reproduzir:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.src]);

  // Eventos do <audio>: progresso, duração, fim da faixa.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => next();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, tracks.length]);

  const play = useCallback((index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => console.warn('Não foi possível reproduzir:', err));
      setIsPlaying(true);
    }
  }, [isPlaying, currentIndex]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((value) => {
    const audio = audioRef.current;
    setVolumeState(value);
    if (audio) audio.volume = value;
  }, []);

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  };
}
