const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DUBBING_STATE = require('../enum/DUBBING_STATE.js')
const store = require('../infrastructure/repository/store.js');
const Folder = require('../application/entity/Folder.js');
const { v4: uuidv4 } = require('uuid');
const { createFolderUseCase, updateFolderUseCase, listFolderUseCase } = require('../infrastructure/useCase.js');

class FolderWindow {
  constructor({ mainWindow, onClose, value }) {
    this.mainWindow = mainWindow
    this.onClose = onClose
    this.close = this.close.bind(this)
    this.value = value
    this.folderSave = this.folderSave.bind(this)

  }

  start() {
    return new Promise(resolve => {
      this.window = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
          preload: path.join(__dirname, '../preload/preload-folder.js'),
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
          this.window.webContents.send('folder-onchange', this.value);
        }
        resolve()
      });

      this.initHandle()
    })
  }

  initHandle() {
    ipcMain.addListener('folder-save', this.folderSave)
  }

  async folderSave(event, folder) {

    if (undefined === folder.createdAt) {
      folder = new Folder(folder.id, folder.name, folder.color);
      createFolderUseCase.execute(folder)
    } else {
      updateFolderUseCase.execute(folder)
    }

    this.mainWindow.webContents.send('folder-onchange', await listFolderUseCase.execute());
    this.window.close();
  }

  close() {
    ipcMain.removeListener('folder-save', this.folderSave)
    this.window = null;
    this.onClose();
  }
}

module.exports = FolderWindow