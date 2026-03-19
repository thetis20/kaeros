const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const {
    listFolderUseCase,
    deleteFolderUseCase,
    listAudioByFolderUseCase,
    updateAudioUseCase,
    deleteAudioUseCase,
    listWorkflowUseCase,
    deleteWorkflowUseCase,
    listStepByWorkflowUseCase,
    deleteStepUseCase,
    createSessionUseCase
} = require('../infrastructure/useCase.js');
const FolderWindow = require('./FolderWindow.js');
const AudioWindow = require('./AudioWindow.js');
const WorkflowWindow = require('./WorkflowWindow.js');
const StepWindow = require('./StepWindow.js')
const SessionWindow = require('./SessionWindow.js')

class MainWindow {
    constructor() {
        this.folderFetch = this.folderFetch.bind(this)
        this.folderOpen = this.folderOpen.bind(this)
        this.folderClose = this.folderClose.bind(this)
        this.folderRemove = this.folderRemove.bind(this)
        this.audioFetch = this.audioFetch.bind(this)
        this.audioOpen = this.audioOpen.bind(this)
        this.audioRemove = this.audioRemove.bind(this)
        this.audioPlay = this.audioPlay.bind(this)
        this.audioEnd = this.audioEnd.bind(this)
        this.workflowOpen = this.workflowOpen.bind(this)
        this.workflowFetch = this.workflowFetch.bind(this)
        this.workflowClose = this.workflowClose.bind(this)
        this.workflowRemove = this.workflowRemove.bind(this)
        this.stepFetch = this.stepFetch.bind(this)
        this.stepOpen = this.stepOpen.bind(this)
        this.stepRemove = this.stepRemove.bind(this)
        this.sessionPlay = this.sessionPlay.bind(this)
        this.sessionFetch = this.sessionFetch.bind(this)
        this.sessionClose = this.sessionClose.bind(this)
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
            ipcMain.removeListener('folder-fetch', this.folderFetch)
            ipcMain.removeListener('folder-open', this.folderOpen)
            ipcMain.removeListener('folder-remove', this.folderRemove)
            ipcMain.removeListener('audio-fetch', this.audioFetch)
            ipcMain.removeListener('audio-open', this.audioOpen)
            ipcMain.removeListener('audio-remove', this.audioRemove)
            ipcMain.removeListener('audio-play', this.audioPlay)
            ipcMain.removeListener('audio-end', this.audioEnd)
            ipcMain.removeListener('workflow-open', this.workflowOpen)
            ipcMain.removeListener('workflow-fetch', this.workflowFetch)
            ipcMain.removeListener('workflow-remove', this.workflowRemove)
            ipcMain.removeListener('step-fetch', this.stepFetch)
            ipcMain.removeListener('step-open', this.stepOpen)
            ipcMain.removeListener('step-remove', this.stepRemove)
            ipcMain.removeListener('session-play', this.sessionPlay)
        });

        this.initHandle()
    }

    initHandle() {
        ipcMain.addListener('folder-fetch', this.folderFetch)
        ipcMain.addListener('folder-open', this.folderOpen)
        ipcMain.addListener('folder-remove', this.folderRemove)
        ipcMain.addListener('audio-fetch', this.audioFetch)
        ipcMain.addListener('audio-open', this.audioOpen)
        ipcMain.addListener('audio-remove', this.audioRemove)
        ipcMain.addListener('audio-play', this.audioPlay)
        ipcMain.addListener('audio-end', this.audioEnd)
        ipcMain.addListener('workflow-open', this.workflowOpen)
        ipcMain.addListener('workflow-fetch', this.workflowFetch)
        ipcMain.addListener('workflow-remove', this.workflowRemove)
        ipcMain.addListener('step-fetch', this.stepFetch)
        ipcMain.addListener('step-open', this.stepOpen)
        ipcMain.addListener('step-remove', this.stepRemove)
        ipcMain.addListener('session-play', this.sessionPlay)
    }

    workflowOpen(event, value) {
        this.workflowWindow = new WorkflowWindow({
            mainWindow: this.window,
            value,
            onClose: this.workflowClose
        })
        this.workflowWindow.start()
    }

    async workflowFetch() {
        const workflows = await listWorkflowUseCase.execute();
        this.window.webContents.send('workflow-onchange', workflows);
    }

    workflowClose() {
        this.workflowWindow = null;
    }

    async workflowRemove(event, id) {
        await deleteWorkflowUseCase.execute(id);
        this.window.webContents.send('workflow-onchange', await listWorkflowUseCase.execute());
    }

    async folderFetch() {
        this.window.webContents.send('folder-onchange', await listFolderUseCase.execute());
    }

    folderOpen(event, value) {
        this.folderWindow = new FolderWindow({
            mainWindow: this.window,
            value,
            onClose: this.folderClose
        })
        this.folderWindow.start()
    }

    folderClose() {
        this.folderWindow = null;
    }

    async folderRemove(event, id) {
        await deleteFolderUseCase.execute(id);
        this.window.webContents.send('folder-onchange', await listFolderUseCase.execute());
    }

    async audioFetch(event, folderId) {
        this.window.webContents.send('audio-onchange', await listAudioByFolderUseCase.execute(folderId));
    }

    audioOpen(event, folderId, value) {
        this.audioWindow = new AudioWindow({
            mainWindow: this.window,
            value,
            onClose: this.audioClose,
            folderId
        })
        this.audioWindow.start()
    }

    async audioRemove(event, folderId, id) {
        await deleteAudioUseCase.execute(folderId, id);
        this.window.webContents.send('audio-onchange', await listAudioByFolderUseCase.execute(folderId));
    }

    async audioPlay(event, folderId, id) {
        const audios = await listAudioByFolderUseCase.execute(folderId);
        const audio = audios.find(audio => audio.id === id);
        audio.playing = true;
        updateAudioUseCase.execute(folderId, audio.id, audio)
        this.window.webContents.send('audio-onchange', await listAudioByFolderUseCase.execute(folderId));
    }

    async audioEnd(event, folderId, id) {
        const audios = await listAudioByFolderUseCase.execute(folderId);
        const audio = audios.find(audio => audio.id === id);
        delete audio.playing;
        updateAudioUseCase.execute(folderId, audio.id, audio)
        this.window.webContents.send('audio-onchange', await listAudioByFolderUseCase.execute(folderId));
    }

    async stepFetch(event, workflowId) {
        const steps = await listStepByWorkflowUseCase.execute(workflowId)
        this.window.webContents.send('step-onchange', steps);
    }

    stepOpen(event, {workflowId, value, afterIndex}) {
        this.stepWindow = new StepWindow({
            mainWindow: this.window,
            value,
            onClose: this.stepClose,
            afterIndex,
            workflowId
        })
        this.stepWindow.start()
    }

    async stepRemove(event, workflowId, id) {
        await deleteStepUseCase.execute(workflowId, id);
        this.window.webContents.send('step-onchange', await listStepByWorkflowUseCase.execute(workflowId));
    }

    sessionFetch() {
        if (!this.sessionWindow) return;
        this.sessionWindow.fetch();
    }

    async sessionPlay(event, workflow) {
        await this.closeSecondaryWindows()
        const session = await createSessionUseCase.execute(workflow)

        this.sessionWindow = new SessionWindow({
            mainWindow: this.window,
            onClose: this.sessionClose,
            session
        })
        await this.sessionWindow.start()
        ipcMain.addListener('session-fetch', this.sessionFetch)
    }

    async sessionClose() {
        this.sessionWindow = null;
        ipcMain.removeListener('session-fetch', this.sessionFetch)
        this.window.webContents.send('session-onchange', undefined);
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

    async closeSecondaryWindows() {

        if (this.sessionWindow) {
            this.sessionWindow.window.close()
            await new Promise(r => setTimeout(r, 1000));
        }

    }
}

module.exports = MainWindow
