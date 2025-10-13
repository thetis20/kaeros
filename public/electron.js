const { app, BrowserWindow, ipcMain } = require('electron');
const MainWindow = require('./script/window/MainWindow')

const mainWindow = new MainWindow()

// Create window when Electron is ready
app.whenReady().then(()=>mainWindow.open());

// Quit when all windows are closed except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS re-create window when dock icon is clicked
app.on('activate', () => {
  mainWindow.reload()
});