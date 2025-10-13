const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'dubbing-onchange'
]

function _dispatchEvent(key, value){
  document.dispatchEvent(new CustomEvent(key, {detail: value,}))
}

for(const event of events){
  ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
  mode: 'dubbing',
  dubbingOnChange:(status) => ipcRenderer.send('dubbing-onchange', status),
})
