const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const post = 3000
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 4000 })

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
var players = {}

function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length)
    const color = colors.splice(randomIndex, 1)
    return color[0]
}
function getRandomPosition() {
    return {
        x: Math.floor(500 * Math.random() + 40),
        y: Math.floor(500 * Math.random() + 40),
    }
}
function update() {
    io.emit('updatePlayers', players)
}

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html')
})

io.on('connection', (socket) => {
    update()
    socket.on('disconnect', (reason) => {
        console.log(reason)
        if (players[socket.id]) {
            colors.push(players[socket.id].color)
            delete players[socket.id]
        }
        update()
    })
    socket.on('addPlayer', (player) => {
        players[socket.id] = {
            position: getRandomPosition(),
            color: getRandomColor(),
            point: 0,
            ...player,
        }
        update()
    })
})

httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
