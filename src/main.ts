import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { ConnectionStatus } from "./Models/ConnectionState";
const isDev = require("electron-is-dev");
import { SerialPort } from "serialport";
import { SessionSettingsModel, SummaryPanelData } from "./Models/types";

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
      ? "http://127.0.0.1:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.setFullScreen(true);
  mainWindow.setMenuBarVisibility(false);
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  let startTest: boolean = false;
  let iterationsPreformed: number = 0;
  let lastTime = 0;
  const samples: number[] = [];
  let settings: SessionSettingsModel;
  let startTestTime: number;

  const raiseErrorOnRenderer = (err: any, device?: Devices) => {
    console.log(
      "Error: ",
      device !== undefined ? device : "",
      " - ",
      err.message
    );
    mainWindow.webContents.send("error", err.message);
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
    arduino.write(sensorValue.toString(), function (err: any) {
      if (err) raiseErrorOnRenderer(err.message, Devices.arduino);
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

    const arduino = await getSerialPortDevice(Devices.arduino);
    const LARIT = await getSerialPortDevice(Devices.LARIT);

    // Reads arduino serialPort in "flowing mode"
    arduino.on("data", function (data: Buffer) {
      console.log("Data:", data.toString("utf-8"));
      if (data.toString("utf-8").includes("i")) {
        iterationsPreformed += 1;
        mainWindow.webContents.send("setProgress", iterationsPreformed);
        console.log(iterationsPreformed);
      }
      // if (data.toString("utf-8"))
    });

    //Start the test
    ipcMain.on("arduinoWrite", async (event, data: SessionSettingsModel) => {
      const checkConnection = await checkConnectionStatus();
      if (checkConnection === ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED) {
        arduino.open();
        LARIT.open();
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
        raiseErrorOnRenderer(checkConnection);
      }
    });

    // Asks for a sensor sample
    setInterval(() => {
      LARIT.write("?", function (err: any) {
        if (err) raiseErrorOnRenderer(err.message, Devices.LARIT);
      });
    }, 0.5);

    ipcMain.on("stopTest", () => {
      startTest = false;
      iterationsPreformed = 0;
      arduino.close();
      LARIT.close();
    });

    // Saves the return sample
    LARIT.on("data", function (data: Buffer) {
      const formattedData: string = data.toString("utf8").slice(0, -3);
      let sensorValue = parseFloat(formattedData);
      samples.push(sensorValue * -1);
      // console.log("Data:", sensorValue);
      // console.log("Data:", startTest);

      mainWindow.webContents.send("getSensorValue", sensorValue);
      if (startTest) {
        sendSensorValueToArduino(sensorValue, arduino);
        // if (samples.length % 100 === 0) {
        //Sends 1 sample ever 50 millis
        // }
      }
    });

    ipcMain.handle("getSummary", sendSummary);
  });
}

interface SerialPortData {
  path: string;
  pnpId: string;
  manufacturer: string;
}
interface DevicesPaths {
  arduinoPath: string | undefined;
  LARITPath: string | undefined;
}
enum Devices {
  arduino = "arduino",
  LARIT = "LARIT",
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
    path: _path !== undefined ? _path : "",
    baudRate: device === Devices.arduino ? 115200 : 9600,
    autoOpen: false,
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
  // arduino.write('Send Data from GUI - ' + message);

  arduino.write(`<${data.iterations}> \n`);
  arduino.write(`<${data.force}> \n`);
  arduino.write(`<${data.push ? 1 : 2}> \n`);
  arduino.write(`<${(537.7 / 3) * data.stroke}>`, function (err: any) {
    if (err) console.log(err);
  });

  console.log("Send Data from GUI - ", data);
};

let realForceCounter: number = 0;

const toBytes = (string: String) => {
  const buffer = Buffer.from(string, "utf8");
  const result = Array(buffer.length);
  for (var i = 0; i < buffer.length; i++) {
    result[i] = buffer[i];
  }
  return result;
};

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
