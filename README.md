# Robot Dashboard

Frontend interface to the UMARV robot.

## Runtime Dependencies
* Node.js LTS
* `yarn`
* The following, which can be installed with `yarn`:
    * `rclnodejs`
    * `express`
    * `socket.io`

## Development Dependencies
* The following, which can be installed with `yarn`:
    * `typescript`
    * `@types/express`

## Run
To run the dashboard, use `npm start`

## Benchmark
1. Run the dashboard
2. In a separate terminal, run `node benchmark/cameraStreamFramerate.js`
3. After 5 seconds, the framerate from the stream will be reported.

## Features and Wireframe
https://docs.google.com/document/d/17xzfBH0NhpldTtIRr2JKW7ZCtyYd8yEUeFdA9Q1jq8o/edit?tab=t.0