const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const post = 3000
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 4000 })

const colors = ['#39FF14', '#FF6EC7', '#00FFFF', '#FFFF00', '#FFA500']
const gameMaxSize = 500
var players = {}
var directions = {}
var intervalId

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
    if (value == null) {
        delete players[id]
    } else {
        players[id] = value
    }

    sendPlayers()
}
function updatePlayerPosition() {
    Object.keys(directions).forEach((id) => {
        if (!players[id]) return

        var speed = Math.max(5, 10 - Math.floor(players[id].point / 500))

        const isDiagonalDirection = directions[id].size == 2
        if (isDiagonalDirection) speed = Math.sqrt(speed ** 2 / 2)

        const updatedPosition = players[id].position

        Array.from(directions[id].entries()).forEach((direction) => {
            switch (direction[0]) {
                case 'up':
                    if (updatedPosition.y - speed < 0) {
                        updatedPosition.y = 0
                    } else {
                        updatedPosition.y -= speed
                    }
                    break
                case 'left':
                    if (updatedPosition.x - speed < 0) {
                        updatedPosition.x = 0
                    } else {
                        updatedPosition.x -= speed
                    }
                    break
                case 'right':
                    if (updatedPosition.x + speed > gameMaxSize) {
                        updatedPosition.x = gameMaxSize
                    } else {
                        updatedPosition.x += speed
                    }
                    break
                case 'down':
                    if (updatedPosition.y + speed > gameMaxSize) {
                        updatedPosition.y = gameMaxSize
                    } else {
                        updatedPosition.y += speed
                    }
                    break
            }
        })
        updatePlayer(id, {
            ...players[id],
            position: updatedPosition,
        })
    })
}

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/client.html')
})

io.on('connection', (socket) => {
    const id = socket.id

    sendPlayers()

    socket.on('disconnect', () => {
        if (players[id]) {
            colors.push(players[id].color)
            updatePlayer(id, null)
            delete directions[id]
        }
    })
    socket.on('addPlayer', (name) => {
        updatePlayer(id, {
            position: getRandomPosition(),
            color: getRandomColor(),
            point: 0,
            name,
        })
        directions[id] = new Set()
    })
    socket.on('keydown', (keycode) => {
        if (!directions[id]) return
        switch (keycode) {
            case 'KeyW':
                if (directions[id].has('down')) return
                directions[id].add('up')
                break
            case 'KeyA':
                if (directions[id].has('right')) return
                directions[id].add('left')
                break
            case 'KeyD':
                if (directions[id].has('left')) return
                directions[id].add('right')
                break
            case 'KeyS':
                if (directions[id].has('up')) return
                directions[id].add('down')
                break
        }
    })
    socket.on('keyup', (keycode) => {
        if (!directions[id]) return
        switch (keycode) {
            case 'KeyW':
                directions[id].delete('up')
                break
            case 'KeyA':
                directions[id].delete('left')
                break
            case 'KeyD':
                directions[id].delete('right')
                break
            case 'KeyS':
                directions[id].delete('down')
                break
        }
    })

    clearInterval(intervalId)
    intervalId = setInterval(() => {
        updatePlayerPosition()
    }, 16)
})

httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
