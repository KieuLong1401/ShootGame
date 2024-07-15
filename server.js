import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import {
    GAME_SIZE,
    CHAR_COLORS,
    PLAYER_SIZE,
    PLAYER_SPEED,
    BULLET_SPEED,
    BULLET_WIDTH,
    BULLET_HEIGHT,
    SHOOT_DELAY,
    BULLET_RANGE_LIMIT,
    PLAYER_HP,
    BULLET_DAMAGE,
    HEAL_AFTER_GET_HIT,
    HEAL_AMOUNT,
} from './public/const.js'
import path from 'path'

const post = 3000
const __dirname = path.resolve(path.dirname(''))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 5000, addTrailingSlash: false, })

var colors = CHAR_COLORS
var backendPlayers = {}
var backendBullets = []
var directions = {}
var shootIntervalId

function getRandomColor() {
    let randomIndex = Math.floor(Math.random() * colors.length)
    let color = colors.splice(randomIndex, 1)
    return color[0]
}
function getRandomPosition() {
    let x = Math.random() * (GAME_SIZE - PLAYER_SIZE * 2) + PLAYER_SIZE
    let y = Math.random() * (GAME_SIZE - PLAYER_SIZE * 2) + PLAYER_SIZE

    return {
        x,
        y
    }
}
function getCorners(bullet) {
    let bulletPosition = bullet.position

    let halfWidth = BULLET_WIDTH / 2;
    let halfHeight = BULLET_HEIGHT / 2;

    let corners = [
        { x: bulletPosition.x + 60 - halfWidth, y: bulletPosition.y - halfHeight },
        { x: bulletPosition.x + 60 + halfWidth, y: bulletPosition.y - halfHeight },
        { x: bulletPosition.x + 60 + halfWidth, y: bulletPosition.y + halfHeight },
        { x: bulletPosition.x + 60 - halfWidth, y: bulletPosition.y + halfHeight },
    ];

    return corners.map(point => getRotatedPoint(bulletPosition, bullet.rotateDegree, point));
}
function getRotatedPoint(center, rotateAngle, point) {
    point.x -= center.x;
    point.y -= center.y;
    
    let sinAngle = Math.sin(rotateAngle);
    let cosAngle = Math.cos(rotateAngle);

    let xNew = point.x * cosAngle - point.y * sinAngle;
    let yNew = point.x * sinAngle + point.y * cosAngle;
    
    point.x = xNew + center.x;
    point.y = yNew + center.y;

    return point;
}
function getDistance(positionA, positionB) {
    let distanceX = positionA.x - positionB.x;
    let distanceY = positionA.y - positionB.y;

    return Math.sqrt(distanceX ** 2 + distanceY ** 2)
}

function emitData() {
    let data = {backendPlayers, backendBullets}
    io.emit('updateData', data)
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
function checkCollision(player, bullet) {
    const corners = getCorners(bullet);
    for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex++) {
        let corner = corners[cornerIndex]

        if (pointInCircle(corner, player)) {
            return true;
        }
    }
    return false;
}
function pointInCircle(position, player) {
    let distanceX = position.x - player.position.x;
    let distanceY = position.y - player.position.y;
    return distanceX * distanceX + distanceY * distanceY <= PLAYER_SIZE * PLAYER_SIZE;
}

function updatePlayer() {
    Object.keys(backendPlayers).forEach(playerId => {
        if(backendPlayers[playerId].lastGetHitTime < new Date().getTime() - HEAL_AFTER_GET_HIT) {
            if(backendPlayers[playerId].hp + HEAL_AMOUNT <= PLAYER_HP) {
                backendPlayers[playerId].hp += HEAL_AMOUNT
            } else {
                backendPlayers[playerId].hp = PLAYER_HP
            }
        }
    })
    Object.keys(directions).forEach((id) => {
        if (!backendPlayers[id]) return

        let speed = PLAYER_SPEED
        if (isDiagonalDirection(directions[id]))
            speed = Math.sqrt(speed ** 2 / 2)

        const updatedPosition = backendPlayers[id].position
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

        backendPlayers[id].position = updatedPosition
    })
}
function updateBullet() {
    for (let bulletIndex = backendBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        let bullet = backendBullets[bulletIndex]

        if (
            (
                bullet.position.x < 0 ||
                bullet.position.y < 0 ||
                bullet.position.x > GAME_SIZE ||
                bullet.position.y > GAME_SIZE
            ) 
            || 
            getDistance(bullet.firstPosition, bullet.position) > BULLET_RANGE_LIMIT
        ) {
            deleteBullet(bulletIndex)
        } else {
            bullet.position.x += bullet.velocity.x
            bullet.position.y += bullet.velocity.y

            for (let playerId in backendPlayers) {
                if (
                    checkCollision(
                        backendPlayers[playerId],
                        bullet
                    ) &&
                    bullet.id != playerId
                ) {
                    if(backendPlayers[playerId].hp - BULLET_DAMAGE > 0) {
                        backendPlayers[playerId].hp -= BULLET_DAMAGE
                        backendPlayers[playerId].lastGetHitTime = new Date().getTime()
                        deleteBullet(bulletIndex)
                    } else {
                        backendPlayers[bullet.id].kill += 1
                        io.emit('kill', {killedPlayer: backendPlayers[bullet.id], beKilledPlayer: backendPlayers[playerId]})
                        deleteBullet(bulletIndex)
                        deletePlayer(playerId)
                    }
                    return

                }
            }
        }
    }
}

function deletePlayer(playerId) {
    colors.push(backendPlayers[playerId].color)

    delete backendPlayers[playerId]
    delete directions[playerId]

    for (let bulletIndex = backendBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        let bullet = backendBullets[bulletIndex]
        if (bullet.id == playerId) {
            deleteBullet(bulletIndex)
        }
    }
}
function deleteBullet(bulletIndex) {
    backendBullets.splice(bulletIndex, 1)
}

function disconnectHandler(id) {
    if (!backendPlayers[id]) return

    deletePlayer(id)
}

app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/client.html')
})

io.on('connection', (socket) => {
    const id = socket.id

    socket.on('addPlayer', (name) => {
        backendPlayers[id] = {
            position: getRandomPosition(),
            color: getRandomColor(),
            kill: 0,
            hp: PLAYER_HP,
            name,
            gunRotateDegree: 0,
            lastShotTime: new Date().getTime() - SHOOT_DELAY,
            lastGetHitTime: new Date().getTime() - HEAL_AFTER_GET_HIT
        }
        directions[id] = new Set()
    })
    socket.on('disconnect', () => disconnectHandler(id))
    socket.on('exit', () => disconnectHandler(id))

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
        if (!backendPlayers[id]) return
        backendPlayers[id].gunRotateDegree = gunRotateDegree
    })
    socket.on('shoot', (gunRotateDegree) => {
        let shotPlayer = backendPlayers[id]
        let currentTime = new Date().getTime()

        if (!shotPlayer) return

        if(currentTime - shotPlayer.lastShotTime >= SHOOT_DELAY) {
            backendBullets.push({
                id,
                firstPosition: { ...shotPlayer.position },
                position: { ...shotPlayer.position },
                velocity: {
                    x: Math.cos(gunRotateDegree) * BULLET_SPEED,
                    y: Math.sin(gunRotateDegree) * BULLET_SPEED,
                },
                rotateDegree: gunRotateDegree,
                color: shotPlayer.color,
            })
            shotPlayer.lastShotTime = currentTime
        }

    })
    
    socket.on('shootJoystickTrigger', () => {
        clearInterval(shootIntervalId)
        shootIntervalId = setInterval(() => {
            let shotPlayer = backendPlayers[id]
    
            if (!shotPlayer) return
    
            backendBullets.push({
                id,
                firstPosition: { ...shotPlayer.position },
                position: { ...shotPlayer.position },
                velocity: {
                    x: Math.cos(shotPlayer.gunRotateDegree) * BULLET_SPEED,
                    y: Math.sin(shotPlayer.gunRotateDegree) * BULLET_SPEED,
                },
                rotateDegree: shotPlayer.gunRotateDegree,
                color: shotPlayer.color,
            })
        }, SHOOT_DELAY)
    })
    socket.on('shootJoystickUnTrigger', () => {
        clearInterval(shootIntervalId)
    })
    socket.on('moveJoystickTrigger', (direction) => {
        if(!directions[id]) return

        directions[id] = new Set(direction)
    })
    socket.on('moveJoystickUnTrigger',() => {
        if(!directions[id]) return

        directions[id] = new Set()
    })
    
})

setInterval(() => {
    updatePlayer()
    updateBullet()
    emitData()
}, 33)

httpServer.listen(post, () => {
    console.log(`server running in post ${post}`)
})
