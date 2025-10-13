const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DUBBING_STATE = require('../enum/DUBBING_STATE')

const data = [
    {
        "url":"video/time-intro.mp4",
        "title":"Fleabag S2E4",
        "time":"1min30",
        "mainCharacters":[{"name":"1 femme brune"}, {"name":"1 homme", "description":"Parle dès la première image"}],
        "secondaryCharacters":[{"name":"1 femme blonde"}]
    },{
        "url":"video/time-intro.mp4",
        "title":"Allo Mc Fly",
        "time":"2min30",
        "description":"Vidéo de démonstration pour le projet de doublage improvisé."
    },
    {
        "url":"video/time-intro.mp4",
        "time":"1min",
        "title":"Le sens de la fête",
        "description":"Vidéo de démonstration pour le projet de doublage improvisé."
    }
]

class DubbingWindow{
  constructor({mainWindow, onClose}){
    this.videos = data
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.dubbing = {
      state: DUBBING_STATE.PENDING,
      index: 0,
      paused: true,
      videos: data
    }
    this.handleDubbingOnChange = this.handleDubbingOnChange.bind(this)
  }

  start(){
    this.window = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload-dubbing.js'),
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
        this.mainWindow.webContents.send('dubbing-onchange', this.dubbing);
        this.window.webContents.send('dubbing-onchange', this.dubbing);
    });

    this.initHandle()
  }

  initHandle(){
    ipcMain.addListener('dubbing-onchange', this.handleDubbingOnChange)
  }

  handleDubbingOnChange(event, argv){
    this.dubbing = argv;
    this.mainWindow.webContents.send('dubbing-onchange', this.dubbing);
    this.window.webContents.send('dubbing-onchange', argv);
  }

  close(){
    ipcMain.removeListener('dubbing-onchange', this.handleDubbingOnChange)
    this.window = null;
    this.onClose();
  }
}

module.exports = DubbingWindow