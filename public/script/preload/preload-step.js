const { contextBridge, ipcRenderer, webUtils } = require('electron')
const events = [
  'step-onchange'
]

function _dispatchEvent(key, value) {
  document.dispatchEvent(new CustomEvent(key, { detail: value, }))
}

for (const event of events) {
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'step',
  stepSave: (value) => {
    if (value.file !== undefined) {
      value.src = webUtils.getPathForFile(value.file)
      delete value.file
    }
    ipcRenderer.send('step-save', value)
  },
})
