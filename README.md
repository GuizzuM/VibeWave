# BF Music 🎵

Player de música para Windows, feito com **Electron + React**.

## Como rodar no seu computador 

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

## Próximas etapas

 refinar a interface (animações, capas grandes, drag-and-drop de pasta).
 ler músicas de verdade de uma pasta (fs + `music-metadata`) e substituir os dados mock.
 reprodução real de áudio (MP3, FLAC, WAV, OGG) via `<audio>`/Web Audio API.
 barra de progresso funcional (seek, tempo atual).
 próxima/anterior de verdade, com fila de reprodução.
 pesquisa já está com a UI pronta — falta ligar aos dados reais.
 exibir capa do álbum extraída do arquivo de áudio.
 favoritos (persistidos em SQLite).  
