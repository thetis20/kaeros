const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DUBBING_STATE = require('../enum/DUBBING_STATE')

class DubbingWindow {
  constructor({ mainWindow, onClose, videos }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.dubbing = {
      state: DUBBING_STATE.PENDING,
      index: 0,
      paused: true,
      videos
    }
    this.handleDubbingOnChange = this.handleDubbingOnChange.bind(this)
  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-dubbing.js'),
          nodeIntegration: true,
          webSecurity: false
        },
      });
      this.window.loadURL(
        app.isPackaged
          ? `file://${path.join(__dirname, '../../index.html')}`
          : 'http://localhost:3000'
      );
      this.window.on('closed', () => {
        this.close()
      });

      this.window.webContents.once('dom-ready', () => {
        this.mainWindow.webContents.send('dubbing-onchange', this.dubbing);
        this.window.webContents.send('dubbing-onchange', this.dubbing);
        resolve()
      });

      this.initHandle()
    })

  }

  initHandle() {
    ipcMain.addListener('dubbing-onchange', this.handleDubbingOnChange)
  }

  handleDubbingOnChange(event, argv) {
    this.dubbing = argv;
    this.mainWindow.webContents.send('dubbing-onchange', this.dubbing);
    this.window.webContents.send('dubbing-onchange', argv);
  }

  fetch() {
    this.mainWindow.webContents.send('dubbing-onchange', this.dubbing);
    this.window.webContents.send('dubbing-onchange', this.dubbing);
  }

  close() {
    ipcMain.removeListener('dubbing-onchange', this.handleDubbingOnChange)
    this.window = null;
    this.onClose();
  }
}

module.exports = DubbingWindow