import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
const isDev = require("electron-is-dev");
const SerialPort = require("serialport");
const serialPort = SerialPort.SerialPort;

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        width: 800,
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

interface SerialPort {
    path: String,
    pnpID: String,
    manufacturer: String
}
// 
const getPorts = function (): SerialPort[] {
    // Promise approach
    serialPort.list().then((ports: SerialPort[]) => {
        ports.forEach(function (port: any) {
            console.log(port.path, port.pnpId, port.manufacturer);
// 
        });
        return ports;
    });
    return [];
};
// 
// 
ipcMain.on('getSerialPorts', (event, title) => {
    const ports: SerialPort[] = [...getPorts()];
    console.log(ports);
})
// 
// 
// 
// 
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();
// 
    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
// 
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
// 
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.