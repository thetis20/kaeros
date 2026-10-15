const {app, BrowserWindow, dialog, ipcMain} = require('electron');
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
    createSessionUseCase,
    listTagUseCase,
    createTagUseCase,
    checkMediaFilesUseCase,
    checkWorkflowMediaUseCase,
    exportWorkflowUseCase,
    importWorkflowUseCase,
    uninstallAppUseCase
} = require('../infrastructure/useCase.js');
const Workflow = require('../application/entity/Workflow.js');
const StepFactory = require('../application/entity/step/StepFactory.js');
const SessionWindow = require('./SessionWindow.js')

class MainWindow {
    constructor() {
        this.trackFetch = this.trackFetch.bind(this)
        this.trackSave = this.trackSave.bind(this)
        this.trackRemove = this.trackRemove.bind(this)
        this.trackPlay = this.trackPlay.bind(this)
        this.trackEnd = this.trackEnd.bind(this)
        this.workflowFetch = this.workflowFetch.bind(this)
        this.workflowRemove = this.workflowRemove.bind(this)
        this.workflowSave = this.workflowSave.bind(this)
        this.stepFetch = this.stepFetch.bind(this)
        this.stepRemove = this.stepRemove.bind(this)
        this.stepSave = this.stepSave.bind(this)
        this.sessionPlay = this.sessionPlay.bind(this)
        this.sessionFetch = this.sessionFetch.bind(this)
        this.sessionClose = this.sessionClose.bind(this)
        this.sessionStop = this.sessionStop.bind(this)
        this.tagFetch = this.tagFetch.bind(this)
        this.tagCreate = this.tagCreate.bind(this)
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
            ipcMain.removeListener('workflow-fetch', this.workflowFetch)
            ipcMain.removeListener('workflow-remove', this.workflowRemove)
            ipcMain.removeListener('workflow-save', this.workflowSave)
            ipcMain.removeListener('step-fetch', this.stepFetch)
            ipcMain.removeListener('step-remove', this.stepRemove)
            ipcMain.removeListener('step-save-main', this.stepSave)
            ipcMain.removeListener('session-play', this.sessionPlay)
            ipcMain.removeListener('session-stop', this.sessionStop)
            ipcMain.removeListener('tag-fetch', this.tagFetch)
            ipcMain.removeListener('tag-create', this.tagCreate)
            ipcMain.removeHandler('media-check-workflow')
            ipcMain.removeHandler('media-check-paths')
            ipcMain.removeHandler('workflow-export')
            ipcMain.removeHandler('workflow-import')
            ipcMain.removeHandler('app-uninstall')
        });

        this.initHandle()
    }

    initHandle() {
        ipcMain.addListener('track-fetch', this.trackFetch)
        ipcMain.addListener('track-save', this.trackSave)
        ipcMain.addListener('track-remove', this.trackRemove)
        ipcMain.addListener('track-play', this.trackPlay)
        ipcMain.addListener('track-end', this.trackEnd)
        ipcMain.addListener('workflow-fetch', this.workflowFetch)
        ipcMain.addListener('workflow-remove', this.workflowRemove)
        ipcMain.addListener('workflow-save', this.workflowSave)
        ipcMain.addListener('step-fetch', this.stepFetch)
        ipcMain.addListener('step-remove', this.stepRemove)
        ipcMain.addListener('step-save-main', this.stepSave)
        ipcMain.addListener('session-play', this.sessionPlay)
        ipcMain.addListener('session-stop', this.sessionStop)
        ipcMain.addListener('tag-fetch', this.tagFetch)
        ipcMain.addListener('tag-create', this.tagCreate)
        ipcMain.handle('media-check-workflow', (event, workflowId) => checkWorkflowMediaUseCase.execute(workflowId))
        ipcMain.handle('media-check-paths', (event, items) => checkMediaFilesUseCase.execute(items))
        ipcMain.handle('workflow-export', async (event, id) => {
            const workflows = await listWorkflowUseCase.execute();
            const workflow = workflows.find((w) => w.id === id);
            if (!workflow) {
                return {ok: false, error: 'not-found'};
            }
            const {canceled, filePath} = await dialog.showSaveDialog(this.window, {
                defaultPath: `${workflow.name}.zip`,
                filters: [{name: 'Zip', extensions: ['zip']}],
            });
            if (canceled || !filePath) {
                return {ok: false, canceled: true};
            }
            return exportWorkflowUseCase.execute(id, filePath);
        })
        ipcMain.handle('workflow-import', async () => {
            const {canceled, filePaths} = await dialog.showOpenDialog(this.window, {
                properties: ['openFile'],
                filters: [{name: 'Zip', extensions: ['zip']}],
            });
            if (canceled || !filePaths || filePaths.length === 0) {
                return {ok: false, canceled: true};
            }
            const result = await importWorkflowUseCase.execute(filePaths[0]);
            if (result.ok && this.window) {
                this.window.webContents.send('workflow-onchange', await listWorkflowUseCase.execute());
            }
            return result;
        })
        ipcMain.handle('app-uninstall', async () => {
            const {response} = await dialog.showMessageBox(this.window, {
                type: 'warning',
                buttons: ['Annuler', 'Désinstaller'],
                defaultId: 0,
                cancelId: 0,
                message: 'Désinstaller Kaeros ?',
                detail: 'Vos sessions et médias seront supprimés. Cette action est irréversible.',
            });
            if (response !== 1) {
                return {ok: false, canceled: true};
            }
            await this.closeSecondaryWindows();
            const result = await uninstallAppUseCase.execute();
            if (result.ok) {
                setImmediate(() => app.exit(0));
            }
            return result;
        })
    }

    async workflowFetch() {
        const workflows = await listWorkflowUseCase.execute();
        this.window.webContents.send('workflow-onchange', workflows);
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

    async tagFetch() {
        this.window.webContents.send('tag-onchange', await listTagUseCase.execute());
    }

    async tagCreate(event, value) {
        await createTagUseCase.execute(value);
        this.window.webContents.send('tag-onchange', await listTagUseCase.execute());
    }

    async stepFetch(event, workflowId) {
        const steps = await listStepByWorkflowUseCase.execute(workflowId)
        this.window.webContents.send('step-onchange', steps);
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

    sessionStop() {
        if (!this.sessionWindow) return;
        this.sessionWindow.window.close();
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
