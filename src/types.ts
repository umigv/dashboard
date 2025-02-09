import { Server as SocketServer } from "socket.io";

export interface ServerToClientEvents {
    pong: (message: string) => void;
    message: (data: string) => void;
    camera: (imageString: string) => void;
}

export interface ClientToServerEvents {
    ping: (message: string) => void;
}

export interface InterServerEvents { }

export interface SocketData {
    name: string;
    age: number;
}

export type IO = SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;