import express, { Request, Response } from "express";
import fs from "fs";

export function setupExpress() {
    const app = express();
    const index_page = fs.readFileSync("static/index.html", "utf-8");
    
    app.get("/", (req: Request, res: Response) => {
        res.end(index_page);
    });

    return app;
}