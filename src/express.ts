import express, { Application, json, Request, Response } from "express";
import fs from "fs";
import path from "path";
import {spawn} from "child_process";
import * as rclnodejs from "rclnodejs";
import { CameraHandler } from "./camera";


// TODO: Replace with actual launch file when that launch file is written.
const SELF_DRIVING_LAUNCH_FILE_PATH = path.join(__dirname, "../", "sample_launch.py");

export function setupExpress(node: rclnodejs.Node): Application {
    const app = express();

    app.use('/static', express.static('static'));
    app.use(json());

    app.get("/", (req: Request, res: Response) => {
        res.end(fs.readFileSync(path.join(__dirname, "../static/index.html"), "utf-8"));
    });

    app.post("/startSelfDriving", async (req: Request, res: Response) => {
        try {
            const child = spawn("bash", [
                "-c", 
                `source /opt/ros/humble/setup.bash && ros2 launch '${SELF_DRIVING_LAUNCH_FILE_PATH}'`
            ], {
                detached: true,
                stdio: [null, null, process.stderr]
            });

            child.unref();

            await res.sendStatus(200);
        } catch (e) {
            console.error(e);
            await res.sendStatus(500);
        }
    });

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

    modeControl(app, node);

    const cameraHandler = new CameraHandler();
    cameraHandler.setupCameraEndpoint(app, node);
    if (!process.env.PROD) {
        cameraHandler.mockCameraData(node);
    }

    return app;
}

function modeControl(app: Application, node: rclnodejs.Node) {
    const modePublisher = node.createPublisher("std_msgs/msg/Int32", "is_auto");

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
}