import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { ReadlineParser, SerialPort } from "serialport";

import { ConnectionStatus } from "./Models/ConnectionState";
import { SessionSettingsModel, SummaryPanelData } from "./Models/types";

const isDev = require("electron-is-dev");

enum Devices {
  arduino = "arduino",
  LARIT = "LARIT",
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
    icon: "./assets/logos/ItamarFavicon-2.png",
  });
  mainWindow.loadURL(
    isDev
      ? "http://127.0.0.1:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.setIcon(path.join(__dirname, "/assets/logos/ItamarFavicon-2.png"));
  mainWindow.setFullScreen(true);
  mainWindow.setMenuBarVisibility(false);
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  let startTest: boolean = false;
  let iterationsPreformed: number = 0;
  const samples: number[] = [];
  let settings: SessionSettingsModel;
  let startTestTime: number;

  const raiseErrorOnRenderer = (err: any, device?: Devices) => {
    console.log("Error: ", device ?? "", " - ", err);
    mainWindow.webContents.send("error", err);
  };

  const sendSensorValueToArduino = (
    sensorValue: number,
    arduino: SerialPort
  ) => {
    if (sensorValue !== 0) {
      realForceCounter += 1;
      if (realForceCounter < 2) sensorValue = 0.0;
    } else if (sensorValue === 0) {
      sensorValue = 0.0;
    } else {
      realForceCounter = 0;
    }

    arduino.write(`<${sensorValue}>`, function (err: any) {
      if (err) raiseErrorOnRenderer("0003: " + err.message, Devices.arduino);
    });
  };

  const sendSummary = (): SummaryPanelData => {
    const endOfTestTime = new Date().getTime();
    const timeElapsedInSeconds = (endOfTestTime - startTestTime) / 1000;

    return {
      lineChartData: samples.splice(0, samples.length),
      time: timeElapsedInSeconds,
      sessionSettings: settings,
    };
  };

  // Check connection
  checkConnectionStatus().then(async (res) => {
    //Send connection status to the renderer;
    ipcMain.handle("getSerialPorts", checkConnectionStatus);

    ipcMain.on("close-window", () => {
      console.log("Close");
      mainWindow.close();
    });

    const arduino = await getSerialPortDevice(Devices.arduino);
    const LARIT = await getSerialPortDevice(Devices.LARIT);

    // Reads arduino serialPort in "flowing mode"

    const arduinoParser = arduino.pipe(
      new ReadlineParser({ delimiter: "\r\n" })
    );
    arduinoParser.on("data", (chunk) => {
      console.log("arduino", chunk);
    });

    // arduino.on("data", function (data: Buffer) {
    //   console.log("Data:", data.toString("utf-8"));
    //   if (data.toString("utf-8").includes("i")) {
    //     iterationsPreformed += 1;
    //     mainWindow.webContents.send("setProgress", iterationsPreformed);
    //     console.log(iterationsPreformed);
    //   }
    //   // if (data.toString("utf-8"))
    // });

    //Start the test
    ipcMain.on("arduinoWrite", async (event, data: SessionSettingsModel) => {
      const checkConnection = await checkConnectionStatus();
      if (checkConnection === ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED) {
        samples.splice(0, samples.length);
        // if (!arduino.isOpen) arduino.open();
        if (!arduino.isOpen) arduino.open();
        // LARIT.open();
        startArduinoTest(arduino, data);
        settings = data;
        // console.log("Starts Test in 2 seconds");

        // Waits for 500 milliseconds
        const interval = setInterval(function () {
          clearInterval(interval);
          startTest = true;
          startTestTime = new Date().getTime();
        }, 500);
      } else {
        raiseErrorOnRenderer("0004: " + checkConnection);
      }
    });

    // !Asks for a sensor sample
    setInterval(() => {
      LARIT.write("?", function (err: any) {
        if (err) raiseErrorOnRenderer("0001: " + err.message, Devices.LARIT);
      });
    }, 5);

    ipcMain.on("stopTest", () => {
      startTest = false;
      iterationsPreformed = 0;
      arduino.flush();
      setTimeout(() => {
        // for (let index = 0; index < 10; index++) {
        arduino.write("SSSSSSSSSS", function (err: any) {
          console.log("stop");
          if (err)
            raiseErrorOnRenderer("0002: " + err.message, Devices.arduino);
        });
        // }
        if (arduino.isOpen) arduino.close();
        if (LARIT.isOpen) LARIT.close();
      }, 100);
    });

    //! Saves the return sample
    const laritParser = LARIT.pipe(new ReadlineParser({ delimiter: "N" }));
    laritParser.on("data", (chunk) => {
      const formattedData = chunk;
      let sensorValue = parseFloat(formattedData);
      samples.push(Math.abs(sensorValue));

      // console.log("Data:", sensorValue);
      // console.log("Data:", startTest);

      if (startTest) {
        // console.log("lar", chunk);
        // arduino.write(`<${chunk}>`);
        sendSensorValueToArduino(chunk, arduino);
        mainWindow.webContents.send("getSensorValue", sensorValue);
      }
    });

    ipcMain.handle("getSummary", sendSummary);

    ipcMain.handle("check-LARIT-on", async (): Promise<boolean> => {
      try {
        const result = await apiFunctionWrapper();
        console.log(result);
        return true;
      } catch (error) {
        console.error("Error opening port: " + error);
        raiseErrorOnRenderer(
          "LARIT is turned off or disconnected. Turn the device on and restart the program" +
            " --- " +
            "0005: " +
            error,
          Devices.LARIT
        );
        return false;
      }
    });

    function apiFunction(successCallback: Function, errorCallback: Function) {
      LARIT.open(function (err: any) {
        if (err) {
          errorCallback(err, err.message);
        } else {
          successCallback("success");
        }
      });
    }

    function apiFunctionWrapper() {
      return new Promise((resolve, reject) => {
        apiFunction(
          (successResponse: string) => {
            resolve(successResponse);
          },
          (errorResponse: string) => {
            reject(errorResponse);
          }
        );
      });
    }
  });
}

interface SerialPortData {
  path: string;
  pnpId: string;
  manufacturer: string;
}

const searchDevicePath = async (
  device: Devices
): Promise<SerialPortData["path"] | undefined> => {
  const ARDUINO_PNP_ID =
    "USB\\VID_2341&PID_0058\\5A885C835151363448202020FF182F0F";
  const LARIT_PNP_ID = "USB\\VID_0483&PID_5740\\207E36733530";

  const portsAvailable = await SerialPort.list();
  if (device === Devices.arduino)
    return portsAvailable.find((port) => port.pnpId === ARDUINO_PNP_ID)?.path;
  if (device === Devices.LARIT)
    return portsAvailable.find((port) => port.pnpId === LARIT_PNP_ID)?.path;
};

const checkConnectionStatus = async (): Promise<ConnectionStatus> => {
  const arduinoPath = await searchDevicePath(Devices.arduino);
  const LARITPath = await searchDevicePath(Devices.LARIT);

  if (arduinoPath === undefined && LARITPath === undefined)
    return ConnectionStatus.ARDUINO_AND_LARIT_ARE_NOT_CONNECTED;
  if (arduinoPath === undefined)
    return ConnectionStatus.ARDUINO_IS_NOT_CONNECTED;
  if (LARITPath === undefined) return ConnectionStatus.LARIT_IS_NOT_CONNECTED;
  else return ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED;
};

const getSerialPortDevice = async (device: Devices): Promise<SerialPort> => {
  const _path = await searchDevicePath(device);
  console.log(`Connected to ${device} at port`, _path);
  return new SerialPort({
    path: _path ?? "",
    baudRate: device === Devices.arduino ? 115200 : 9600,
    autoOpen: false,
    hupcl: false,
  });
};

// const checkConnection = (mainWindow: BrowserWindow): boolean => {
//   checkConnectionStatus()
//     .then((response) => {
//       return response === ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED
//         ? true
//         : false;
//     })
//     .catch((error) => {
//       mainWindow.webContents.send("error", error);
//       return false;
//     });
// };

const startArduinoTest = (arduino: SerialPort, data: SessionSettingsModel) => {
  arduino.write(`<${data.iterations}>`);
  arduino.write(`<${data.force}>`);
  arduino.write(`<${data.push ? 1 : 2}>`);
  arduino.write(`<${((537.7 / 3) * data.stroke).toFixed(2)}>`);

  // console.log(
  //   `<${data.iterations}>`,
  //   `<${data.force}>`,
  //   `<${data.push ? 1 : 2}>`,
  //   `<${(537.7 / 3) * data.stroke}>`
  // );
  console.log("Send Data from GUI - ", data);
};

let realForceCounter: number = 0;

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
