const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const TimeWindow = require('./TimeWindow.js')
const DubbingWindow = require('./DubbingWindow.js')
//const Store = require('electron-store').default
//const store = new Store();

class MainWindow{
    constructor(){
      this.closeTime = this.closeTime.bind(this)
      this.openTime = this.openTime.bind(this)
      this.closeDubbing = this.closeDubbing.bind(this)
      this.openDubbing = this.openDubbing.bind(this)
    }

    open(){
      // Create the browser window.
      this.window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-main.js'),
          nodeIntegration: true
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

    initHandle(){
        ipcMain.addListener('time-open', this.openTime)
        ipcMain.addListener('dubbing-open', this.openDubbing)
    }

    openTime(event, argv){
      this.timeWindow = new TimeWindow({
        minutes: argv.minutes, 
        number: argv.number, 
        mainWindow: this.window, 
        onClose: this.closeTime
      })
      this.timeWindow.start()
    }

    closeTime(){
      this.window.webContents.send('time-onchange', undefined);
      this.timeWindow = null;
    }

    openDubbing(event, argv){
      this.dubbingWindow = new DubbingWindow({
        mainWindow: this.window, 
        onClose: this.closeDubbing
      })
      this.dubbingWindow.start()
    }

    closeDubbing(){
      this.window.webContents.send('dubbing-onchange', undefined);
      this.dubbingWindow = null;
    }

    reload(){
      if(this.window === null){
        this.open()
      }
    }
}

module.exports = MainWindow
