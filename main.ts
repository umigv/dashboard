import express, { Request, Response } from "express";
import { Server } from "socket.io";
const app = express();

interface ServerToClientEvents {
    pong: (message: string) => void;
}

interface ClientToServerEvents {
    ping: (message: string) => void;
}

interface InterServerEvents { }

interface SocketData {
    name: string;
    age: number;
}

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>({
    cors: {
        origin: "*" // TODO: CSRF
    }
});

io.listen(3001);
io.on("connection", (socket) => {
    socket.on("ping", (message) => {
        console.log(message);
        socket.emit("pong", "Pong!");
    });
});

app.get("/", (req: Request, res: Response) => {
    res.end(
        `<!DOCTYPE html>
        <html>
        <body>
            <h1>Socket.io Ping/Pong</h1>
            <script type="module">
                import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

                const socket = io("http://localhost:3001");

                socket.emit("ping", "Ping!");
                socket.on("pong", (message) => {
                    console.log(message);
                });
            </script>
        </body>`
    )
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})