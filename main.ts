import express, { Request, Response } from "express";
import { Server } from "socket.io";
import * as rclnodejs from "rclnodejs";

const fs = require('fs');

const app = express();

interface ServerToClientEvents {
    pong: (message: string) => void;
    message: (data: string) => void;
}

interface ClientToServerEvents {
    ping: (message: string) => void;
}

interface InterServerEvents { }

interface SocketData {
    name: string;
    age: number;
}

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>({
    cors: {
        origin: "*" // TODO: CSRF
    }
});

io.on("connection", (socket) => {
    socket.on("ping", (message) => {
        console.log(message);
        socket.emit("pong", "Pong!");
    });
});

const index_page = fs.readFileSync("static/index.html", "utf-8");
app.get("/", (req: Request, res: Response) => {
    res.end(index_page);
});

(async function () {
    await rclnodejs.init();
    
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    io.listen(3001);

    const node = new rclnodejs.Node("umarv_dashboard_node");

    const subscriptions: Map<string, rclnodejs.Subscription> = new Map();

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
})();