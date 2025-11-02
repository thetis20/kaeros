const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Audio = require('../application/entity/Audio.js');
const { v4: uuidv4 } = require('uuid');
const {
  createAudioUseCase,
  updateAudioUseCase,
  listAudioByFolderUseCase
} = require('../infrastructure/useCase.js');

class AudioWindow {
  constructor({ mainWindow, onClose, value, folderId }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.close = this.close.bind(this)
    this.value = value
    this.folderId = folderId
    this.audioSave = this.audioSave.bind(this)

  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-audio.js'),
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
        if (this.value !== undefined) {
          this.window.webContents.send('audio-onchange', this.value);
        }

        resolve()
      });

      this.initHandle()
    })
  }

  initHandle() {
    ipcMain.addListener('audio-save', this.audioSave)
  }

  async audioSave(event, audio) {

    if (undefined === audio.createdAt) {
      audio = new Audio(audio.id, audio.name, audio.src, audio.color);
      createAudioUseCase.execute(this.folderId, audio)
    } else {
      updateAudioUseCase.execute(this.folderId, audio.id, audio)
    }

    this.mainWindow.webContents.send('audio-onchange', await listAudioByFolderUseCase.execute(this.folderId));
    this.window.close();
  }

  close() {
    ipcMain.removeListener('audio-save', this.audioSave)
    this.window = null;
    this.onClose();
  }
}

module.exports = AudioWindow