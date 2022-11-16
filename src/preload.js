const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getSerialPorts: (message) => ipcRenderer.send('getSerialPorts', message),
    writeArduino: (message) => ipcRenderer.send('arduinoWrite', message),
    readArduino: () => ipcRenderer.send('arduinoRead'),
})

