jest.mock('electron', () => ({
    app: {isPackaged: false, exit: jest.fn()},
    shell: {trashItem: jest.fn()},
    BrowserWindow: jest.fn(),
    dialog: {showSaveDialog: jest.fn(), showOpenDialog: jest.fn(), showMessageBox: jest.fn()},
    ipcMain: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        handle: jest.fn(),
        removeHandler: jest.fn(),
    },
}));

jest.mock('../../infrastructure/useCase.js', () => ({
    checkWorkflowMediaUseCase: {execute: jest.fn()},
    checkMediaFilesUseCase: {execute: jest.fn()},
    listWorkflowUseCase: {execute: jest.fn()},
    exportWorkflowUseCase: {execute: jest.fn()},
    importWorkflowUseCase: {execute: jest.fn()},
    uninstallAppUseCase: {execute: jest.fn()},
}));
jest.mock('../../application/entity/Workflow.js', () => ({}));
jest.mock('../../application/entity/step/StepFactory.js', () => ({}));
jest.mock('../SessionWindow.js', () => jest.fn());

const {ipcMain} = require('electron');
const MainWindow = require('../MainWindow.js');

describe('MainWindow session-stop IPC channel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registers the session-stop channel with the bound sessionStop method on initHandle()', () => {
        const mw = new MainWindow();

        mw.initHandle();

        expect(ipcMain.addListener).toHaveBeenCalledWith('session-stop', mw.sessionStop);
    });

    it('closes the session window when sessionStop is invoked with an active session window', () => {
        const mw = new MainWindow();
        const close = jest.fn();
        mw.sessionWindow = {window: {close}};

        mw.sessionStop();

        expect(close).toHaveBeenCalledTimes(1);
    });

    it('is a silent no-op when sessionStop is invoked without a session window', () => {
        const mw = new MainWindow();
        mw.sessionWindow = null;

        expect(() => mw.sessionStop()).not.toThrow();
    });
});

describe('MainWindow media-check IPC channels', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registers both media-check handlers on initHandle()', () => {
        const mw = new MainWindow();

        mw.initHandle();

        expect(ipcMain.handle).toHaveBeenCalledWith('media-check-workflow', expect.any(Function));
        expect(ipcMain.handle).toHaveBeenCalledWith('media-check-paths', expect.any(Function));
    });

    it('delegates media-check-workflow to checkWorkflowMediaUseCase.execute with the workflowId', () => {
        const {checkWorkflowMediaUseCase} = require('../../infrastructure/useCase.js');
        const mw = new MainWindow();

        mw.initHandle();

        const handler = ipcMain.handle.mock.calls.find(([channel]) => channel === 'media-check-workflow')[1];
        handler({}, 'wf1');

        expect(checkWorkflowMediaUseCase.execute).toHaveBeenCalledWith('wf1');
    });

    it('delegates media-check-paths to checkMediaFilesUseCase.execute with the items', () => {
        const {checkMediaFilesUseCase} = require('../../infrastructure/useCase.js');
        const mw = new MainWindow();
        const items = [{id: '1', src: '/tmp/a'}];

        mw.initHandle();

        const handler = ipcMain.handle.mock.calls.find(([channel]) => channel === 'media-check-paths')[1];
        handler({}, items);

        expect(checkMediaFilesUseCase.execute).toHaveBeenCalledWith(items);
    });

    it('removes both media-check handlers when the window is closed', () => {
        const {BrowserWindow} = require('electron');
        let closedCallback;
        BrowserWindow.mockImplementation(() => ({
            on: jest.fn((event, cb) => {
                if (event === 'closed') closedCallback = cb;
            }),
            loadURL: jest.fn(),
            webContents: {send: jest.fn()},
        }));
        const mw = new MainWindow();

        mw.open();
        closedCallback();

        expect(ipcMain.removeHandler).toHaveBeenCalledWith('media-check-workflow');
        expect(ipcMain.removeHandler).toHaveBeenCalledWith('media-check-paths');
    });
});

describe('MainWindow workflow export/import IPC channels', () => {
    const {dialog} = require('electron');
    const useCases = require('../../infrastructure/useCase.js');

    const handlerFor = (channel) => {
        const mw = new MainWindow();
        mw.window = {webContents: {send: jest.fn()}};
        mw.initHandle();
        return {mw, handler: ipcMain.handle.mock.calls.find(([c]) => c === channel)[1]};
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useCases.listWorkflowUseCase.execute.mockResolvedValue([{id: 'wf1', name: 'My session'}]);
    });

    it('registers both handlers on initHandle()', () => {
        new MainWindow().initHandle();

        expect(ipcMain.handle).toHaveBeenCalledWith('workflow-export', expect.any(Function));
        expect(ipcMain.handle).toHaveBeenCalledWith('workflow-import', expect.any(Function));
    });

    it('export asks for a destination and delegates to the use case', async () => {
        dialog.showSaveDialog.mockResolvedValue({canceled: false, filePath: '/tmp/out.zip'});
        useCases.exportWorkflowUseCase.execute.mockResolvedValue({ok: true, path: '/tmp/out.zip'});
        const {mw, handler} = handlerFor('workflow-export');

        const result = await handler({}, 'wf1');

        expect(dialog.showSaveDialog).toHaveBeenCalledWith(mw.window, {
            defaultPath: 'My session.zip',
            filters: [{name: 'Zip', extensions: ['zip']}],
        });
        expect(useCases.exportWorkflowUseCase.execute).toHaveBeenCalledWith('wf1', '/tmp/out.zip');
        expect(result).toEqual({ok: true, path: '/tmp/out.zip'});
    });

    it('export returns canceled when the dialog is dismissed', async () => {
        dialog.showSaveDialog.mockResolvedValue({canceled: true});
        const {handler} = handlerFor('workflow-export');

        expect(await handler({}, 'wf1')).toEqual({ok: false, canceled: true});
        expect(useCases.exportWorkflowUseCase.execute).not.toHaveBeenCalled();
    });

    it('import returns canceled when the dialog is dismissed', async () => {
        dialog.showOpenDialog.mockResolvedValue({canceled: true, filePaths: []});
        const {handler} = handlerFor('workflow-import');

        expect(await handler({})).toEqual({ok: false, canceled: true});
        expect(useCases.importWorkflowUseCase.execute).not.toHaveBeenCalled();
    });

    it('import delegates to the use case and notifies workflow-onchange on success', async () => {
        dialog.showOpenDialog.mockResolvedValue({canceled: false, filePaths: ['/tmp/in.zip']});
        useCases.importWorkflowUseCase.execute.mockResolvedValue({ok: true, workflowId: 'new'});
        const {mw, handler} = handlerFor('workflow-import');

        const result = await handler({});

        expect(dialog.showOpenDialog).toHaveBeenCalledWith(mw.window, {
            properties: ['openFile'],
            filters: [{name: 'Zip', extensions: ['zip']}],
        });
        expect(useCases.importWorkflowUseCase.execute).toHaveBeenCalledWith('/tmp/in.zip');
        expect(result).toEqual({ok: true, workflowId: 'new'});
        expect(mw.window.webContents.send).toHaveBeenCalledWith('workflow-onchange', [{id: 'wf1', name: 'My session'}]);
    });

    it('import does not notify on failure', async () => {
        dialog.showOpenDialog.mockResolvedValue({canceled: false, filePaths: ['/tmp/in.zip']});
        useCases.importWorkflowUseCase.execute.mockResolvedValue({ok: false, error: 'invalid'});
        const {mw, handler} = handlerFor('workflow-import');

        expect(await handler({})).toEqual({ok: false, error: 'invalid'});
        expect(mw.window.webContents.send).not.toHaveBeenCalled();
    });

    it('removes both handlers when the window is closed', () => {
        const {BrowserWindow} = require('electron');
        let closedCallback;
        BrowserWindow.mockImplementation(() => ({
            on: jest.fn((event, cb) => {
                if (event === 'closed') closedCallback = cb;
            }),
            loadURL: jest.fn(),
            webContents: {send: jest.fn()},
        }));

        new MainWindow().open();
        closedCallback();

        expect(ipcMain.removeHandler).toHaveBeenCalledWith('workflow-export');
        expect(ipcMain.removeHandler).toHaveBeenCalledWith('workflow-import');
    });
});

describe('MainWindow app-uninstall IPC channel', () => {
    const {app, dialog} = require('electron');
    const useCases = require('../../infrastructure/useCase.js');

    const handlerFor = (channel) => {
        const mw = new MainWindow();
        mw.window = {webContents: {send: jest.fn()}};
        mw.closeSecondaryWindows = jest.fn().mockResolvedValue(undefined);
        mw.initHandle();
        return {mw, handler: ipcMain.handle.mock.calls.find(([c]) => c === channel)[1]};
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('registers the handler on initHandle()', () => {
        new MainWindow().initHandle();

        expect(ipcMain.handle).toHaveBeenCalledWith('app-uninstall', expect.any(Function));
    });

    it('returns canceled without running the use case when the user cancels', async () => {
        dialog.showMessageBox.mockResolvedValue({response: 0});
        const {mw, handler} = handlerFor('app-uninstall');

        expect(await handler({})).toEqual({ok: false, canceled: true});
        expect(dialog.showMessageBox).toHaveBeenCalledWith(mw.window, expect.objectContaining({
            type: 'warning',
            buttons: ['Annuler', 'Désinstaller'],
            defaultId: 0,
            cancelId: 0,
        }));
        expect(mw.closeSecondaryWindows).not.toHaveBeenCalled();
        expect(useCases.uninstallAppUseCase.execute).not.toHaveBeenCalled();
        expect(app.exit).not.toHaveBeenCalled();
    });

    it('runs the use case and quits the app once confirmed', async () => {
        dialog.showMessageBox.mockResolvedValue({response: 1});
        useCases.uninstallAppUseCase.execute.mockResolvedValue({ok: true, mode: 'mac-trash'});
        const {mw, handler} = handlerFor('app-uninstall');

        const result = await handler({});

        expect(mw.closeSecondaryWindows).toHaveBeenCalledTimes(1);
        expect(useCases.uninstallAppUseCase.execute).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ok: true, mode: 'mac-trash'});
        expect(app.exit).not.toHaveBeenCalled();
        await new Promise((resolve) => setImmediate(resolve));
        expect(app.exit).toHaveBeenCalledWith(0);
    });

    it('does not quit when the use case fails', async () => {
        dialog.showMessageBox.mockResolvedValue({response: 1});
        useCases.uninstallAppUseCase.execute.mockResolvedValue({ok: false, error: 'boom'});
        const {handler} = handlerFor('app-uninstall');

        expect(await handler({})).toEqual({ok: false, error: 'boom'});
        await new Promise((resolve) => setImmediate(resolve));
        expect(app.exit).not.toHaveBeenCalled();
    });

    it('removes the handler when the window is closed', () => {
        const {BrowserWindow} = require('electron');
        let closedCallback;
        BrowserWindow.mockImplementation(() => ({
            on: jest.fn((event, cb) => {
                if (event === 'closed') closedCallback = cb;
            }),
            loadURL: jest.fn(),
            webContents: {send: jest.fn()},
        }));

        new MainWindow().open();
        closedCallback();

        expect(ipcMain.removeHandler).toHaveBeenCalledWith('app-uninstall');
    });
});
