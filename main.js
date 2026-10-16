// main.js
// Processo principal do Electron: cria a janela, escaneia pastas de música
// e serve os arquivos de áudio com segurança para o player (renderer).

const { app, BrowserWindow, ipcMain, dialog, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { parseFile } = require('music-metadata');

const isDev = process.env.NODE_ENV === 'development';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg']);

// Guarda quais arquivos já foram escaneados e autorizados a ser servidos
// pelo protocolo customizado (evita que a UI peça arquivos arbitrários do disco).
const allowedFiles = new Set();

let mainWindow;

// Precisa ser registrado ANTES do app.whenReady().
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'bfmusic-media',
    privileges: {
      standard: true,
      stream: true,
      bypassCSP: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#121212',
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'src/assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => (mainWindow = null));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.mp3':
      return 'audio/mpeg';
    case '.flac':
      return 'audio/flac';
    case '.wav':
      return 'audio/wav';
    case '.ogg':
      return 'audio/ogg';
    default:
      return 'application/octet-stream';
  }
}

// Serve os arquivos de áudio locais através de um protocolo customizado,
// suportando "Range" (necessário para a barra de progresso/seek funcionar).
function registerMediaProtocol() {
  protocol.handle('bfmusic-media', async (request) => {
    const url = new URL(request.url);
    const filePath = decodeURIComponent(url.pathname.slice(1)); // remove a barra inicial

    if (!allowedFiles.has(filePath)) {
      return new Response('Arquivo não autorizado', { status: 403 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const totalLength = fileBuffer.byteLength;
    const mimeType = getMimeType(filePath);
    const rangeHeader = request.headers.get('range');

    if (!rangeHeader) {
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(totalLength),
        },
      });
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match) {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalLength}`,
        },
      });
    }

    let start = match[1] ? Number.parseInt(match[1], 10) : 0;
    let end = match[2] ? Number.parseInt(match[2], 10) : totalLength - 1;

    if (Number.isNaN(start) || start < 0) start = 0;
    if (Number.isNaN(end) || end >= totalLength) end = totalLength - 1;

    if (start > end) {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalLength}`,
        },
      });
    }

    const chunk = fileBuffer.subarray(start, end + 1);

    return new Response(chunk, {
      status: 206,
      headers: {
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.byteLength),
        'Content-Range': `bytes ${start}-${end}/${totalLength}`,
      },
    });
  });
}

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function findAudioFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findAudioFiles(fullPath)));
    } else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildTrack(filePath, rootFolder) {
  let common = {};
  let format = {};

  try {
    const metadata = await parseFile(filePath, { duration: true });
    common = metadata.common || {};
    format = metadata.format || {};
  } catch (err) {
    // Se o arquivo não tiver metadados legíveis, seguimos com valores padrão.
    console.warn('Falha ao ler metadados de', filePath, err.message);
  }

  let cover = null;
  if (common.picture && common.picture.length > 0) {
    const pic = common.picture[0];
    cover = `data:${pic.format};base64,${Buffer.from(pic.data).toString('base64')}`;
  }

  allowedFiles.add(filePath);

  let normalizedFolderPath = '';
  let folderName = 'Manual';

  if (rootFolder) {
    const relativePath = path.relative(rootFolder, filePath);
    const folderPath = relativePath && relativePath !== '.' ? path.dirname(relativePath) : '';
    normalizedFolderPath = folderPath.replace(/\\/g, '/');
    folderName = normalizedFolderPath ? normalizedFolderPath.split('/').pop() : 'Raiz';
  }

  return {
    id: Buffer.from(filePath).toString('base64'),
    filePath,
    title: common.title || path.basename(filePath, path.extname(filePath)),
    artist: common.artist || 'Artista desconhecido',
    album: common.album || 'Álbum desconhecido',
    duration: formatDuration(format.duration),
    durationSeconds: format.duration || 0,
    cover,
    folderPath: normalizedFolderPath,
    folderName,
    src: `bfmusic-media://local/${encodeURIComponent(filePath)}`,
  };
}

app.whenReady().then(() => {
  registerMediaProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- IPC ----

ipcMain.handle('app:ping', () => 'pong');

// Abre o seletor de pasta, escaneia recursivamente e devolve as faixas encontradas.
ipcMain.handle('app:pickMusicFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecione a pasta de músicas',
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const folder = result.filePaths[0];
  const filePaths = await findAudioFiles(folder);
  const tracks = await Promise.all(filePaths.map((filePath) => buildTrack(filePath, folder)));

  return { folder, tracks };
});

// Abre o seletor de arquivos individuais e devolve as faixas escolhidas.
ipcMain.handle('app:pickMusicFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecione arquivos de música',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Áudio', extensions: ['mp3', 'flac', 'wav', 'ogg'] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePaths = result.filePaths.filter((filePath) =>
    AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  );

  const tracks = await Promise.all(filePaths.map((filePath) => buildTrack(filePath, null)));

  return { tracks };
});
