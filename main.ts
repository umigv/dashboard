import express, { Request, Response } from "express";
import { Server } from "socket.io";
import * as rclnodejs from "rclnodejs";

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

app.get("/", (req: Request, res: Response) => {
    res.end(
        `<!DOCTYPE html>
        <html>
        <body>
            <h1>Socket.io Ping/Pong</h1>
            <script type="module">
                import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

                const socket = io("http://localhost:3001");

                socket.emit("ping", "Ping!");
                socket.on("pong", (message) => {
                    console.log(message);
                });

                socket.on("message", (data) => {
                    console.log(data);
                    document.body.insertAdjacentHTML('beforeend', \`<p>\${data}</p>\`);
                });
            </script>
        </body>`
    )
});

(async function () {
    await rclnodejs.init();
    
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });

    io.listen(3001);

    const node = new rclnodejs.Node("publisher_example_node");
    const subscriber = node.createSubscription("std_msgs/msg/String", "test_topic", (msg) => {
        // Somehow possible to be a buffer, asserting that it is not.
        const as_std_string = msg as rclnodejs.std_msgs.msg.String;
        console.log(`Received message: ${as_std_string.data}`);

        io.emit("message", as_std_string.data);
    });

    node.spin()
})();