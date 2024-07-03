const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const post = 3000
const app= express()
const httpServer = createServer(app)
const io = new Server(httpServer)

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
var players = {}


function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length)
    const color = colors.splice(randomIndex, 1)
    return color[0]
}
function getRandomPosition() {
    return {
        x: Math.floor(500* Math.random()),
        y: Math.floor(500* Math.random()),
    }
}


app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html')
})

io.on("connection", (socket) => {
    players[socket.id] = {
        position: getRandomPosition(),
        color: getRandomColor()
    }

    io.emit('updatePlayers', players)

    socket.on('disconnect', (reason) => {
        console.log(reason)
        delete players[socket.id]
    })
})


httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})