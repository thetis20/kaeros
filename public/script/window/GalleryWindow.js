const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DUBBING_STATE = require('../enum/DUBBING_STATE')

class GalleryWindow {
  constructor({ mainWindow, onClose }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.gallery = {
      src: ''
    }
    this.handleGalleryOnChange = this.handleGalleryOnChange.bind(this)
  }

  start() {
    this.window = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload-gallery.js'),
        nodeIntegration: true
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
      this.mainWindow.webContents.send('gallery-onchange', this.gallery);
      this.window.webContents.send('gallery-onchange', this.gallery);
    });

    this.initHandle()
  }

  initHandle() {
    ipcMain.addListener('gallery-onchange', this.handleGalleryOnChange)
  }

  handleGalleryOnChange(event, argv) {
    this.gallery = argv;
    this.mainWindow.webContents.send('gallery-onchange', this.gallery);
    this.window.webContents.send('gallery-onchange', this.gallery);
  }

  close() {
    ipcMain.removeListener('gallery-onchange', this.handleGalleryOnChange)
    this.window = null;
    this.onClose();
  }
}

module.exports = GalleryWindow