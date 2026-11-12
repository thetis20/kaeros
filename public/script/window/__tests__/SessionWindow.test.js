jest.mock('electron', () => {
    const handlers = {};
    const window = {
        loadURL: jest.fn(),
        on: jest.fn((event, cb) => { handlers[event] = cb; }),
        webContents: {
            send: jest.fn(),
            once: jest.fn((event, cb) => { handlers[`wc:${event}`] = cb; }),
        },
    };
    return {
        __handlers: handlers,
        app: {isPackaged: false},
        BrowserWindow: jest.fn(() => window),
        ipcMain: {addListener: jest.fn(), removeListener: jest.fn()},
        powerSaveBlocker: {
            start: jest.fn(() => 42),
            stop: jest.fn(),
            isStarted: jest.fn(() => true),
        },
    };
});
jest.mock('../../application/entity/track/TrackFactory', () => ({fromStep: jest.fn()}));

const electron = require('electron');
const SessionWindow = require('../SessionWindow.js');

describe('SessionWindow power save blocker', () => {
    beforeEach(() => jest.clearAllMocks());

    it('prevents display sleep while the session is open and releases it on close', async () => {
        const onClose = jest.fn();
        const sessionWindow = new SessionWindow({
            mainWindow: {webContents: {send: jest.fn()}},
            onClose,
            session: {},
        });

        const started = sessionWindow.start();
        expect(electron.powerSaveBlocker.start).toHaveBeenCalledWith('prevent-display-sleep');

        electron.__handlers['wc:dom-ready']();
        await started;
        expect(electron.powerSaveBlocker.stop).not.toHaveBeenCalled();

        electron.__handlers.closed();
        expect(electron.powerSaveBlocker.stop).toHaveBeenCalledWith(42);
        expect(onClose).toHaveBeenCalled();
    });
});
