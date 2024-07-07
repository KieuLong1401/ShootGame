import Player from './classes/Player.js'
import Game from './classes/Game.js'
import Bullet from './classes/Bullet.js'
import { CAMERA_HEIGHT, CAMERA_WIDTH, GAME_SIZE } from './const.js'

const socket = io()
socket.on('connect', () => {
    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const canvas = document.querySelector('#canvas')
    const myGame = new Game(canvas)

    var frontendPlayers = {}
    var frontendBullets = []
    var basePosition = {
        x: GAME_SIZE / 2,
        y: GAME_SIZE / 2,
    }
    var animationId
    var id = socket.id

    myGame.canvas.width = window.innerWidth
    myGame.canvas.height = window.innerHeight

    function addPlayer() {
        if (!Object.keys(frontendPlayers).includes(id)) {
            socket.emit('addPlayer', 'long')
            menu.classList.add('hide')
        }
    }

    function renderPlayers() {
        Object.keys(frontendPlayers).forEach((id) => {
            const player = frontendPlayers[id]
            player.render(myGame.ctx)
        })
    }
    function renderBullets() {
        frontendBullets.forEach((e) => {
            e.render(myGame.ctx)
        })
    }
    function animate() {
        animationId = requestAnimationFrame(animate)

        myGame.render()
        renderBullets()
        renderPlayers()
    }

    joinBtn.addEventListener('click', addPlayer)

    window.addEventListener('keydown', (event) => {
        if (
            event.ctrlKey &&
            (event.key === '=' ||
                event.key === '-' ||
                event.key === '0' ||
                event.key === '+')
        ) {
            event.preventDefault()
        } else {
            socket.emit('keydown', event.code)
        }
    })
    window.addEventListener('keyup', (e) => {
        socket.emit('keyup', e.code)
    })
    window.addEventListener('blur', () => {
        socket.emit('windowBlur')
    })
    window.addEventListener('click', () => {
        if (!frontendPlayers[id]) return

        const gunRotateDegree = frontendPlayers[id].gunRotateDegree

        socket.emit('shoot', gunRotateDegree)
    })
    window.addEventListener('resize', () => {
        myGame.cameraSize = {
            width: CAMERA_WIDTH * window.devicePixelRatio,
            height: CAMERA_HEIGHT * window.devicePixelRatio,
        }
        myGame.canvas.width = window.innerWidth
        myGame.canvas.height = window.innerHeight
    })
    document.addEventListener(
        'wheel',
        function (e) {
            if (e.ctrlKey) {
                e.preventDefault()
            }
        },
        { passive: false }
    )

    myGame.canvas.addEventListener('mousemove', (e) => {
        if (!frontendPlayers[id]) return

        socket.emit(
            'mousemove',
            Math.atan2(
                e.clientY - frontendPlayers[id].position.y,
                e.clientX - frontendPlayers[id].position.x
            )
        )
    })

    socket.on('updatePlayers', (backendPlayers) => {
        const frontendPlayerIds = Object.keys(frontendPlayers)
        const backendPlayerIds = Object.keys(backendPlayers)

        if (backendPlayers[id]) {
            basePosition = backendPlayers[id].position
            myGame.playerPosition = basePosition
        } else {
            menu.classList.remove('hide')
        }

        frontendPlayerIds.forEach((playerId) => {
            if (!backendPlayerIds.includes(playerId)) {
                delete frontendPlayers[playerId]
            }
        })
        backendPlayerIds.forEach((playerId) => {
            const player = new Player({
                ...backendPlayers[playerId],
                position: {
                    x:
                        backendPlayers[playerId].position.x -
                        basePosition.x +
                        myGame.canvas.width / 2,
                    y:
                        backendPlayers[playerId].position.y -
                        basePosition.y +
                        myGame.canvas.height / 2,
                },
            })
            frontendPlayers[playerId] = player
        })
    })
    socket.on('updateBullets', (backendBullets) => {
        frontendBullets = []
        backendBullets.forEach((bullet) => {
            const frontendBullet = new Bullet({
                ...bullet,
                position: {
                    x:
                        bullet.position.x -
                        basePosition.x +
                        myGame.canvas.width / 2,
                    y:
                        bullet.position.y -
                        basePosition.y +
                        myGame.canvas.height / 2,
                },
            })
            frontendBullets.push(frontendBullet)
        })
    })

    animate()
})
