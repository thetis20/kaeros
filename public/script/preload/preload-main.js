const { contextBridge, ipcRenderer } = require('electron')
const events = [
  'time-onchange',
  'dubbing-onchange',
  'playlist-onchange',
  'running-onchange',
  'folder-onchange',
  'audio-onchange',
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
  timeFetch: () => ipcRenderer.send('time-fetch'),
  timeOnChange: (status) => ipcRenderer.send('time-onchange', status),
  playlistOpen: (value) => ipcRenderer.send('playlist-open', value),
  playlistFetch: () => ipcRenderer.send('playlist-fetch'),
  playlistPlay: (playlist) => ipcRenderer.send('playlist-play', playlist),
  playlistRemove: (id) => ipcRenderer.send('playlist-remove', id),
  folderFetch: () => ipcRenderer.send('folder-fetch'),
  folderOpen: (value) => ipcRenderer.send('folder-open', value),
  folderRemove: (id) => ipcRenderer.send('folder-remove', id),
  audioFetch: (folderId) => ipcRenderer.send('audio-fetch', folderId),
  audioOpen: (folderId, audio) => ipcRenderer.send('audio-open', folderId, audio),
  audioRemove: (folderId, id) => ipcRenderer.send('audio-remove', folderId, id),
  argv: process.argv
})
