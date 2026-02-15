import { Server, Socket } from "socket.io";
import * as rclnodejs from "rclnodejs";
// import { Socket } from "socket.io";


interface occupancyGrid{
    resolution: number;
    width: number;
    height:number;
    data: Int8Array;
}




export function setupUpdateOccupancyGrid(node: rclnodejs.Node, io: Server) {



    node.createSubscription("nav_msgs/msg/OccupancyGrid", "/occupancyGridData", async (msgPromise) => {
        const grid = (await msgPromise) as rclnodejs.nav_msgs.msg.OccupancyGrid;




        io.emit("occupancyGridUpdate", {
            occupancyGrid: { resolution: grid.info.resolution, width: grid.info.width, height: grid.info.height, data: Array.from(grid.data)}
        });

    });
}



export function mockOccupancyGridData(node: rclnodejs.Node) {
    const occupancyGridPublisher = node.createPublisher("nav_msgs/msg/OccupancyGrid", "/occupancyGridData");

    const FRAME_RATE = 1;


    setInterval(() => {
    // Create a fake occupancy grid (e.g., 100x100 cells)
    const width = 100;
    const height = 100;
    const resolution = 0.05; // 5cm per cell
    
    // Generate random occupancy data (-1 = unknown, 0 = free, 100 = occupied)
    const data = [];
    for (let i = 0; i < width * height; i++) {
        let rand = Math.random() * 100;
        if(i < 100){
            rand = 100;
        }
        if(i > width*height -50){
            rand = 90
        }
        data.push(rand);
    }
    
    occupancyGridPublisher.publish({
        header: {
            stamp: {
                sec: Math.floor(Date.now() / 1000),
                nanosec: (Date.now() % 1000) * 1000000
            },
            frame_id: "map"
        },
        info: {
            map_load_time: {
                sec: 0,
                nanosec: 0
            },
            resolution: resolution,
            width: width,
            height: height,
            origin: {
                position: {
                    x: -width * resolution / 2,  // Center the map
                    y: -height * resolution / 2,
                    z: 0.0
                },
                orientation: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                    w: 1.0
                }
            }
        },
        data: data
        });
    }, 1000 / FRAME_RATE);
}


// export function handleOccupancyGridRenderUpdates(grid: occupancyGrid) {
//     const ZED_NODE = "zed_node"; // TODO: Find real zed node name


    


    


// }





