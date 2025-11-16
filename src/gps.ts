import { Server, Socket } from "socket.io";
import * as rclnodejs from "rclnodejs";
// import { Socket } from "socket.io";

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




export function setupUpdateGps(node: rclnodejs.Node, io: Server){



    node.createSubscription("sensor_msgs/msg/NavSatFix", "/gps_coords", async (msgPromise) => {
        const coords = (await msgPromise) as rclnodejs.sensor_msgs.msg.NavSatFix;
 

        

        io.emit("gpsUpdate", {
            gps: { latitude: coords.latitude, longitude: coords.longitude, altitude: coords.altitude }
        });

    });
}



export function mockGpsData(node: rclnodejs.Node) {
    const gpsPublisher = node.createPublisher("sensor_msgs/msg/NavSatFix", "/gps_coords");

    const FRAME_RATE = 1;


    setInterval(() => {
        const lat = Math.random() * 180 - 90;
        const longi = Math.random() * 360 - 180;
        const alt = Math.random() * 50;

        gpsPublisher.publish({
            header: {
                stamp: {
                    sec: 0,
                    nanosec: 0
                },
                frame_id: "gps"
            },
            status: {
                status: 0,        // STATUS_FIX — means "we have a fix"
                service: 1        // SERVICE_GPS
            },
            position_covariance: [
                0.5, 0, 0,
                0, 0.5, 0,
                0, 0, 1.0
            ],
            position_covariance_type: 2,
            
            latitude: lat,
            longitude:longi,
            altitude:alt,
        });
    }, 1000 / FRAME_RATE);
}


export function handleGpsUpdates(coords: gps) {
    const ZED_NODE = "zed_node"; // TODO: Find real zed node name
    

        const lat_div = document.getElementById("gpsLat")!;
        const long_div = document.getElementById("gpsLong")!;
        const alt_div = document.getElementById("gpsAlt")!;

        const lat = coords.latitude;
        const longi = coords.longitude;
        const alt = coords.altitude;

        const lat_dir = lat >= 0 ? 'N' : 'S';

        const long_dir = longi >= 0 ? 'E' : 'W';


        lat_div.innerHTML = `Lat: ${Math.abs(lat).toFixed(4)}° ${lat_dir}`;
        long_div.innerHTML = `Long: ${Math.abs(longi).toFixed(4)}° ${long_dir}`;
        alt_div.innerHTML = `Alt: ${Math.abs(alt).toFixed(4)}m`;
    
   
}





