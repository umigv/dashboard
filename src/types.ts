import { Server as SocketServer } from "socket.io";

interface GPSData {
    latitude: number;
    longitude: number;
    altitude: number;
}

interface IMUData {
    roll: number;
    pitch: number;
    yaw: number;
}

export interface ServerToClientEvents {
    pong: (message: string) => void;
    message: (data: string) => void;
    sensorData: (data: {
        gps?: GPSData,
        imu?: IMUData,
    }) => void;
}

export interface ClientToServerEvents {
    ping: (message: string) => void;
    cameraSettings(data: {
        brightness: number;
        contrast: number;
    }): void;
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