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

interface data{
    imu:imu;
    gps:gps;
    odom: odom;
}



export function setupSocket(node: rclnodejs.Node): IO {

    console.log("socket setup");

    interface ServerToClientEvents {
        gps_update: (data:data) => void;
        pong: (message: string)=>void;
    }

    // interface NamespaceSpecificClientToServerEvents {
    //     ping:() =>void;
    // }


    const io = new Server({
        cors: {
            origin: "*" // TODO: CSRF
        }
    });

    //const io = new Server<ServerToClientEvents> ();

    io.on("connection", (socket) => {
        // socket.on("ping", (message) => {
        //     console.log(message);
        //     socket.emit("pong", "Pong!");
        // });
        console.log("socket connected");
        handleCameraSettingsUpdate(socket, node);
        //handleGpsUpdates(socket, node);
    });


    return io;
}

