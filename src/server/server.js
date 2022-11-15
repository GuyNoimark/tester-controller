const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");


// SerialPort.list().then((value) => console.log(value));

const serialPort = new SerialPort({
    path: "COM3",
    baudRate: 115200
});



const port = process.env.PORT || 4001;
const index = require("./index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
    }
}); // < Interesting!

let interval;

io.on("connection", (socket) => {
    console.log("Connected to dashboard");

    const parser = serialPort.pipe(new ReadlineParser())
    parser.on('data', console.log)
    parser.on('data', (stream) => socket.emit("FromAPI", stream))


    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});


server.listen(port, () => console.log(`Listening on port ${port}`));

// io.on("connection", (socket) => {
//     console.log("New client connected");
//     if (interval) {
//         clearInterval(interval);
//     }
//     interval = setInterval(() => getApiAndEmit(socket), 1000);
//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//         clearInterval(interval);
//     });
// });

// const getApiAndEmit = socket => {
//     const response = new Date();
//     // Emitting a new message. Will be consumed by the client
//     socket.emit("FromAPI", response);
// };

// server.listen(port, () => console.log(`Listening on port ${port}`));