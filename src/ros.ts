require('dotenv').config();

import * as rclnodejs from "rclnodejs";
import { Request, Response, Application, json } from "express";
import { IO } from "./types";

export function setupROS(app: Application, io: IO) {
    const node = new rclnodejs.Node("umarv_dashboard_node");
    const subscriptions: Map<string, rclnodejs.Subscription> = new Map();
    
    const modePublisher = node.createPublisher("std_msgs/msg/Int32", "is_auto");

    node.createSubscription("sensor_msgs/msg/Image", "camera", async (msgPromise) => {
        const imageData = (await msgPromise) as rclnodejs.sensor_msgs.msg.Image;
        io.emit("camera", JSON.stringify(imageData));
    });

    if (!process.env.PROD) {
        const cameraPublisher = node.createPublisher("sensor_msgs/msg/Image", "camera");

        setInterval(() => {
            const imageData = new Uint8Array(640 * 480 * 3);
            for (let i = 0; i < imageData.length; i++) {
                imageData[i] = Math.floor(Math.random() * 256);
            }

            cameraPublisher.publish({
                header: {
                    stamp: {
                        sec: 0,
                        nanosec: 0
                    },
                    frame_id: "camera"
                },
                height: 480,
                width: 640,
                encoding: "rgb8",
                is_bigendian: 0,
                step: 640 * 3,
                data: imageData
            });
        }, 1000);
    }

    node.spin(0);

    app.use(json());

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

    app.post("/subscribe/:topic_type/:topic_name", (req: Request, res: Response) => {
        const topic_name = req.params.topic_name;
        const topic_type = req.params.topic_type;

        switch (topic_type) {
            case "std_msgs/msg/String":
                subscriptions.set(topic_name, node.createSubscription("std_msgs/msg/String", topic_name, (msg) => {
                    const as_std_string = msg as rclnodejs.std_msgs.msg.String;
                    io.emit("message", as_std_string.data);
                }));
                res.end(`Subscribed to string topic "${topic_name}"`);
                break;
            default:
                res.status(404).end(`Unknown topic type "${topic_type}"`);
        }
    });

    app.post("/unsubscribe/:topic_name", (req: Request, res: Response) => {
        const topic_name = req.params.topic_name;
        const subscription = subscriptions.get(topic_name);

        if (!subscription) {
            res.status(404).end(`Not subscribed to topic with name "${topic_name}"`)
            return;
        }

        node.destroySubscription(subscription);
        subscriptions.delete(topic_name);
        res.end(`Unsubscribed from topic "${topic_name}"`);
    });

    // Node needs to be destroyed in order for CTRL+C to work
    process.on('SIGINT', () => {
        node.destroy();
        process.exit(0);
    });

    return node;
}