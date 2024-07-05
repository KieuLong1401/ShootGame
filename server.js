import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import {
    LOWEST_SPEED,
    GAME_MAX_SIZE,
    CHAR_COLORS,
    PLAYER_SPAWN_RANGE,
    PLAYER_START_SIZE,
} from './public/const.js'
import path from 'path'

const post = 3000
const __dirname = path.resolve(path.dirname(''))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 4000 })

var colors = CHAR_COLORS
var players = {}
var directions = {}

function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length)
    const color = colors.splice(randomIndex, 1)
    return color[0]
}
function getRandomPosition() {
    return {
        x: Math.floor(PLAYER_SPAWN_RANGE * Math.random() + PLAYER_START_SIZE),
        y: Math.floor(PLAYER_SPAWN_RANGE * Math.random() + PLAYER_START_SIZE),
    }
}
function sendPlayers() {
    io.emit('updatePlayers', players)
}
function relocatePlayer(id, speed) {
    if (players[id].position.y < PLAYER_START_SIZE + players[id].point / 10) {
        players[id].position.y = PLAYER_START_SIZE + players[id].point / 10
    }
    if (players[id].position.x < PLAYER_START_SIZE + players[id].point / 10) {
        players[id].position.x = PLAYER_START_SIZE + players[id].point / 10
    }

    if (
        players[id].position.x >
        GAME_MAX_SIZE - (PLAYER_START_SIZE + players[id].point / 10)
    ) {
        players[id].position.x =
            GAME_MAX_SIZE - (PLAYER_START_SIZE + players[id].point / 10)
    }

    if (
        players[id].position.y >
        GAME_MAX_SIZE - (PLAYER_START_SIZE + players[id].point / 10)
    ) {
        players[id].position.y =
            GAME_MAX_SIZE - (PLAYER_START_SIZE + players[id].point / 10)
    }
}
function updatePlayerPosition() {
    Object.keys(directions).forEach((id) => {
        if (!players[id]) return

        var speed = Math.max(
            LOWEST_SPEED,
            LOWEST_SPEED * 2 - Math.floor(players[id].point / 500)
        )

        const isDiagonalDirection = directions[id].size == 2

        if (
            !(directions[id].has('up') && directions[id].has('down')) &&
            !(directions[id].has('left') && directions[id].has('right'))
        ) {
            if (isDiagonalDirection) speed = Math.sqrt(speed ** 2 / 2)
        }

        const updatedPosition = players[id].position

        Array.from(directions[id].entries()).forEach((direction) => {
            switch (direction[0]) {
                case 'up':
                    if (
                        updatedPosition.y - speed <
                        PLAYER_START_SIZE + players[id].point / 10
                    ) {
                        updatedPosition.y =
                            PLAYER_START_SIZE + players[id].point / 10
                    } else {
                        updatedPosition.y -= speed
                    }
                    break
                case 'left':
                    if (
                        updatedPosition.x - speed <
                        PLAYER_START_SIZE + players[id].point / 10
                    ) {
                        updatedPosition.x =
                            PLAYER_START_SIZE + players[id].point / 10
                    } else {
                        updatedPosition.x -= speed
                    }
                    break
                case 'right':
                    if (
                        updatedPosition.x + speed >
                        GAME_MAX_SIZE -
                            (PLAYER_START_SIZE + players[id].point / 10)
                    ) {
                        updatedPosition.x =
                            GAME_MAX_SIZE -
                            (PLAYER_START_SIZE + players[id].point / 10)
                    } else {
                        updatedPosition.x += speed
                    }
                    break
                case 'down':
                    if (
                        updatedPosition.y + speed >
                        GAME_MAX_SIZE -
                            (PLAYER_START_SIZE + players[id].point / 10)
                    ) {
                        updatedPosition.y =
                            GAME_MAX_SIZE -
                            (PLAYER_START_SIZE + players[id].point / 10)
                    } else {
                        updatedPosition.y += speed
                    }
                    break
            }
        })
        players[id].position = updatedPosition
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
            delete players[id]
            delete directions[id]
        }
    })
    socket.on('addPlayer', (name) => {
        players[id] = {
            position: getRandomPosition(),
            color: getRandomColor(),
            point: 0,
            name,
            gunRotateDegree: 0,
        }
        directions[id] = new Set()
    })
    socket.on('keydown', (keycode) => {
        if (!directions[id]) return
        switch (keycode) {
            case 'KeyW':
                directions[id].add('up')
                break
            case 'KeyA':
                directions[id].add('left')
                break
            case 'KeyD':
                directions[id].add('right')
                break
            case 'KeyS':
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
    socket.on('windowBlur', () => {
        directions[id] = new Set()
    })

    socket.on('changeGunRotateDegree', (rotation) => {
        if (players[id]) players[id].gunRotateDegree = rotation
    })
})
setInterval(() => {
    updatePlayerPosition()
    sendPlayers()
}, 16)

httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
