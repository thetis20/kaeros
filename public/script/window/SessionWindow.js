const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const DUBBING_STATE = require('../enum/DUBBING_STATE');
const TrackFactory = require('../application/entity/track/TrackFactory');

class SessionWindow {
    constructor({mainWindow, onClose, session}) {
        this.mainWindow = mainWindow
        this.onClose = onClose
        this.session = session
        this.sessionNext = this.sessionNext.bind(this)
        this.sessionPrevious = this.sessionPrevious.bind(this)
        this.sessionToStep = this.sessionToStep.bind(this)
        this.trackChange = this.trackChange.bind(this)
    }

    start() {
        return new Promise(resolve => {
            this.window = new BrowserWindow({
                width: 1000,
                height: 800,
                webPreferences: {
                    preload: path.join(__dirname, '../preload/preload-session.js'),
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
                this.mainWindow.webContents.send('session-onchange', this.session);
                this.window.webContents.send('session-onchange', this.session);
                resolve()
            });

            this.initHandle()
        })

    }

    initHandle() {
        ipcMain.addListener('session-next', this.sessionNext)
        ipcMain.addListener('session-previous', this.sessionPrevious)
        ipcMain.addListener('session-toStep', this.sessionToStep)
        ipcMain.addListener('track-change', this.trackChange)
    }

    fetch() {
        this.mainWindow.webContents.send('session-onchange', this.session);
        this.window.webContents.send('session-onchange', this.session);
    }

    sessionNext(event) {
        this.session.index++;
        this.session.track = TrackFactory.fromStep(this.session.steps[this.session.index])
        this.fetch()
    }

    sessionPrevious(event) {
        this.session.index--;
        this.session.track = TrackFactory.fromStep(this.session.steps[this.session.index])
        this.fetch()
    }

    sessionToStep(event, index) {
        this.session.index = index;
        this.session.track = TrackFactory.fromStep(this.session.steps[this.session.index])
        this.fetch()
    }

    trackChange(event, changes) {
        for (const [key, value] of Object.entries(changes)) {
            this.session.track[key] = value
        }
        this.fetch()
    }

    close() {
        ipcMain.removeListener('session-next', this.sessionNext)
        ipcMain.removeListener('session-previous', this.sessionPrevious)
        ipcMain.removeListener('session-toStep', this.sessionToStep)
        ipcMain.removeListener('track-change', this.trackChange)
        this.window = null;
        this.onClose();
    }
}

module.exports = SessionWindow