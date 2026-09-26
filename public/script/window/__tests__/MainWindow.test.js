jest.mock('electron', () => ({
    app: {isPackaged: false},
    BrowserWindow: jest.fn(),
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
