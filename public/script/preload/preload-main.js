const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'time-onchange',
  'dubbing-onchange',
  'gallery-onchange'
]


function _dispatchEvent(key, value) {
  document.dispatchEvent(new CustomEvent(key, { detail: value, }))
}

for (const event of events) {
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'main',
  dubbingFetch: () => ipcRenderer.send('dubbing-fetch'),
  dubbingOpenCreate: () => ipcRenderer.send('dubbing-open-create'),
  dubbingOpen: () => ipcRenderer.send('dubbing-open'),
  dubbingOnChange: (status) => ipcRenderer.send('dubbing-onchange', status),
  timeOpen: (time) => ipcRenderer.send('time-open', time),
  timeOnChange: (status) => ipcRenderer.send('time-onchange', status),
  galleryOpen: () => ipcRenderer.send('gallery-open'),
  galleryOnChange: (gallery) => ipcRenderer.send('gallery-onchange', gallery),
  argv: process.argv
})
