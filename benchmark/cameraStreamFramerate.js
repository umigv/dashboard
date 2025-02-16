const http = require('http');

class MJPEGFPSDetector {
    constructor(url) {
        this.url = url;
        this.frameCount = 0;
        this.startTime = null;
        this.boundary = null;
        this.buffer = Buffer.alloc(0);
    }

    async detectFPS(duration = 5000) {
        return new Promise((resolve, reject) => {
            const request = http.get(this.url, (response) => {
                const contentType = response.headers['content-type'];
                
                if (!contentType) {
                    reject(new Error('No content-type header received'));
                    return;
                }

                if (contentType.includes('boundary=')) {
                    let boundary = contentType.split('boundary=')[1].trim();
                    // Remove quotes if present
                    if (boundary.startsWith('"') && boundary.endsWith('"')) {
                        boundary = boundary.slice(1, -1);
                    }
                    this.boundary = boundary;
                } else {
                    reject(new Error(`No boundary found in content type: ${contentType}`));
                    return;
                }

                this.startTime = Date.now();

                response.on('data', (chunk) => {
                    this.buffer = Buffer.concat([this.buffer, chunk]);
                    this.processBuffer();

                    const currentTime = Date.now();
                    const elapsed = (currentTime - this.startTime) / 1000;
                    
                    if (currentTime - this.startTime >= duration) {
                        const fps = this.frameCount / elapsed;
                        response.destroy();
                        resolve(fps);
                    }
                });

                response.on('error', (error) => {
                    reject(error);
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.setTimeout(10000, () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    processBuffer() {
        while (this.buffer.length > 0) {
            const boundaryIndex = this.buffer.indexOf(this.boundary);
            
            if (boundaryIndex === -1) {
                if (this.buffer.length > 1000000) {
                    this.buffer = Buffer.alloc(0);
                }
                break;
            }

            const headersEnd = this.buffer.indexOf('\r\n\r\n', boundaryIndex);
            
            if (headersEnd === -1) {
                break;
            }

            const nextBoundaryIndex = this.buffer.indexOf(this.boundary, boundaryIndex + this.boundary.length);
            
            if (nextBoundaryIndex === -1) {
                break;
            }

            this.frameCount++;
            this.buffer = this.buffer.slice(nextBoundaryIndex);
        }
    }
}

async function main() {
    const streamUrl = "http://localhost:3000/camera/";
    const detector = new MJPEGFPSDetector(streamUrl);
    
    try {
        const fps = await detector.detectFPS();
        console.log(`Detected framerate: ${fps.toFixed(2)} FPS`);
    } catch (error) {
        console.error('Error detecting FPS:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = MJPEGFPSDetector;