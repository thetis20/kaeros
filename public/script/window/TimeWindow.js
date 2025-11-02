const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TIME_STATE = require('../enum/TIME_STATE')

class TimeWindow {
  constructor({ minutes, number, type, mainWindow, onClose }) {
    this.minutes = minutes
    this.number = number
    this.type = type
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.time = {
      minutes: this.minutes,
      secondes: minutes * 60,
      number: 1,
      maxNumber: number,
      type,
      state: TIME_STATE.PENDING,
      paused: true
    }
    this.handleTimeOnChange = this.handleTimeOnChange.bind(this)
  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-time.js'),
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
        this.mainWindow.webContents.send('time-onchange', this.time);
        this.window.webContents.send('time-onchange', this.time);
        resolve()
      });

      this.initHandle()
    })
  }

  initHandle() {
    ipcMain.addListener('time-onchange', this.handleTimeOnChange)
  }

  handleTimeOnChange(event, time) {
    if (time.number < 1) {
      time.number = 1
    } else if (time.number > time.maxNumber) {
      time.number = time.maxNumber
    }
    this.time = time;
    this.mainWindow.webContents.send('time-onchange', this.time);
    this.window.webContents.send('time-onchange', this.time);
  }

  fetch() {
    this.mainWindow.webContents.send('time-onchange', this.time);
    this.window.webContents.send('time-onchange', this.time);
  }

  close() {
    ipcMain.removeListener('time-onchange', this.handleTimeOnChange)
    this.window = null;
    this.onClose();
  }
}

module.exports = TimeWindow