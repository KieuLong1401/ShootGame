import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import {
    GAME_SIZE,
    CAMERA_WIDTH,
    CAMERA_HEIGHT,
    CHAR_COLORS,
    PLAYER_SIZE,
    LOWEST_SPEED,
    BULLET_SPEED,
    BULLET_WIDTH,
} from './public/const.js'
import path from 'path'

const post = 3000
const __dirname = path.resolve(path.dirname(''))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 4000 })

var colors = CHAR_COLORS
var players = {}
var bullets = []
var directions = {}

function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length)
    const color = colors.splice(randomIndex, 1)
    return color[0]
}
function getRandomPosition() {
    return {
        x: Math.floor(
            Math.random() * (GAME_SIZE - PLAYER_SIZE * 2) + PLAYER_SIZE
        ),
        y: Math.floor(
            Math.random() * (GAME_SIZE - PLAYER_SIZE * 2) + PLAYER_SIZE
        ),
    }
}
function getDistance(position1, position2) {
    const distanceX = position1.x - position2.x
    const distanceY = position1.y - position2.y

    return Math.sqrt(distanceX ** 2 + distanceY ** 2)
}

function sendPlayers() {
    io.emit('updatePlayers', players)
}
function sendBullets() {
    io.emit('updateBullets', bullets)
}
function emitData() {
    sendPlayers()
    sendBullets()
}

function isDiagonalDirection(direction) {
    if (
        !(direction.has('up') && direction.has('down')) &&
        !(direction.has('left') && direction.has('right'))
    ) {
        if (direction.size == 2) return true
    }
    return false
}

function relocatePlayer(id, speed) {
    if (players[id].position.y < PLAYER_SIZE + players[id].point / 10) {
        players[id].position.y = PLAYER_SIZE + players[id].point / 10
    }
    if (players[id].position.x < PLAYER_SIZE + players[id].point / 10) {
        players[id].position.x = PLAYER_SIZE + players[id].point / 10
    }

    if (
        players[id].position.x >
        CAMERA_WIDTH - (PLAYER_SIZE + players[id].point / 10)
    ) {
        players[id].position.x =
            CAMERA_WIDTH - (PLAYER_SIZE + players[id].point / 10)
    }

    if (
        players[id].position.y >
        CAMERA_HEIGHT - (PLAYER_SIZE + players[id].point / 10)
    ) {
        players[id].position.y =
            CAMERA_HEIGHT - (PLAYER_SIZE + players[id].point / 10)
    }
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
                    if (updatedPosition.y - speed < PLAYER_SIZE) {
                        updatedPosition.y = PLAYER_SIZE
                    } else {
                        updatedPosition.y -= speed
                    }
                    break
                case 'left':
                    if (updatedPosition.x - speed < PLAYER_SIZE) {
                        updatedPosition.x = PLAYER_SIZE
                    } else {
                        updatedPosition.x -= speed
                    }
                    break
                case 'right':
                    if (updatedPosition.x + speed > GAME_SIZE - PLAYER_SIZE) {
                        updatedPosition.x = GAME_SIZE - PLAYER_SIZE
                    } else {
                        updatedPosition.x += speed
                    }
                    break
                case 'down':
                    if (updatedPosition.y + speed > GAME_SIZE - PLAYER_SIZE) {
                        updatedPosition.y = GAME_SIZE - PLAYER_SIZE
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
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (
            bullets[i].position.x < 0 ||
            bullets[i].position.y < 0 ||
            bullets[i].position.x > GAME_SIZE ||
            bullets[i].position.y > GAME_SIZE
        ) {
            bullets.splice(i, 1)
        } else {
            bullets[i].position.x += bullets[i].velocity.x
            bullets[i].position.y += bullets[i].velocity.y

            for (let playerId in players) {
                if (
                    getDistance(
                        players[playerId].position,
                        bullets[i].position
                    ) <=
                        PLAYER_SIZE + BULLET_WIDTH / 2 &&
                    bullets[i].id != playerId
                ) {
                    bullets.splice(i, 1)
                    deletePlayer(playerId)
                    return
                }
            }
        }
    }
}

function deletePlayer(id) {
    colors.push(players[id].color)
    delete players[id]
    delete directions[id]

    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].id == id) {
            bullets.splice(i, 1)
        }
    }
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
            gunRotateDegree: 0,
        }
        directions[id] = new Set()
    })
    socket.on('disconnect', () => {
        if (!players[id]) return

        deletePlayer(id)
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
    socket.on('mousemove', (gunRotateDegree) => {
        if (!players[id]) return
        players[id].gunRotateDegree = gunRotateDegree
    })
    socket.on('shoot', (gunRotateDegree) => {
        if (!players[id]) return

        bullets.push({
            id,
            position: { ...players[id].position },
            velocity: {
                x: Math.cos(gunRotateDegree) * BULLET_SPEED,
                y: Math.sin(gunRotateDegree) * BULLET_SPEED,
            },
            rotateDegree: gunRotateDegree,
            color: players[id].color,
        })
    })
})
setInterval(() => {
    updatePlayerPosition()
    updateBulletPosition()
    emitData()
}, 16)

httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
