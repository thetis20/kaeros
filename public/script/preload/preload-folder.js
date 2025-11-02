const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'folder-onchange'
]

function _dispatchEvent(key, value) {
  document.dispatchEvent(new CustomEvent(key, { detail: value, }))
}

for (const event of events) {
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'folder',
  folderSave: (value) => {
    ipcRenderer.send('folder-save', value)
  },
})
