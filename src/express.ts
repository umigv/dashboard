import express, { json, Request, Response } from "express";
import fs from "fs";
import path from "path";
import {spawn} from "child_process";

// TODO: Replace with actual launch file when that launch file is written.
const SELF_DRIVING_LAUNCH_FILE_PATH = path.join(__dirname, "../", "sample_launch.py");

export function setupExpress() {
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

    return app;
}