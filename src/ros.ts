require('dotenv').config();

import * as rclnodejs from "rclnodejs";
import { Request, Response, Application } from "express";
import { IO } from "./types";
import { CameraHandler } from "./camera";


export function setupROS(app: Application, io: IO) {
    const node = new rclnodejs.Node("umarv_dashboard_node");
    
    const modePublisher = node.createPublisher("std_msgs/msg/Int32", "is_auto");

    const cameraHandler = new CameraHandler();
    cameraHandler.setupCameraEndpoint(app, node);
    if (!process.env.PROD) {
        cameraHandler.mockCameraData(node);
    }

    node.spin(0);

    app.post("/changeMode", (req: Request, res: Response) => {
        const mode: string = req.body.mode;

        if (!["autonomous", "teleop"].includes(mode)) {
            res.end("Invalid mode!")
        }

        modePublisher.publish({
            data: req.body.mode === "autonomous" ? 1 : 0
        });

        res.end(`Changed mode to ${mode}!`);
    })

    app.post("/spinNode", (req: Request, res: Response) => {
        if (node.spinning) {
            res.end("Node already spinning");
            return;
        }

        node.spin(0);
        res.end("Node spinning");
    });

    app.post("/stopNode", (req: Request, res: Response) => {
        node.stop();
        res.end("Node stopped");
    });

    // Node needs to be destroyed in order for CTRL+C to work
    process.on('SIGINT', () => {
        node.destroy();
        process.exit(0);
    });

    return node;
}