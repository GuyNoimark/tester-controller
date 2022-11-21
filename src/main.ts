import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { start } from "repl";
import { ReadlineParser } from "serialport";
import { ConnectionStatus } from "./Models/ConnectionState";
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
            ? "http://127.0.0.1:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );
    mainWindow.setFullScreen(true);
    // mainWindow.setMenuBarVisibility(false);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    let startTest: boolean = false;
    let iterationsPreformed = 0;
    let realForceCounter: number = 0;


    // Detect Arduino and LARIT corresponding ports
    ipcMain.handle('getSerialPorts', async () => {
        // serialPort.list().then((ports: SerialPort[]) => console.log(ports));

        const arduinoPath = await serialPort.list().then((ports: SerialPort[]) => ports.find((port) => port.pnpId === ARDUINO_PNP_ID)?.path);
        const LARITPath = await serialPort.list().then((ports: SerialPort[]) => ports.find((port) => port.pnpId === LARIT_PNP_ID)?.path);

        if (arduinoPath !== undefined && LARITPath !== undefined) {

        const arduino = new serialPort({
            path: arduinoPath ,
            baudRate: 115200
        });

        const LARIT = new serialPort({
            path: LARITPath !== undefined ? LARITPath : console.log('LARIT is path is undefined'),
            baudRate: 9600
        });

        console.log('Connected to arduino at port', arduinoPath);
        console.log('Connected to LARIT at port', LARITPath);

        arduino.on('readable', function () {
            console.log('Arduino Answer:', arduino.read().toString('utf8'));
        });

        ipcMain.on('arduinoWrite', (event, message: String) => { 

            // arduino.write('Send Data from GUI - ' + message);
            const settings: String[] = message.split(',');
            // const Iter: Float32Array = toBytes(settings[0]);
            // const force: Float32Array = toBytes(settings[0]);
            // const push: Float32Array = toBytes(settings[0]);

            arduino.write(`<${settings[0]}> \n`);
            arduino.write(`<${settings[1]}> \n`);
            arduino.write(`<${settings[2] ? 1 : 2}> \n`);
            arduino.write(`<${(537.7 / 3) * 10}>`);
            
            // console.log('Send Data from GUI - ' + `<${settings[0]}> \n`);
            console.log('Send Data from GUI - ' + settings);
            
            startTest = true;
            // setInterval( () => {
            // },1000)
        });



        ipcMain.on('arduinoRead', (event, message: String) => { 

                // arduino.on('readable', function () {
                //     console.log('Data:', arduino.read());
                //   })
              
        });


        setInterval(() => {

            LARIT.write('?', function(err: any) {
                if (err) {
                  return console.log('LARIT - Error on write: ', err.message);
                }
                // console.log('Sent request to LARIT');
    
                
            });
        }, 20);

            
        LARIT.on('data', function (data: Buffer ) {
            const formattedData: string = data.toString('utf8').slice(0,-3);
            let sensorValue: number = parseFloat(formattedData);
            // console.log('Data:', sensorValue);

            // sensorValue !== 0 ? realForceCounter += 1 : realForceCounter == 0 ;


            
            
            
            if (startTest) {

                
                if(sensorValue !== 0) {
                    realForceCounter += 1;
                
                    if (realForceCounter < 2) sensorValue = 0.0;
                    
                    
                } else {
                    realForceCounter = 0;
                };
                
                arduino.write(sensorValue.toString(), function(err: any) {
                    if (err) {
                      return console.log('Arduino - Error on write: ', err.message);
                    }
                    // console.log('Sent:', sensorValue)
                });
                // arduino.on('data', function (data: Buffer ) {
                //   console.log('Arduino message: ' , data);
                // })                
            };
            
            mainWindow.webContents.send('getSensorValue',sensorValue);

        });

                

                // ipcMain.on('LARITRead', (event, message: String) => { 
        //         LARIT.write('?');
        //         LARIT.on('readable', function () {
        //             const data = LARIT.read();
        //           })
              
        // });



        // const LARIT = new SerialPort({
        //     path: serialPort.list().then((port: SerialPortType) => port.pnpId === LARIT_PNP_ID ? port : undefined),
        //     baudRate: 115200
        // });
        return ConnectionStatus.BOTH_DEVICES_ARE_CONNECTED;
        
        } else {
            if (arduinoPath === undefined && LARITPath === undefined) return ConnectionStatus.ARDUINO_AND_LARIT_ARE_NOT_CONNECTED;
            if (arduinoPath === undefined) return ConnectionStatus.ARDUINO_IS_NOT_CONNECTED;
            if (LARITPath === undefined) return ConnectionStatus.LARIT_IS_NOT_CONNECTED;
        }
    });
}

const ARDUINO_PNP_ID = "USB\\VID_2341&PID_0058\\5A885C835151363448202020FF182F0F";
const LARIT_PNP_ID = "USB\\VID_0483&PID_5740\\207E36733530";

interface SerialPort {
    path: String,
    pnpId: String,
    manufacturer: String
};

const toBytes = (string: String) => {
	const buffer = Buffer.from(string, 'utf8');
	const result = Array(buffer.length);
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