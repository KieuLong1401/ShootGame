const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const post = 3000
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 4000 })

const colors = ['#39FF14', '#FF6EC7', '#00FFFF', '#FFFF00', '#FFA500']
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
function sendPlayers() {
    io.emit('updatePlayers', players)
}
function updatePlayer(id, value) {
    if(value == null) {
        delete players[id] 
    } else {
        players[id] = value
    }

    sendPlayers()
}


app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/client.html')
})

io.on('connection', (socket) => {
    sendPlayers()
    socket.on('disconnect', (reason) => {
        if (players[socket.id]) {
            colors.push(players[socket.id].color)
            updatePlayer(socket.id, null)
        }
    })
    socket.on('addPlayer', (player) => {
        updatePlayer(socket.id, {
            position: getRandomPosition(),
            color: getRandomColor(),
            point: 0,
            ...player,
        })
    })
})



httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
