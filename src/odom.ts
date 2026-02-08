import { Server } from "socket.io";
import * as rclnodejs from "rclnodejs";

interface odom {
  velocity: number;
  position: position;
}

interface position{
  x: number;
  y: number;
  z: number;
}

let posx = 0;
let posy = 0;
let posz = 0; 


function gauss(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

function eulerToQuat(roll: number, pitch: number, yaw: number) {
  const cy = Math.cos(yaw * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sp = Math.sin(pitch * 0.5);
  const cr = Math.cos(roll * 0.5);
  const sr = Math.sin(roll * 0.5);

  return {
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
    w: cr * cp * cy + sr * sp * sy
  };
}

export function setupUpdateOdom(node: rclnodejs.Node, io: Server) {

  node.createSubscription("nav_msgs/msg/Odometry", "/odomData", async (msgPromise) => {
    const odomData = (await msgPromise) as rclnodejs.nav_msgs.msg.Odometry;

    const vx = odomData.twist.twist.linear.x;
    const vy = odomData.twist.twist.linear.y;
    const vz = odomData.twist.twist.linear.z;

    const speed = Math.sqrt(vx ** 2 + vy ** 2 + vz ** 2);

    const position = odomData.pose.pose.position;
    io.emit("odomUpdate", {
      odom: { velocity: speed, position: position } as odom
    });

  });
}

//
// Mock IMU/Odom generator
//
export function mockOdomData(node: rclnodejs.Node) {

  const odomPub = node.createPublisher("nav_msgs/msg/Odometry", "/odomData");

  const FRAME_RATE = 1;
  const t0 = Date.now();

  setInterval(() => {
    const t = Date.now() - t0;
    const sec = Math.floor(t / 1000);
    const nanosec = (t % 1000) * 1e6;
    const timeSec = t / 1000.0;

    // Fake orientation (oscillating)
    const roll = 0.05 * Math.sin(0.8 * timeSec);
    const pitch = 0.04 * Math.sin(1.1 * timeSec);
    const yaw = 0.1 * Math.sin(0.6 * timeSec);

    const orientation = eulerToQuat(roll, pitch, yaw);

    // Fake linear velocity
    const vx = 5.0 + gauss(0, 0.05);
    const vy = 0.0 + gauss(0, 0.02);
    const vz = 0.0 + gauss(0, 0.01);

    // Fake angular velocity
    const angVel = {
      x: gauss(0, 0.01),
      y: gauss(0, 0.01),
      z: gauss(0, 0.01)
    };

    posx += Math.random()*5;
    posz += Math.random()*5;

    odomPub.publish({
      header: {
        stamp: { sec, nanosec },
        frame_id: "odom"
      },
      child_frame_id: "base_link",

      pose: {
        pose: {
          position: { x: posx, y: posy, z: posz },
          orientation: orientation
        },
        covariance: new Array(36).fill(0)
      },

      twist: {
        twist: {
          linear: { x: vx, y: vy, z: vz },
          angular: angVel
        },
        covariance: new Array(36).fill(0)
      }
    });

  }, 1000 / FRAME_RATE);
}

