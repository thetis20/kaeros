const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'time-onchange'
]


function _dispatchEvent(key, value){
  document.dispatchEvent(new CustomEvent(key, {detail: value,}))
}

for(const event of events){
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'time',
  timeOnChange:(status) => ipcRenderer.send('time-onchange', status),
})
