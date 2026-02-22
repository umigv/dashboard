import { setupExpress } from "./express";
import { setupSocket } from "./socket";
import { setupROS } from "./ros";
import { setupUpdateGps } from "./gps";
import * as rclnodejs from "rclnodejs";
import { setupUpdateImu } from "./imu";
import { setupUpdateOdom } from "./odom";
import { setupUpdateOccupancyGrid, setupUpdatePath } from "./canvas";

(async function () {
    await rclnodejs.init();
    
    const node = setupROS();
    const app = setupExpress(node);
    const io = setupSocket(node);
    setupUpdateGps(node, io);
    setupUpdateImu(node,io);
    setupUpdateOdom(node,io);
    setupUpdateOccupancyGrid(node,io);
    setupUpdatePath(node,io);

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    io.listen(3001);
})();
