const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getSerialPorts: (message) => ipcRenderer.invoke('getSerialPorts', message),
    writeArduino: (message) => ipcRenderer.send('arduinoWrite', message),
    readArduino: () => ipcRenderer.send('arduinoRead'),
    getErrors: (errorCallback) => {
        ipcRenderer.on('error', errorCallback);
        return () => {
            ipcRenderer.removeListener('error', errorCallback);
        };
    },
    getSensorValue: (sensorCallback) => {
        ipcRenderer.on('getSensorValue', sensorCallback);
        return () => {
            ipcRenderer.removeListener('getSensorValue', sensorCallback);
        };
    },
    // deviceNotFound: (device) => {
    //     ipcRenderer.on('deviceNotFound', device);
    //     return () => {
    //         ipcRenderer.removeListener('deviceNotFound', device);
    //     };

    // }
})

