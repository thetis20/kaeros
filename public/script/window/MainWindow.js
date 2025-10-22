const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TimeWindow = require('./TimeWindow.js')
const DubbingWindow = require('./DubbingWindow.js')
const store = require('../service/store.js')
const PlaylistWindow = require('./PlaylistWindow.js');

class MainWindow {
  constructor() {
    this.timeClose = this.timeClose.bind(this)
    this.timeFetch = this.timeFetch.bind(this)
    this.timeOpen = this.timeOpen.bind(this)
    this.dubbingClose = this.dubbingClose.bind(this)
    this.dubbingOpen = this.dubbingOpen.bind(this)
    this.dubbingFetch = this.dubbingFetch.bind(this)
    this.playlistOpen = this.playlistOpen.bind(this)
    this.playlistFetch = this.playlistFetch.bind(this)
    this.playlistClose = this.playlistClose.bind(this)
    this.playlistRemove = this.playlistRemove.bind(this)
    this.playlistPlay = this.playlistPlay.bind(this)
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
      ipcMain.removeListener('time-open', this.timeOpen)
      ipcMain.removeListener('time-fetch', this.timeFetch)
      ipcMain.removeListener('dubbing-open', this.dubbingOpen)
      ipcMain.removeListener('dubbing-fetch', this.dubbingFetch)
      ipcMain.removeListener('playlist-open', this.playlistOpen)
      ipcMain.removeListener('playlist-fetch', this.playlistFetch)
      ipcMain.removeListener('playlist-remove', this.playlistRemove)
      ipcMain.removeListener('playlist-play', this.playlistPlay)
    });

    this.initHandle()
  }

  initHandle() {
    ipcMain.addListener('time-open', this.timeOpen)
    ipcMain.addListener('dubbing-open', this.dubbingOpen)
    ipcMain.addListener('playlist-open', this.playlistOpen)
    ipcMain.addListener('playlist-fetch', this.playlistFetch)
    ipcMain.addListener('playlist-remove', this.playlistRemove)
    ipcMain.addListener('playlist-play', this.playlistPlay)
  }

  async timeOpen(event, argv) {
    if (this.timeWindow) {
      this.timeWindow.window.close()
    }
    if (this.dubbingWindow) {
      this.dubbingWindow.window.close()
    }
    this.timeWindow = new TimeWindow({
      minutes: argv.minutes,
      number: argv.number,
      type: argv.type,
      mainWindow: this.window,
      onClose: this.timeClose
    })
    await this.timeWindow.start()
    ipcMain.addListener('time-fetch', this.timeFetch)
  }

  timeFetch() {
    this.timeWindow.fetch();
  }

  timeClose() {
    this.window.webContents.send('time-onchange', undefined);
    this.timeWindow = null;
    this.setRunning(null)
    ipcMain.removeListener('time-fetch', this.timeFetch)
  }

  async dubbingOpen(event, dubbing) {
    if (this.timeWindow) {
      this.timeWindow.window.close()
    }
    if (this.dubbingWindow) {
      this.dubbingWindow.window.close()
    }
    this.dubbingWindow = new DubbingWindow({
      mainWindow: this.window,
      onClose: this.dubbingClose,
      videos: dubbing.videos
    })
    await this.dubbingWindow.start()
    ipcMain.addListener('dubbing-fetch', this.dubbingFetch)
  }

  dubbingClose() {
    this.window.webContents.send('dubbing-onchange', undefined);
    this.dubbingWindow = null;
    this.setRunning(null)
    ipcMain.removeListener('dubbing-fetch', this.dubbingFetch)
  }

  dubbingFetch() {
    this.dubbingWindow.fetch();
  }

  playlistOpen(event, value) {
    this.playlistWindow = new PlaylistWindow({
      mainWindow: this.window,
      value,
      onClose: this.playlistClose
    })
    this.playlistWindow.start()
  }

  playlistFetch() {
    this.window.webContents.send('playlist-onchange', store.get('playlists'));
  }

  playlistRemove(event, id) {
    const playlists = store.get('playlists').filter(playlist => playlist.id !== id)
    store.set('playlists', playlists)
    this.window.webContents.send('playlist-onchange', playlists);
  }

  async playlistPlay(event, playlist) {
    if (playlist.type === 'time') {
      await this.timeOpen(event, playlist)
    } else if (playlist.type === 'dubbing') {
      await this.dubbingOpen(event, playlist)
    }
    this.setRunning(playlist.type)
  }

  playlistClose() {
    this.playlistWindow = null;
  }

  setRunning(value) {
    this.running = value
    this.window.webContents.send('running-onchange', this.running);
  }

  reload() {
    if (this.window === null) {
      this.open()
    }
  }
}

module.exports = MainWindow
