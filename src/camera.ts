import * as rclnodejs from "rclnodejs";
import { Application, Request, Response } from "express";
import sharp from "sharp";

export class CameraHandler {
    setupCameraEndpoint(app: Application, node: rclnodejs.Node) {
        const MJPEGBOUNDARY = "--mjpegstream";
        const JPEG_QUALITY = 80;
    
        const mjpegRequests = new Set<Response>();
    
        app.get("/camera/", async (req: Request, res: Response) => {
    
            res.writeHead(200, {
                'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
                'Pragma': 'no-cache',
                'Connection': 'close',
                'Content-Type': `multipart/x-mixed-replace; boundary=${MJPEGBOUNDARY}`
            });
    
            mjpegRequests.add(res);
    
            res.on('close', () => mjpegRequests.delete(res));
        });
    
        node.createSubscription("sensor_msgs/msg/Image", "camera", async (msgPromise) => {
            const rosImage = (await msgPromise) as rclnodejs.sensor_msgs.msg.Image;
    
            const numChannels = Math.floor(rosImage.step / rosImage.width);
            if(numChannels !== 1 && numChannels !== 3 && numChannels !== 4) {
                console.error(`Unsupported number of channels: ${numChannels}`);
                return;
            }
    
            // Convert msg/Image -> JPEG -> MJPEG and write to stream endpoint
            const imageAsJPEG = await sharp(Buffer.from(rosImage.data), {
                raw: {
                    width: rosImage.width,
                    height: rosImage.height,
                    channels: numChannels
                }
            })
                .toFormat('jpeg', { quality: JPEG_QUALITY })
                .toBuffer();
    
            const frame = Buffer.concat([
                Buffer.from(`\r\n${MJPEGBOUNDARY}\r\n`),
                Buffer.from('Content-Type: image/jpeg\r\n'),
                Buffer.from(`Content-Length: ${imageAsJPEG.length}\r\n\r\n`),
                imageAsJPEG
            ]);
    
            mjpegRequests.forEach(res => res.write(frame));
        });
    }
    
    mockCameraData(node: rclnodejs.Node) {
        const cameraPublisher = node.createPublisher("sensor_msgs/msg/Image", "camera");
    
        const IMAGE_WIDTH = 1280;
        const IMAGE_HEIGHT = 720;
        const FRAME_RATE = 10;
    
        setInterval(() => {
            const imageData = new Uint8Array(IMAGE_WIDTH * IMAGE_HEIGHT * 3);
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
                height: IMAGE_HEIGHT,
                width: IMAGE_WIDTH,
                encoding: "rgb8",
                is_bigendian: 0,
                step: IMAGE_WIDTH * 3,
                data: imageData
            });
        }, 1000 / FRAME_RATE);
    }
};