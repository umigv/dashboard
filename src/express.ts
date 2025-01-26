import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

export function setupExpress() {
    const app = express();
    const index_page = fs.readFileSync(path.join(__dirname, "../static/index.html"), "utf-8");
    
    app.get("/", (req: Request, res: Response) => {
        res.end(index_page);
    });

    return app;
}