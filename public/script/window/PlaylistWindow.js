const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DUBBING_STATE = require('../enum/DUBBING_STATE')
const store = require('../service/store')

class PlaylistWindow {
  constructor({ mainWindow, onClose, value }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.close = this.close.bind(this)
    this.value = value
    this.sessionSave = this.sessionSave.bind(this)
  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-playlist.js'),
          nodeIntegration: true
        },
      });
      this.window.loadURL(
        app.isPackaged
          ? `file://${path.join(__dirname, '../../index.html')}`
          : 'http://localhost:3000'
      );
      this.window.on('closed', this.close);

      this.window.webContents.once('dom-ready', () => {
        if (this.value) {
          this.window.webContents.send('session-onchange', this.value);
        }
        resolve()
      });

      this.initHandle()
    })
  }

  initHandle() {
    ipcMain.addListener('session-save', this.sessionSave)
  }

  sessionSave(event, session) {
    let sessions = store.get('playlists')

    if (sessions.some(s => s.id === session.id)) {
      // Edition

      session.updatedAt = Date.now()
      store.set('playlists', sessions.map(s => s.id === session.id ? session : s))
    } else {
      // Creation

      session.createdAt = Date.now()
      session.updatedAt = Date.now()
      store.appendToArray('playlists', session)
    }

    this.mainWindow.webContents.send('playlist-onchange', store.get('playlists'));
    this.window.close();
  }

  close() {
    ipcMain.removeListener('session-save', this.sessionSave)
    this.window = null;
    this.onClose();
  }
}

module.exports = PlaylistWindow