import { BrowserWindow, ipcMain } from "electron";
import { SerialPort } from "serialport";
import { SessionSettingsModel, SummaryPanelData } from "../Models/types";

const SampleRate = 0.5;

let startTest: boolean = false;
let iterationsPreformed: number = 0;
let lastTime = 0;
let realForceCounter = 0;
const samples: number[] = [];
let settings: SessionSettingsModel;
let startTestTime: number;
export interface DevicesPaths {
  arduinoPath: string | undefined;
  LARITPath: string | undefined;
}

const getPaths = async (): Promise<DevicesPaths> => {
  const ARDUINO_PNP_ID =
    "USB\\VID_2341&PID_0058\\5A885C835151363448202020FF182F0F";
  const LARIT_PNP_ID = "USB\\VID_0483&PID_5740\\207E36733530";

  const portsAvailable = await SerialPort.list();
  return {
    arduinoPath: portsAvailable.find((port) => port.pnpId === ARDUINO_PNP_ID)
      ?.path,
    LARITPath: portsAvailable.find((port) => port.pnpId === LARIT_PNP_ID)?.path,
  };
};

const connectToArduino = (arduino: SerialPort): void =>
  arduino.open((err) => {
    if (err) console.log("Error opening arduino port: ", err.message);
  });

const connectToLARIT = (LARIT: SerialPort): void =>
  LARIT.open((err) => {
    if (err) console.log("Error opening arduino port: ", err.message);
  });

const closeArduino = (arduino: SerialPort): void =>
  arduino.close((err) => {
    if (err) console.log("Error closing arduino port: ", err.message);
  });

const closeLARIT = (LARIT: SerialPort): void =>
  LARIT.close((err) => {
    if (err) console.log("Error closing LARIT port: ", err.message);
  });

const listenForStartTest = (arduino: SerialPort): void => {
  ipcMain.on("arduinoWrite", async (event, data: SessionSettingsModel) => {
    arduinoWriteTestSettings(arduino, data);

    startTest = true;
    startTestTime = new Date().getTime();
    // Waits for 500 milliseconds
    // const interval = setInterval(function () {
    //   clearInterval(interval);
    // }, 500);
  });
};

const arduinoWriteTestSettings = (
  arduino: SerialPort,
  data: SessionSettingsModel
) => {
  arduino.write(`<${data.iterations}> \n`);
  arduino.write(`<${data.force}> \n`);
  arduino.write(`<${data.push ? 1 : 2}> \n`);
  arduino.write(`<${(537.7 / 3) * data.stroke}>`);
  console.log("Send Data from GUI - ", data);
};

const asksSensorForSample = (LARIT: SerialPort) => {
  setInterval(() => {
    LARIT.write("?", function (err: any) {
      if (err) return console.log("Error on sample request: ", err.message);
    });
  }, SampleRate);
};

const listenForSensorSampleAndSend = (
  LARIT: SerialPort,
  arduino: SerialPort,
  mainWindow: BrowserWindow
) => {
  LARIT.on("data", function (data: Buffer) {
    const formattedData: string = data.toString("utf8").slice(0, -3);
    let sensorValue = parseFloat(formattedData);
    samples.push(sensorValue * -1);
    // console.log("Data:", sensorValue);
    // console.log("Data:", startTest);

    if (startTest) {
      sendSensorValueToArduino(sensorValue, arduino);

      // Sends 1 sample ever 50 millis
      if (samples.length % 100 === 0) {
        mainWindow.webContents.send("getSensorValue", sensorValue);
      }
    }
  });
};

const sendSensorValueToArduino = (sensorValue: number, arduino: SerialPort) => {
  if (sensorValue !== 0) {
    realForceCounter += 1;
    if (realForceCounter < 2) sensorValue = 0.0;
  } else if (sensorValue === 0) {
    sensorValue = 0.0;
  } else {
    realForceCounter = 0;
  }
  arduino.write(sensorValue.toString(), function (err: any) {
    if (err)
      return console.log("Error on sample write to arduino: ", err.message);
  });
};

const listenForStopTest = (arduino: SerialPort, LARIT: SerialPort) => {
  ipcMain.on("stopTest", () => {
    closeArduino(arduino);
    closeLARIT(LARIT);
    iterationsPreformed = 0;
  });
};

const listenForSendSummary = () => {
  const sendSummary = (): SummaryPanelData => {
    const endOfTestTime = new Date().getTime();
    const timeElapsedInSeconds = (endOfTestTime - startTestTime) / 1000;
    return {
      lineChartData: samples,
      time: timeElapsedInSeconds,
      sessionSettings: settings,
    };
  };

  ipcMain.handle("getSummary", sendSummary);
};

export const handleSerialCommunication = async (
  mainWindow: BrowserWindow
): Promise<void> => {
  try {
    const paths = await getPaths();

    const arduino = new SerialPort({
      path: paths.arduinoPath ?? "",
      baudRate: 115200,
      autoOpen: false,
    });

    const LARIT = new SerialPort({
      path: paths.LARITPath ?? "",
      baudRate: 9600,
      autoOpen: false,
    });

    connectToArduino(arduino);
    connectToLARIT(LARIT);

    console.log("Connected:", arduino, LARIT);

    listenForStartTest(arduino);

    asksSensorForSample(LARIT);
    listenForSensorSampleAndSend(LARIT, arduino, mainWindow);

    listenForStopTest(arduino, LARIT);

    listenForSendSummary();

    // Get ports
    // Connect to arduino
    // connect to LARIT
    // listenForRequestsFromRenderer(client);
    // listenForReconnection(client);
  } catch (error) {
    console.log(error);
  }
};
