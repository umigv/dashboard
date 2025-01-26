import { setupExpress } from "./express";
import { setupSocket } from "./socket";
import { setupROS } from "./ros";
import * as rclnodejs from "rclnodejs";

(async function () {
    await rclnodejs.init();
    
    const app = setupExpress();
    const io = setupSocket();
    const node = setupROS(app, io);

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    io.listen(3001);
})();
