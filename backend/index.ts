import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import WebSocket from "ws";

const app = express();
const wsInstance = expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
wsInstance.applyTo(router);

const connectedClient: WebSocket[] = [];

interface IncomingMessage {
    type: string;
    payload: any;
}

interface Pixel {
    x: number;
    y: number;
    color: string;
}

const savedPixels: Pixel[] = [];

router.ws('/canvas', (ws, req) => {
    console.log('Client connected');
    connectedClient.push(ws);
    console.log('Total clients: ' + connectedClient.length);

    ws.send(JSON.stringify({
        type: 'INIT_PIXELS',
        payload: savedPixels
    }));

    ws.on('message', (message) => {
        try {
            const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

            if (decodedMessage.type === 'DRAW_PIXELS') {
                const newPixels = decodedMessage.payload as Pixel[];

                savedPixels.push(...newPixels);

                connectedClient.forEach(clientWS => {
                    if (clientWS.readyState === WebSocket.OPEN) {
                        clientWS.send(JSON.stringify({
                            type: 'NEW_PIXELS',
                            payload: newPixels
                        }));
                    }
                });
            }

        } catch (e) {
            ws.send(JSON.stringify({error: 'Invalid message'}));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = connectedClient.indexOf(ws);
        connectedClient.splice(index, 1);
        console.log('Total connections: ' + connectedClient.length);
    });
});


app.use(router);
app.listen(port, () => console.log(`Listening on port ${port}`));