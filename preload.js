// preload.js
// Ponte segura entre o processo principal (main.js) e o React (renderer),
// usando contextIsolation. O React nunca acessa Node.js diretamente.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bfmusic', {
  ping: () => ipcRenderer.invoke('app:ping'),
  // Abre o seletor de pasta do Windows, escaneia os arquivos de áudio
  // recursivamente e retorna { folder, tracks } (ou null se cancelado).
  pickMusicFolder: () => ipcRenderer.invoke('app:pickMusicFolder'),
  // Abre o seletor de arquivos individuais e retorna { tracks } (ou null se cancelado).
  pickMusicFiles: () => ipcRenderer.invoke('app:pickMusicFiles'),
});
