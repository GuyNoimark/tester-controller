"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var isDev = require("electron-is-dev");
var SerialPort = require("serialport");
var serialPort = SerialPort.SerialPort;
function createWindow() {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        width: 800
    });
    mainWindow.loadURL(isDev
        ? "http://localhost:3000"
        : "file://".concat(path.join(__dirname, "../build/index.html")));
    mainWindow.setFullScreen(true);
    // mainWindow.setMenuBarVisibility(false);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}
var ARDUINO_PNP_ID = "USB\\VID_2341&PID_0058\\5A885C835151363448202020FF182F0F";
var LARIT_PNP_ID = "USB\\VID_2341&PID_5740\\5A885C835151363448202020FF182F0F";
// const getPorts = (): SerialPort[] => serialPort.list().then(() => {
//     // Promise approach
//     return serialPort.list().then((ports: SerialPort[]) => {
//         ports.forEach(function (port: SerialPort) {
//             console.log(port.path, port.pnpId, port.manufacturer);
//         });
//         return ports
//     });
// });
// const getPorts = async ():Promise<SerialPort[]> =>   { 
// }
// Detect Arduino and LARIT corresponding ports
electron_1.ipcMain.on('getSerialPorts', function () { return __awaiter(void 0, void 0, void 0, function () {
    var arduinoPath, arduino;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                serialPort.list().then(function (ports) { return console.log(ports); });
                return [4 /*yield*/, serialPort.list().then(function (ports) { var _a; return (_a = ports.find(function (port) { return port.pnpId === ARDUINO_PNP_ID; })) === null || _a === void 0 ? void 0 : _a.path; })];
            case 1:
                arduinoPath = _a.sent();
                arduino = new serialPort({
                    path: arduinoPath,
                    baudRate: 115200
                });
                console.log('Connected to arduino at port', arduinoPath);
                electron_1.ipcMain.on('arduinoWrite', function (event, message) {
                    // arduino.write('Send Data from GUI - ' + message);
                    console.log('Send Data from GUI - ' + message.split(','));
                    arduino.write(message.split(',')[0]);
                    arduino.write(message.split(',')[1]);
                    arduino.write(message.split(',')[2]);
                    arduino.write('<179> \\n');
                });
                electron_1.ipcMain.on('arduinoRead', function (event, message) {
                    arduino.on('readable', function () {
                        console.log('Data:', arduino.read());
                    });
                });
                return [2 /*return*/];
        }
    });
}); });
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(function () {
    createWindow();
    // 
    electron_1.app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// 
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// 
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.