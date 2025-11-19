const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'session-onchange'
]

function _dispatchEvent(key, value) {
  document.dispatchEvent(new CustomEvent(key, { detail: value, }))
}

for (const event of events) {
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'session',
  sessionFetch: () => ipcRenderer.send('session-fetch'),
  sessionOnChange: (status) => ipcRenderer.send('session-onchange', status),
  sessionNext: () => ipcRenderer.send('session-next'),
  sessionPrevious: () => ipcRenderer.send('session-previous'),
  sessionToStep: (index) => ipcRenderer.send('session-toStep', index),
  trackPlay: () => ipcRenderer.send('track-play'),
  trackPause: () => ipcRenderer.send('track-pause'),
  trackPlus: () => ipcRenderer.send('track-plus'),
  trackMinus: () => ipcRenderer.send('track-minus')
})
