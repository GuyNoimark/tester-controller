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
var ConnectionState_1 = require("./Models/ConnectionState");
var isDev = require("electron-is-dev");
// const SerialPort = require("serialport");
// const serialPort = SerialPort.SerialPort;
var serialport_1 = require("serialport");
function createWindow() {
    var _this = this;
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        width: 800
    });
    mainWindow.loadURL(isDev
        ? "http://127.0.0.1:3000"
        : "file://".concat(path.join(__dirname, "../build/index.html")));
    mainWindow.setFullScreen(true);
    // mainWindow.setMenuBarVisibility(false);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    var startTest = false;
    var iterationsPreformed = 0;
    var realForceCounter = 0;
    var lastTime = 0;
    // Check connection
    checkConnectionStatus().then(function (res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c, arduino_1, LARIT_1;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    //Send connection status to the renderer;
                    _b = (_a = electron_1.ipcMain).handle;
                    _c = ["getSerialPorts"];
                    return [4 /*yield*/, checkConnectionStatus];
                case 1:
                    //Send connection status to the renderer;
                    _b.apply(_a, _c.concat([_d.sent()]));
                    if (!(res === ConnectionState_1.ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED)) return [3 /*break*/, 4];
                    return [4 /*yield*/, getSerialPortDevice(Devices.arduino)];
                case 2:
                    arduino_1 = _d.sent();
                    return [4 /*yield*/, getSerialPortDevice(Devices.LARIT)];
                case 3:
                    LARIT_1 = _d.sent();
                    // Reads arduino serialPort in "flowing mode"
                    arduino_1.on("data", function (data) {
                        console.log("Data:", data.toString("utf-8"));
                        // if (data.toString("utf-8"))
                    });
                    //Start the test
                    electron_1.ipcMain.on("arduinoWrite", function (event, message) { return __awaiter(_this, void 0, void 0, function () {
                        var checkConnection, interval_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, checkConnectionStatus()];
                                case 1:
                                    checkConnection = _a.sent();
                                    if (checkConnection === ConnectionState_1.ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED) {
                                        startArduinoTest(arduino_1, message);
                                        console.log("Starts Test in 2 seconds");
                                        interval_1 = setInterval(function () {
                                            clearInterval(interval_1);
                                            startTest = true;
                                        }, 1000);
                                    }
                                    else {
                                        mainWindow.webContents.send("error", checkConnection);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Asks for a sensor sample
                    setInterval(function () {
                        LARIT_1.write("?", function (err) {
                            if (err)
                                return console.log("LARIT - Error on write: ", err.message);
                        });
                    }, 0.5);
                    // Saves the return sample
                    LARIT_1.on("data", function (data) {
                        var formattedData = data.toString("utf8").slice(0, -3);
                        var sensorValue = parseFloat(formattedData);
                        // console.log("Data:", sensorValue);
                        // console.log("Data:", startTest);
                        mainWindow.webContents.send("getSensorValue", sensorValue);
                        if (startTest) {
                            // console.log(sensorValue);
                            sendSensorValueToArduino(sensorValue, arduino_1);
                        }
                    });
                    return [3 /*break*/, 5];
                case 4:
                    mainWindow.webContents.send("error", res);
                    _d.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Detect Arduino and LARIT corresponding ports
    //   ipcMain.handle("getSerialPorts", async () => {
    //     // serialPort.list().then((ports: SerialPort[]) => console.log(ports));
    //     const arduinoPath = await serialPort
    //       .list()
    //       .then(
    //         (ports: SerialPort[]) =>
    //           ports.find((port) => port.pnpId === ARDUINO_PNP_ID)?.path
    //       );
    //     const LARITPath = await serialPort
    //       .list()
    //       .then(
    //         (ports: SerialPort[]) =>
    //           ports.find((port) => port.pnpId === LARIT_PNP_ID)?.path
    //       );
    //     if (arduinoPath !== undefined && LARITPath !== undefined) {
    //       const arduino = new serialPort({
    //         path: arduinoPath,
    //         baudRate: 115200,
    //       });
    //       const LARIT = new serialPort({
    //         path:
    //           LARITPath !== undefined
    //             ? LARITPath
    //             : console.log("LARIT is path is undefined"),
    //         baudRate: 9600,
    //       });
    //       console.log("Connected to arduino at port", arduinoPath);
    //       console.log("Connected to LARIT at port", LARITPath);
    //       arduino.on("readable", function () {
    //         console.log("Arduino Answer:", arduino.read().toString("utf8"));
    //       });
    //       ipcMain.on("arduinoRead", (event, message: String) => {
    //         // arduino.on('readable', function () {
    //         //     console.log('Data:', arduino.read());
    //         //   })
    //       });
    // setInterval(() => {
    //   LARIT.write("?", function (err: any) {
    //     if (err) {
    //       return console.log("LARIT - Error on write: ", err.message);
    //     }
    //     // console.log('Sent request to LARIT');
    //   });
    // }, 20);
    //       // ipcMain.on('LARITRead', (event, message: String) => {
    //       //         LARIT.write('?');
    //       //         LARIT.on('readable', function () {
    //       //             const data = LARIT.read();
    //       //           })
    //       // });
    //       // const LARIT = new SerialPort({
    //       //     path: serialPort.list().then((port: SerialPortType) => port.pnpId === LARIT_PNP_ID ? port : undefined),
    //       //     baudRate: 115200
    //       // });
    //       return ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED;
    //     } else {
    //       if (arduinoPath === undefined && LARITPath === undefined)
    //         return ConnectionStatus.ARDUINO_AND_LARIT_ARE_NOT_CONNECTED;
    //       if (arduinoPath === undefined)
    //         return ConnectionStatus.ARDUINO_IS_NOT_CONNECTED;
    //       if (LARITPath === undefined)
    //         return ConnectionStatus.LARIT_IS_NOT_CONNECTED;
    //     }
    //   });
}
var Devices;
(function (Devices) {
    Devices["arduino"] = "arduino";
    Devices["LARIT"] = "LARIT";
})(Devices || (Devices = {}));
var searchDevicePath = function (device) { return __awaiter(void 0, void 0, void 0, function () {
    var ARDUINO_PNP_ID, LARIT_PNP_ID, portsAvailable;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                ARDUINO_PNP_ID = "USB\\VID_2341&PID_0058\\5A885C835151363448202020FF182F0F";
                LARIT_PNP_ID = "USB\\VID_0483&PID_5740\\207E36733530";
                return [4 /*yield*/, serialport_1.SerialPort.list()];
            case 1:
                portsAvailable = _c.sent();
                if (device === Devices.arduino)
                    return [2 /*return*/, (_a = portsAvailable.find(function (port) { return port.pnpId === ARDUINO_PNP_ID; })) === null || _a === void 0 ? void 0 : _a.path];
                if (device === Devices.LARIT)
                    return [2 /*return*/, (_b = portsAvailable.find(function (port) { return port.pnpId === LARIT_PNP_ID; })) === null || _b === void 0 ? void 0 : _b.path];
                return [2 /*return*/];
        }
    });
}); };
var checkConnectionStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
    var arduinoPath, LARITPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, searchDevicePath(Devices.arduino)];
            case 1:
                arduinoPath = _a.sent();
                return [4 /*yield*/, searchDevicePath(Devices.LARIT)];
            case 2:
                LARITPath = _a.sent();
                if (arduinoPath === undefined && LARITPath === undefined)
                    return [2 /*return*/, ConnectionState_1.ConnectionStatus.ARDUINO_AND_LARIT_ARE_NOT_CONNECTED];
                if (arduinoPath === undefined)
                    return [2 /*return*/, ConnectionState_1.ConnectionStatus.ARDUINO_IS_NOT_CONNECTED];
                if (LARITPath === undefined)
                    return [2 /*return*/, ConnectionState_1.ConnectionStatus.LARIT_IS_NOT_CONNECTED];
                else
                    return [2 /*return*/, ConnectionState_1.ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED];
                return [2 /*return*/];
        }
    });
}); };
var getSerialPortDevice = function (device) { return __awaiter(void 0, void 0, void 0, function () {
    var _path;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, searchDevicePath(device)];
            case 1:
                _path = _a.sent();
                console.log("Connected to ".concat(device, " at port"), _path);
                return [2 /*return*/, new serialport_1.SerialPort({
                        path: _path !== undefined ? _path : "",
                        baudRate: device === Devices.arduino ? 115200 : 9600
                    })];
        }
    });
}); };
var startArduinoTest = function (arduino, testSetings) {
    // arduino.write('Send Data from GUI - ' + message);
    var settings = testSetings.split(",");
    arduino.write("<".concat(settings[0], "> \n"));
    arduino.write("<".concat(settings[1], "> \n"));
    arduino.write("<".concat(settings[2] ? 1 : 2, "> \n"));
    arduino.write("<".concat((537.7 / 3) * 5, ">"));
    console.log("Send Data from GUI - " + settings);
    // const interval = setInterval(function () {
    //   clearInterval(interval);
    //   console.log("Waiting");
    // }, 2000);
};
var sendSensorValueToArduino = function (sensorValue, arduino) {
    // if (sensorValue !== 0) {
    //   realForceCounter += 1;
    //   if (realForceCounter < 2) sensorValue = 0.0;
    // } else {
    //   realForceCounter = 0;
    // }
    arduino.write(sensorValue.toString(), function (err) {
        if (err)
            return console.log("Arduino - Error on write: ", err.message);
    });
};
// const getSensorData = (LARIT: SerialPort): number => {
//   LARIT.on("data", function (data: Buffer) {
//     const formattedData: string = data.toString("utf8").slice(0, -3);
//     return parseFloat(formattedData);
// console.log('Data:', sensorValue);
// sensorValue !== 0 ? realForceCounter += 1 : realForceCounter == 0 ;
// if (sensorValue !== 0) {
//   realForceCounter += 1;
//   if (realForceCounter < 2) sensorValue = 0.0;
// } else {
//   realForceCounter = 0;
// }
// arduino.write(sensorValue.toString(), function (err: any) {
//   if (err) {
//     return console.log("Arduino - Error on write: ", err.message);
//   }
//   // console.log('Sent:', sensorValue)
// });
// arduino.on('data', function (data: Buffer ) {
//   console.log('Arduino message: ' , data);
// })
// mainWindow.webContents.send("getSensorValue", sensorValue);
//   });
// };
var toBytes = function (string) {
    var buffer = Buffer.from(string, "utf8");
    var result = Array(buffer.length);
    for (var i = 0; i < buffer.length; i++) {
        result[i] = buffer[i];
    }
    return result;
};
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
