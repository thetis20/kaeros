const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'time-onchange',
  'dubbing-onchange'
]


function _dispatchEvent(key, value){
  document.dispatchEvent(new CustomEvent(key, {detail: value,}))
}

for(const event of events){
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'main',
  dubbingOpen:(minutes, number) => ipcRenderer.send('dubbing-open', {minutes, number}),
  dubbingOnChange:(status) => ipcRenderer.send('dubbing-onchange', status),
  timeOpen:(minutes, number) => ipcRenderer.send('time-open', {minutes, number}),
  timeOnChange:(status) => ipcRenderer.send('time-onchange', status),
  argv: process.argv
})
