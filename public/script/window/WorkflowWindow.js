const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {
  createWorkflowUseCase,
  updateWorkflowUseCase,
  listWorkflowUseCase
} = require('../infrastructure/useCase.js');
const Workflow = require('../application/entity/Workflow.js');

class WorkflowWindow {
  constructor({ mainWindow, onClose, value }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.close = this.close.bind(this)
    this.value = value
    this.save = this.save.bind(this)
  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-workflow.js'),
          nodeIntegration: true
        },
      });
      this.window.loadURL(
        app.isPackaged
          ? `file://${path.join(__dirname, '../../index.html')}`
          : 'http://localhost:3000'
      );
      this.window.on('closed', this.close);

      this.window.webContents.once('dom-ready', () => {
        if (this.value) {
          this.window.webContents.send('onchange', this.value);
        }
        resolve()
      });

      this.initHandle()
    })
  }

  initHandle() {
    ipcMain.addListener('save', this.save)
  }

  async save(event, workflow) {
    if (undefined === workflow.createdAt) {
      workflow = new Workflow(workflow.id, workflow.name, workflow.color);
      createWorkflowUseCase.execute(workflow)
    } else {
      updateWorkflowUseCase.execute(workflow)
    }

    this.mainWindow.webContents.send('workflow-onchange', await listWorkflowUseCase.execute());
    this.window.close();
  }

  close() {
    ipcMain.removeListener('save', this.save)
    this.window = null;
    this.onClose();
  }
}

module.exports = WorkflowWindow