import './App.css'
import React, {useEffect, useRef, useState} from "react";
import type {IncomingMessage, Pixel} from "./types";

const App = () => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const [color, setColor] = useState('#ff0000');
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/canvas');

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data) as IncomingMessage;

            if (message.type === 'INIT_PIXELS' || message.type === 'NEW_PIXELS') {
                drawPixels(message.payload);
            }
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const drawPixels = (pixels: Pixel[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        pixels.forEach(({x, y, color}) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const sendPixel = (pixel: Pixel) => {
        ws.current?.send(JSON.stringify({
            type: 'DRAW_PIXELS',
            payload: [pixel]
        }));
    };

    const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pixel: Pixel = {x, y, color};
        drawPixels([pixel]);
        sendPixel(pixel);
    };

    return (
        <div style={{padding: '20px'}}>
            <h2>Draw Something</h2>

            <label>
                Pick color:
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{marginLeft: '10px'}}
                />
            </label>

            <div style={{marginTop: '15px'}}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    style={{
                        border: '1px solid black',
                        cursor: 'crosshair',
                        backgroundColor: '#fff'
                    }}
                    onMouseDown={() => setIsDrawing(true)}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onMouseMove={handleDraw}
                />
            </div>
        </div>
    )
};

export default App
