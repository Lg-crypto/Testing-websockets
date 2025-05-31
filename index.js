require("dotenv").config();
const Websocket = require('ws');
const Wss = new Websocket.Server({port: process.env .PORT});
let last_id = 0;


const messages = [];

const onMessage = (ws, message) => {
    // log the message to the console
    messages.push({message: message.toString(), id: ws.id});
    console.log(message.toString());

    // send the message to all connected clients
    Wss.clients.forEach((client) => {
        if (client.readyState === Websocket.OPEN) {
            client.send(JSON.stringify(messages));
        }
    });

    // remove the oldest message if there are more than 10 messages
    if (messages.length > 10) {
        messages.shift();
    }
}


Wss.on('connection', (ws) => {
    // log the connection to the console
    last_id++;
    ws.id = last_id;
    ws.send(JSON.stringify({messages, id: ws.id}));
    console.log('New client connected!');
    ws.on('message', (message) => onMessage(ws, message));
    ws.on('close', () => {
        console.log('Client disconnected!');
    });
});
Wss.broadcast = (message) => {
    Wss.clients.forEach((client) => {
        if (client.readyState === Websocket.OPEN) {
            client.send(message);
        }
    });
};

console.log(`WebSocket server is running on ws://localhost:${process.env.PORT}`);