jest.mock('electron', () => ({
    app: {isPackaged: false},
    BrowserWindow: jest.fn(),
    ipcMain: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
    },
}));

jest.mock('../../infrastructure/useCase.js', () => ({}));
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
