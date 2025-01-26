import { Server } from "socket.io";
import { IO } from "./types";

export function setupSocket(): IO {
    const io = new Server({
        cors: {
            origin: "*" // TODO: CSRF
        }
    });

    io.on("connection", (socket) => {
        socket.on("ping", (message) => {
            console.log(message);
            socket.emit("pong", "Pong!");
        });
    });

    return io;
}