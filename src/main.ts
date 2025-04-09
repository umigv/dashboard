import { setupExpress } from "./express";
import { setupSocket } from "./socket";
import { setupROS } from "./ros";
import * as rclnodejs from "rclnodejs";

(async function () {
    await rclnodejs.init();
    
    const node = setupROS();
    const app = setupExpress(node);
    const io = setupSocket(node);

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    io.listen(3001);
})();
