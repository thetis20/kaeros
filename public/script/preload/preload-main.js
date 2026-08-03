const {contextBridge, ipcRenderer, webUtils} = require('electron')
const events = [
    'time-onchange',
    'dubbing-onchange',
    'playlist-onchange',
    'running-onchange',
    'track-onchange',
    'workflow-onchange',
    'step-onchange',
    'session-onchange',
    'tag-onchange'
]


function _dispatchEvent(key, value) {
    document.dispatchEvent(new CustomEvent(key, {detail: value,}))
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
    trackFetch: () => ipcRenderer.send('track-fetch'),
    trackSave: (value) => {
        if (value.file !== undefined) {
            value.src = webUtils.getPathForFile(value.file)
            delete value.file
        }
        ipcRenderer.send('track-save', value)
    },
    trackRemove: (id) => ipcRenderer.send('track-remove', id),
    trackPlay: (id) => ipcRenderer.send('track-play', id),
    trackEnd: (id) => ipcRenderer.send('track-end', id),
    workflowFetch: () => ipcRenderer.send('workflow-fetch'),
    workflowRemove: (id) => ipcRenderer.send('workflow-remove', id),
    workflowSave: (value) => ipcRenderer.send('workflow-save', value),
    stepFetch: (workflowId) => ipcRenderer.send('step-fetch', workflowId),
    stepRemove: (workflowId, id) => ipcRenderer.send('step-remove', workflowId, id),
    stepSave: ({workflowId, value, afterIndex}) => {
        if (value.file !== undefined) {
            value.src = webUtils.getPathForFile(value.file)
            delete value.file
        }
        ipcRenderer.send('step-save-main', {workflowId, value, afterIndex})
    },
    sessionFetch: () => ipcRenderer.send('session-fetch'),
    sessionPlay: (workflow) => ipcRenderer.send('session-play', workflow),
    sessionNext: () => ipcRenderer.send('session-next'),
    sessionPrevious: () => ipcRenderer.send('session-previous'),
    sessionToStep: (index) => ipcRenderer.send('session-toStep', index),
    trackChange: (changes) => ipcRenderer.send('track-change', changes),
    tagFetch: () => ipcRenderer.send('tag-fetch'),
    tagCreate: (value) => ipcRenderer.send('tag-create', value),
})
