const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

const SerialPort = require("serialport");
const serialPort = SerialPort.SerialPort;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js"), // use a preload script
        }
    });


    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.setFullScreen(true);
    // mainWindow.setMenuBarVisibility(false);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }


}

const getPorts = function () {
    // Promise approach
    serialPort.list().then((ports) => {
        ports.forEach(function (port) {
            console.log(port.path);
            console.log(port.pnpId);
            console.log(port.manufacturer);
        });
    });
};


ipcMain.on('getSerialPorts', (event, title) => {
    getPorts();
})
// ipcMain.on("toMain", (event, arg) => {
//     console.log(event, arg);
//     getPorts();
// });

// ipcMain.handle('serialPort', async () => {
//     const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
//     return result
// })

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});



