let capturedApi;

jest.mock('electron', () => ({
    contextBridge: {
        exposeInMainWorld: jest.fn((_, api) => {
            capturedApi = api;
        }),
    },
    ipcRenderer: {
        on: jest.fn(),
        send: jest.fn(),
    },
    webUtils: {
        getPathForFile: jest.fn(),
    },
}));

describe('preload-main sessionStop', () => {
    beforeEach(() => {
        jest.resetModules();
        capturedApi = undefined;
    });

    it('sends the session-stop channel with no arguments', () => {
        require('../preload-main.js');
        const {ipcRenderer} = require('electron');

        expect(capturedApi.sessionStop).toEqual(expect.any(Function));

        capturedApi.sessionStop();

        expect(ipcRenderer.send).toHaveBeenCalledWith('session-stop');
    });
});
