import * as rclnodejs from "rclnodejs";

(async function () {
    await rclnodejs.init();
    
    const node = new rclnodejs.Node("publisher_example_node");
    const subscriber = node.createSubscription("std_msgs/msg/String", "test_topic", (msg) => {
        // Somehow possible to be a buffer, asserting that it is not.
        const as_std_string = msg as rclnodejs.std_msgs.msg.String;
        console.log(`Received message: ${as_std_string.data}`)
    });

    node.spin()
})();