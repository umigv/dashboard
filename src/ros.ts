require('dotenv').config();

import * as rclnodejs from "rclnodejs";

export function setupROS() {
    const node = new rclnodejs.Node("umarv_dashboard_node");

    node.spin(0);

    // Node needs to be destroyed in order for CTRL+C to work
    process.on('SIGINT', () => {
        node.destroy();
        process.exit(0);
    });

    return node;
}
