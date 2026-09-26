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
        invoke: jest.fn(),
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

describe('preload-main media check IPC methods', () => {
    beforeEach(() => {
        jest.resetModules();
        capturedApi = undefined;
    });

    it('invokes media-check-workflow with the workflowId', () => {
        require('../preload-main.js');
        const {ipcRenderer} = require('electron');

        expect(capturedApi.mediaCheckWorkflow).toEqual(expect.any(Function));

        capturedApi.mediaCheckWorkflow('wf1');

        expect(ipcRenderer.invoke).toHaveBeenCalledWith('media-check-workflow', 'wf1');
    });

    it('invokes media-check-paths with the items', () => {
        require('../preload-main.js');
        const {ipcRenderer} = require('electron');
        const items = [{id: '1', src: '/tmp/a'}];

        expect(capturedApi.mediaCheckPaths).toEqual(expect.any(Function));

        capturedApi.mediaCheckPaths(items);

        expect(ipcRenderer.invoke).toHaveBeenCalledWith('media-check-paths', items);
    });
});
