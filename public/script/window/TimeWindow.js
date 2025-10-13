const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TIME_STATE = require('../enum/TIME_STATE')

class TimeWindow{
  constructor({minutes, number, mainWindow, onClose}){
    this.minutes = minutes
    this.number = number
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.time = {
      secondes: minutes * 60,
      number,
      state: TIME_STATE.PENDING,
      paused: true
    }
    this.handleTimeOnChange = this.handleTimeOnChange.bind(this)
  }

  start(){
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
    });

    this.initHandle()
  }

  initHandle(){
    ipcMain.addListener('time-onchange', this.handleTimeOnChange)
  }

  handleTimeOnChange(event, argv){
    this.time = argv;
    this.mainWindow.webContents.send('time-onchange', this.time);
    this.window.webContents.send('time-onchange', argv);
  }

  close(){
    ipcMain.removeListener('time-onchange', this.handleTimeOnChange)
    this.window = null;
    this.onClose();
  }
}

module.exports = TimeWindow