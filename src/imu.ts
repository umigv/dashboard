import { Server, Socket } from "socket.io";
import * as rclnodejs from "rclnodejs";
// import { Socket } from "socket.io";

interface imu{
    roll: number;
    pitch: number;
    yaw: number;
    speed: number;
}





function gauss(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

// Convert Euler angles (rad) to quaternion
function eulerToQuat(roll:number, pitch:number, yaw:number) {
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

export function setupUpdateImu(node: rclnodejs.Node, io: Server){



    node.createSubscription("sensor_msgs/msg/Imu", "/imu_data", async (msgPromise) => {
        const imu_data = (await msgPromise) as rclnodejs.sensor_msgs.msg.Imu;

        let w = imu_data.orientation.w;
        let x = imu_data.orientation.x;
        let y = imu_data.orientation.y;
        let z = imu_data.orientation.z;

        ///for testing
        // let w = 0.7071;
        // let x = 0.7071;
        // let y = 0.0;
        // let z = 0.0;


        let roll = Math.atan2(2*((w*x) + (y*z)),1-(2*((x**2) + (y**2))));
        let pitch = Math.asin(2*((w*y) - (z*x)));
        let yaw = Math.atan2(2*((w*z) + (x*y)),1-(2*((y**2) + (z**2))));

        const rad2deg = (rad: number): number => rad * 180 / Math.PI;

 

        

        io.emit("imuUpdate", {
            imu: { roll: rad2deg(roll), pitch: rad2deg(pitch), yaw: rad2deg(yaw)},
        });
    });
}



export function mockImuData(node: rclnodejs.Node) {
    const imuPublisher = node.createPublisher("sensor_msgs/msg/Imu", "/imu_data");

    const FRAME_RATE = 1;
    const t0 = Date.now();


    setInterval(() => {
        const t = Date.now() - t0;
        const sec = Math.floor(t / 1000);
        const nanosec = (t % 1000) * 1e6;

        // Base "true" motion (slow periodic rotation & acceleration)
        const timeSec = t / 1000.0;
        const roll = 0.05 * Math.sin(0.8 * timeSec);   // small roll oscillation
        const pitch = 0.04 * Math.sin(1.1 * timeSec);
        const yaw = 0.1 * Math.sin(0.6 * timeSec);

        // Turn Euler to quaternion
        const orientation = eulerToQuat(roll, pitch, yaw);

        // Small angular velocity (rad/s) from derivative approx + noise
        const angVelTrue = {
            x: 0.05 * 0.8 * Math.cos(0.8 * timeSec),
            y: 0.04 * 1.1 * Math.cos(1.1 * timeSec),
            z: 0.1 * 0.6 * Math.cos(0.6 * timeSec)
        };

        // Linear acceleration (m/s^2) - pretend some vibration + gravity removed
        const linAccTrue = {
            x: 0.02 * Math.sin(2.5 * timeSec),
            y: 0.015 * Math.sin(3.0 * timeSec),
            z: -0.01 * Math.sin(1.7 * timeSec)
        };

        // Add sensor noise (Gaussian)
        const angVel = {
            x: angVelTrue.x + gauss(0, 0.005),
            y: angVelTrue.y + gauss(0, 0.005),
            z: angVelTrue.z + gauss(0, 0.005)
        };

        const linAcc = {
            x: linAccTrue.x + gauss(0, 0.02),
            y: linAccTrue.y + gauss(0, 0.02),
            z: linAccTrue.z + gauss(0, 0.02)
        };

        // Covariances (row-major 3x3 arrays). Tune these to match noise above.
        const orientation_covariance = [
            1e-4, 0,     0,
            0,    1e-4,  0,
            0,    0,  1e-4
        ];
        const angular_velocity_covariance = [
            2.5e-5, 0,      0,
            0,      2.5e-5, 0,
            0,      0,      2.5e-5
        ];
        const linear_acceleration_covariance = [
            4e-4, 0,    0,
            0,    4e-4, 0,
            0,    0,    4e-4
        ];

            imuPublisher.publish({
                header: {
                stamp: { sec: sec, nanosec: nanosec },
                frame_id: "imu_link"
                },
                orientation: orientation,
                orientation_covariance: orientation_covariance,
                angular_velocity: angVel,
                angular_velocity_covariance: angular_velocity_covariance,
                linear_acceleration: linAcc,
                linear_acceleration_covariance: linear_acceleration_covariance
            });
        }, 1000 / FRAME_RATE);
    }



