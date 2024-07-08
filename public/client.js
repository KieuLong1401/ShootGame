import Player from './classes/Player.js'
import Game from './classes/Game.js'
import Bullet from './classes/Bullet.js'
import { CAMERA_HEIGHT, CAMERA_WIDTH, GAME_SIZE, MAX_PLAYER } from './const.js'

const socket = io()
socket.on('connect', () => {
    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const canvas = document.querySelector('#canvas')
    const errorText = document.querySelector('#errorText')
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
        const playerIds = Object.keys(frontendPlayers)
        const name = document.querySelector('#nameInput').value
        
        if(playerIds.includes(id)) return
        if (playerIds.length >= MAX_PLAYER) {
            errorText.innerHTML = 'full slot'
            return
        } 
        if(name == '') {
            errorText.innerHTML = 'please enter your name'
            return
        }

        socket.emit('addPlayer', name)
    }

    function getPositionInCamera(position) {
        return {
            x:
                position.x -
                basePosition.x +
                myGame.canvas.width / 2,
            y:
                position.y -
                basePosition.y +
                myGame.canvas.height / 2,
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
        } else if(event.code == 'KeyW' || event.code == 'KeyA' || event.code == 'KeyS' || event.code == 'KeyD') {
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

        const myPlayer = backendPlayers[id]

        if (!!myPlayer) {
            basePosition = myPlayer.position
            myGame.basePosition = basePosition

            menu.classList.add('hide')
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
                position: getPositionInCamera(backendPlayers[playerId].position),
            })
            frontendPlayers[playerId] = player
        })
    })
    socket.on('updateBullets', (backendBullets) => {
        frontendBullets = []
        backendBullets.forEach((bullet) => {
            const frontendBullet = new Bullet({
                ...bullet,
                position: getPositionInCamera(bullet.position),
            })
            frontendBullets.push(frontendBullet)
        })
    })

    animate()
})
