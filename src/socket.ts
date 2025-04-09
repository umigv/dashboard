import { Server } from "socket.io";
import { IO } from "./types";
import * as rclnodejs from "rclnodejs";
import { handleCameraSettingsUpdate } from "./camera";

export function setupSocket(node: rclnodejs.Node): IO {
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

        handleCameraSettingsUpdate(socket, node);
    });

    gpsUpdate(io, node);

    return io;
}

function gpsUpdate(io: IO, node: rclnodejs.Node) {
    node.createSubscription("sensor_msgs/msg/NavSatFix", "gps_coords", async (msg) => {
        const gpsData = (await msg) as rclnodejs.sensor_msgs.msg.NavSatFix;

        io.emit("sensorData", {
            gps: {
                latitude: gpsData.latitude,
                longitude: gpsData.longitude,
                altitude: gpsData.altitude,
            }
        });
    });
}