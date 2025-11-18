const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Step = require('../application/entity/Step.js');
const {
  createStepUseCase,
  updateStepUseCase,
  listStepByWorkflowUseCase
} = require('../infrastructure/useCase.js');
const StepFactory = require('../application/entity/StepFactory.js');

class StepWindow {
  constructor({ mainWindow, onClose, value, workflowId, afterIndex }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.close = this.close.bind(this)
    this.value = value
    this.workflowId = workflowId
    this.afterIndex = afterIndex
    this.stepSave = this.stepSave.bind(this)

  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-step.js'),
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
        if (this.value !== undefined) {
          this.window.webContents.send('step-onchange', this.value);
        }

        resolve()
      });

      this.initHandle()
    })
  }

  initHandle() {
    ipcMain.addListener('step-save', this.stepSave)
  }

  async stepSave(event, step) {

    if (undefined === step.createdAt) {
      step = StepFactory.fromData(step);
      createStepUseCase.execute(this.workflowId, step, this.afterIndex)
    } else {
      updateStepUseCase.execute(this.workflowId, step.id, step)
    }

    this.mainWindow.webContents.send('step-onchange', await listStepByWorkflowUseCase.execute(this.workflowId));
    this.window.close();
  }

  close() {
    ipcMain.removeListener('step-save', this.stepSave)
    this.window = null;
    this.onClose();
  }
}

module.exports = StepWindow