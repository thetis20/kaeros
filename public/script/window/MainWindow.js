const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TimeWindow = require('./TimeWindow.js')
const DubbingWindow = require('./DubbingWindow.js')
const Store = require('electron-store').default
const store = new Store({
  migrations: {
    '0.0.1': store => {
      store.set('dubbings', []);
    }
  }
});
const { v4: uuidv4 } = require('uuid');
const GalleryWindow = require('./GalleryWindow.js');

class MainWindow {
  constructor() {
    this.timeClose = this.timeClose.bind(this)
    this.timeOpen = this.timeOpen.bind(this)
    this.dubbingClose = this.dubbingClose.bind(this)
    this.dubbingOpen = this.dubbingOpen.bind(this)
    this.dubbingFetch = this.dubbingFetch.bind(this)
    this.galleryOpen = this.galleryOpen.bind(this)
    this.galleryClose = this.galleryClose.bind(this)
  }

  open() {
    // Create the browser window.
    this.window = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload-main.js'),
        nodeIntegration: true,
        webSecurity: false
      },
    });

    // Load the index.html from the app or from local dev server in development mode
    this.window.loadURL(
      app.isPackaged
        ? `file://${path.join(__dirname, '../../index.html')}`
        : 'http://localhost:3000'
    );

    // Emitted when the window is closed.
    this.window.on('closed', () => {
      this.window = null;
    });

    this.initHandle()
  }

  initHandle() {
    ipcMain.addListener('time-open', this.timeOpen)
    ipcMain.addListener('dubbing-open', this.dubbingOpen)
    ipcMain.addListener('dubbing-open-create', this.dubbingOpenCreate)
    ipcMain.addListener('dubbing-fetch', this.dubbingFetch)
    ipcMain.addListener('gallery-open', this.galleryOpen)
  }

  timeOpen(event, argv) {
    this.timeWindow = new TimeWindow({
      minutes: argv.minutes,
      number: argv.number,
      type: argv.type,
      mainWindow: this.window,
      onClose: this.timeClose
    })
    this.timeWindow.start()
  }

  timeClose() {
    this.window.webContents.send('time-onchange', undefined);
    this.timeWindow = null;
  }

  dubbingOpen(event, argv) {
    this.dubbingWindow = new DubbingWindow({
      mainWindow: this.window,
      onClose: this.dubbingClose
    })
    this.dubbingWindow.start()
  }

  dubbingClose() {
    this.window.webContents.send('dubbing-onchange', undefined);
    this.dubbingWindow = null;
  }

  dubbingFetch() {
    this.window.webContents.send('dubbing-onchange', store.get('dubbings'));
  }

  galleryOpen(event, argv) {
    this.galleryWindow = new GalleryWindow({
      mainWindow: this.window,
      onClose: this.galleryClose
    })
    this.galleryWindow.start()
  }

  galleryClose() {
    this.window.webContents.send('gallery-onchange', undefined);
    this.galleryWindow = null;
  }

  reload() {
    if (this.window === null) {
      this.open()
    }
  }
}

module.exports = MainWindow
