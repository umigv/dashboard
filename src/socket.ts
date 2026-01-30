import { Server } from "socket.io";
import { IO } from "./types";
import * as rclnodejs from "rclnodejs";
import { handleCameraSettingsUpdate } from "./camera";
import {  handleGpsUpdates } from "./gps";

interface imu{
    roll: number;
    pitch: number;
    yaw: number;
}

interface gps{
    latitude: number;
    longitude: number;
    altitude: number;
}

interface odom {
  velocity: number;
}

interface occupancyGrid{
    resolution: number;
    width: number;
    height:number;
    data: Int8Array;
}

interface data{
    imu:imu;
    gps:gps;
    odom: odom;
    occupancyGrid: occupancyGrid;
}



export function setupSocket(node: rclnodejs.Node): IO {

    console.log("socket setup");

    interface ServerToClientEvents {
        gps_update: (data:data) => void;
        pong: (message: string)=>void;
    }



    const io = new Server({
        cors: {
            origin: "*" // TODO: CSRF
        }
    });


    io.on("connection", (socket) => {

        console.log("socket connected");
        handleCameraSettingsUpdate(socket, node);
    });


    return io;
}

