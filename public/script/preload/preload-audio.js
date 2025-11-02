const { contextBridge, ipcRenderer, webUtils } = require('electron')
const events = [
  'audio-onchange'
]

function _dispatchEvent(key, value) {
  document.dispatchEvent(new CustomEvent(key, { detail: value, }))
}

for (const event of events) {
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'audio',
  audioSave: (value) => {
    if (value.file !== undefined) {
      value.src = webUtils.getPathForFile(value.file)
      delete value.file
    }
    ipcRenderer.send('audio-save', value)
  },
})
