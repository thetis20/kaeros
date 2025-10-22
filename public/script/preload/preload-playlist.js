const { contextBridge, ipcRenderer, webUtils } = require('electron')
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
  mode: 'playlist',
  playlistSave: (value) => {
    for (const index in (value.videos || [])) {
      if (value.videos[index].file === undefined) {
        continue
      }
      value.videos[index].src = webUtils.getPathForFile(value.videos[index].file)
      delete value.videos[index].file
    }
    ipcRenderer.send('session-save', value)
  },
})
