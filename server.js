import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import {
    LOWEST_SPEED,
    GAME_MAX_SIZE,
    CHAR_COLORS,
    PLAYER_SPAWN_RANGE,
    PLAYER_START_SIZE,
    BULLET_SPEED,
} from './public/const.js'
import path from 'path'

const post = 3000
const __dirname = path.resolve(path.dirname(''))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 4000 })

var colors = CHAR_COLORS
var players = {}
var bullets = {}
var directions = {}
var bulletDirections = {}

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
function sendBullets() {
    io.emit('updateBullets', bullets)
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
function isDiagonalDirection(direction) {
    if (
        !(directions[id].has('up') && directions[id].has('down')) &&
        !(directions[id].has('left') && directions[id].has('right'))
    ) {
        if (directions[id].size == 2) return true
    }
    return false
}
function updatePlayerPosition() {
    Object.keys(directions).forEach((id) => {
        if (!players[id]) return

        var speed = Math.max(
            LOWEST_SPEED,
            LOWEST_SPEED * 2 - Math.floor(players[id].point / 500)
        )
        if (isDiagonalDirection(directions[id]))
            speed = Math.sqrt(speed ** 2 / 2)

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
function updateBulletPosition() {
    Object.keys(bulletDirections).forEach((id) => {
        if (bullets[id]) return

        bullets[id].position.x += bulletDirections[id].velocityX
        bullets[id].position.y += bulletDirections[id].velocityY
    })
}
function getDistance(dx, dy) {
    return Math.sqrt(dx ** 2 + dy ** 2)
}

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/client.html')
})

io.on('connection', (socket) => {
    const id = socket.id

    sendPlayers()

    socket.on('addPlayer', (name) => {
        players[id] = {
            position: getRandomPosition(),
            color: getRandomColor(),
            point: 0,
            name,
            mousePosition: {
                x: 0,
                y: 0,
            },
        }
        directions[id] = new Set()
    })
    socket.on('disconnect', () => {
        if (!players[id]) return

        colors.push(players[id].color)
        delete players[id]
        delete directions[id]
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
    socket.on('mousemove', (mousePosition) => {
        if (!players[id]) return
        players[id].mousePosition = mousePosition
    })
    socket.on('shoot', (mousePosition) => {
        if (!players[id]) return

        const distanceX = mousePosition.x - players[id].position.x
        const distanceY = mousePosition.y - players[id].position.y
        const distance = getDistance(distanceX, distanceY)

        if (distance == 0) return

        const factor = BULLET_SPEED / distance
        const velocityX = distanceX * factor
        const velocityY = distanceY * factor

        bullets[id] = {
            position: players[id].position,
        }

        bulletDirections[id] = {
            velocityX,
            velocityY,
        }
    })
})
setInterval(() => {
    updatePlayerPosition()
    sendPlayers()
    updateBulletPosition()
    sendBullets()
}, 16)

httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
