const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const {
    listTrackUseCase,
    createTrackUseCase,
    updateTrackUseCase,
    deleteTrackUseCase,
    listWorkflowUseCase,
    createWorkflowUseCase,
    updateWorkflowUseCase,
    deleteWorkflowUseCase,
    listStepByWorkflowUseCase,
    createStepUseCase,
    updateStepUseCase,
    deleteStepUseCase,
    createSessionUseCase
} = require('../infrastructure/useCase.js');
const Workflow = require('../application/entity/Workflow.js');
const StepFactory = require('../application/entity/step/StepFactory.js');
const WorkflowWindow = require('./WorkflowWindow.js');
const StepWindow = require('./StepWindow.js')
const SessionWindow = require('./SessionWindow.js')

class MainWindow {
    constructor() {
        this.trackFetch = this.trackFetch.bind(this)
        this.trackSave = this.trackSave.bind(this)
        this.trackRemove = this.trackRemove.bind(this)
        this.trackPlay = this.trackPlay.bind(this)
        this.trackEnd = this.trackEnd.bind(this)
        this.workflowOpen = this.workflowOpen.bind(this)
        this.workflowFetch = this.workflowFetch.bind(this)
        this.workflowClose = this.workflowClose.bind(this)
        this.workflowRemove = this.workflowRemove.bind(this)
        this.workflowSave = this.workflowSave.bind(this)
        this.stepFetch = this.stepFetch.bind(this)
        this.stepOpen = this.stepOpen.bind(this)
        this.stepRemove = this.stepRemove.bind(this)
        this.stepSave = this.stepSave.bind(this)
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
            ipcMain.removeListener('track-fetch', this.trackFetch)
            ipcMain.removeListener('track-save', this.trackSave)
            ipcMain.removeListener('track-remove', this.trackRemove)
            ipcMain.removeListener('track-play', this.trackPlay)
            ipcMain.removeListener('track-end', this.trackEnd)
            ipcMain.removeListener('workflow-open', this.workflowOpen)
            ipcMain.removeListener('workflow-fetch', this.workflowFetch)
            ipcMain.removeListener('workflow-remove', this.workflowRemove)
            ipcMain.removeListener('workflow-save', this.workflowSave)
            ipcMain.removeListener('step-fetch', this.stepFetch)
            ipcMain.removeListener('step-open', this.stepOpen)
            ipcMain.removeListener('step-remove', this.stepRemove)
            ipcMain.removeListener('step-save-main', this.stepSave)
            ipcMain.removeListener('session-play', this.sessionPlay)
        });

        this.initHandle()
    }

    initHandle() {
        ipcMain.addListener('track-fetch', this.trackFetch)
        ipcMain.addListener('track-save', this.trackSave)
        ipcMain.addListener('track-remove', this.trackRemove)
        ipcMain.addListener('track-play', this.trackPlay)
        ipcMain.addListener('track-end', this.trackEnd)
        ipcMain.addListener('workflow-open', this.workflowOpen)
        ipcMain.addListener('workflow-fetch', this.workflowFetch)
        ipcMain.addListener('workflow-remove', this.workflowRemove)
        ipcMain.addListener('workflow-save', this.workflowSave)
        ipcMain.addListener('step-fetch', this.stepFetch)
        ipcMain.addListener('step-open', this.stepOpen)
        ipcMain.addListener('step-remove', this.stepRemove)
        ipcMain.addListener('step-save-main', this.stepSave)
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

    async workflowSave(event, value) {
        let workflow = value;
        if (undefined === workflow.createdAt) {
            workflow = new Workflow(workflow.id, workflow.name, workflow.color);
            await createWorkflowUseCase.execute(workflow);
        } else {
            await updateWorkflowUseCase.execute(workflow);
        }
        this.window.webContents.send('workflow-onchange', await listWorkflowUseCase.execute());
    }

    async trackFetch() {
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackSave(event, value) {
        if (value.id) {
            await updateTrackUseCase.execute(value.id, value);
        } else {
            await createTrackUseCase.execute(value);
        }
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackRemove(event, id) {
        await deleteTrackUseCase.execute(id);
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackPlay(event, id) {
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackEnd(event, id) {
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
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

    async stepSave(event, {workflowId, value, afterIndex}) {
        let step = value;
        if (undefined === step.createdAt) {
            step = StepFactory.fromData(step);
            await createStepUseCase.execute(workflowId, step, afterIndex);
        } else {
            await updateStepUseCase.execute(workflowId, step.id, step);
        }
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
