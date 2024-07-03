import express, { Express, Request, Response } from "express";
const { createServer } = require("http");
const { Server } = require("socket.io");


const post: number = 3000
const app: Express = express()
const httpServer = createServer(app);
const io = new Server(httpServer);


class Player {
    position: {
        x: 0
        y: 0
    }
    color: ''

    constructor(id, x, y, color) {
        this.position.x = x
        this.position.y = y
        this.color = color
    }
}


app.get('/', (req:Request, res:Response) => {
    res.send("hello world")
})

io.on("connection", (socket) => {
    // ...
  });


httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})