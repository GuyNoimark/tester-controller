const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getSerialPorts: (title) => ipcRenderer.send('getSerialPorts', title)
})

