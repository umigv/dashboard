import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

export function setupExpress() {
    const app = express();

    app.use('/static', express.static('static'));
    
    app.get("/", (req: Request, res: Response) => {
        res.end(fs.readFileSync(path.join(__dirname, "../static/index.html"), "utf-8"));
    });

    return app;
}