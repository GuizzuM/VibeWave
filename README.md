# BF Music 🎵

Player de música para Windows, feito com **Electron + React**.

## Etapa 1 — Concluída ✅

Nesta etapa criamos:

- O projeto Electron com `main.js` (processo principal) e `preload.js` (ponte segura para o renderer).
- A estrutura de pastas completa (`src/`, `music/`, `database/`).
- A base do React com Vite (`src/js/main.jsx`, `app.jsx` e componentes `sidebar.jsx`, `pesquisa.jsx`, `biblioteca.jsx`, `player.jsx`).
- Um layout inicial já parecido com o mockup (Spotify/YouTube Music), com tema escuro.
- Dados de exemplo (mock) na lista de músicas, só para visualizarmos a interface — a leitura real da pasta vem na Etapa 3.

## Como rodar no seu computador (Windows 11 + VS Code)

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Rode em modo desenvolvimento (abre o Vite + Electron juntos, com hot-reload):

   ```bash
   npm run dev
   ```

3. Para gerar a versão de produção (build do React + Electron apontando pro build):

   ```bash
   npm run build
   npm start
   ```

4. Para gerar o instalador `.exe` (via electron-builder):

   ```bash
   npm run dist
   ```

## Estrutura de pastas

```
BFMusic/
├── package.json
├── main.js              # processo principal do Electron
├── preload.js           # ponte segura (contextBridge) entre main e React
├── vite.config.js
│
├── src/
│   ├── index.html       # entrada do Vite
│   ├── styles/
│   │   ├── app.css
│   │   ├── sidebar.css
│   │   └── player.css
│   │
│   ├── js/
│   │   ├── main.jsx      # renderiza o React (equivalente ao renderer.js)
│   │   ├── app.jsx        # componente raiz
│   │   ├── sidebar.jsx    # menu lateral
│   │   ├── pesquisa.jsx   # barra de pesquisa
│   │   ├── biblioteca.jsx # lista de músicas
│   │   └── player.jsx     # barra inferior do player
│   │
│   └── assets/
│       ├── logo.png       # (adicionar depois)
│       └── icons/
│
├── music/                # pasta sugerida para músicas de teste
└── database/             # reservada para o SQLite (etapas futuras)
```

## Próximas etapas

- **Etapa 2:** refinar a interface (animações, capas grandes, drag-and-drop de pasta).
- **Etapa 3:** ler músicas de verdade de uma pasta (fs + `music-metadata`) e substituir os dados mock.
- **Etapa 4:** reprodução real de áudio (MP3, FLAC, WAV, OGG) via `<audio>`/Web Audio API.
- **Etapa 5:** barra de progresso funcional (seek, tempo atual).
- **Etapa 6:** próxima/anterior de verdade, com fila de reprodução.
- **Etapa 7:** pesquisa já está com a UI pronta — falta ligar aos dados reais.
- **Etapa 8:** exibir capa do álbum extraída do arquivo de áudio.
- **Etapa 9:** favoritos (persistidos em SQLite).
- **Etapa 10:** playlists.

## Observação sobre o ambiente de build

Este projeto foi montado e testado (sintaxe e build do React) em um ambiente sandbox sem acesso gráfico, então o binário do Electron não pôde ser baixado/testado aqui. Ao rodar `npm install` no seu Windows 11, o Electron será baixado normalmente e a janela vai abrir sem problemas.
