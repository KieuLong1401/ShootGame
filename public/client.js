import Player from './classes/Player.js'
import Game from './classes/Game.js'
import Bullet from './classes/Bullet.js'
import { GAME_SIZE, MAX_PLAYER } from './const.js'

const socket = io()
socket.on('connect', () => {
    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const canvas = document.querySelector('#canvas')
    const errorText = document.querySelector('#errorText')

    const myGame = new Game(canvas)

    var frontendPlayers = {}
    var frontendBullets = []

    var id = socket.id

    function getPositionInCamera(position) {
        return {
            x:
                position.x -
                myGame.basePosition.x +
                myGame.canvas.width / 2,
            y:
                position.y -
                myGame.basePosition.y +
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
        frontendBullets.forEach((bullet) => {
            bullet.render(myGame.ctx)
        })
    }
    function animate() { 
        myGame.render()
        renderBullets()
        renderPlayers()
    }

    function updatePlayers(backendPlayers) {
        const frontendPlayerIds = Object.keys(frontendPlayers)
        const backendPlayerIds = Object.keys(backendPlayers)

        const myPlayer = backendPlayers[id]

        if (!!myPlayer) {
            myGame.basePosition = myPlayer.position

            menu.classList.add('hide')
        } else {
            myGame.basePosition = {
                x: GAME_SIZE / 2,
                y: GAME_SIZE / 2,
            }

            menu.classList.remove('hide')
        }

        frontendPlayerIds.forEach((playerId) => {
            if (!backendPlayerIds.includes(playerId)) {
                delete frontendPlayers[playerId]
            }
        })
        backendPlayerIds.forEach((playerId) => {
            let backendPlayer = backendPlayers[playerId]

            const player = new Player({
                ...backendPlayer,
                position: getPositionInCamera(backendPlayer.position),
            })
            frontendPlayers[playerId] = player
        })
    }
    function updateBullets(backendBullets) {
        frontendBullets = []

        backendBullets.forEach((bullet) => {
            const frontendBullet = new Bullet({
                ...bullet,
                position: getPositionInCamera(bullet.position),
            })
            frontendBullets.push(frontendBullet)
        })
    }

    joinBtn.addEventListener('click', () => {
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
    })

    window.addEventListener('keydown', (event) => {
        let key = event.key
        let code = event.code

        if (
            event.ctrlKey &&
            (key === '=' ||
                key === '-' ||
                key === '0' ||
                key === '+')
        ) {
            event.preventDefault()
        } else if(code == 'KeyW' || code == 'KeyA' || code == 'KeyS' || code == 'KeyD') {
            socket.emit('keydown', code)
        }
    })
    window.addEventListener('keyup', (event) => {
        socket.emit('keyup', event.code)
    })
    window.addEventListener('blur', () => {
        socket.emit('windowBlur')
    })
    window.addEventListener('click', () => {
        let player = frontendPlayers[id]

        if (!player) return

        socket.emit('shoot', player.gunRotateDegree)
    })
    window.addEventListener('resize', () => {
        myGame.canvas.width = window.innerWidth
        myGame.canvas.height = window.innerHeight
    })

    document.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault()
            }
        },
        { passive: false }
    )

    myGame.canvas.addEventListener('mousemove', (event) => {
        let player = frontendPlayers[id]
        
        if (!player) return

        socket.emit(
            'mousemove',
            Math.atan2(
                event.clientY - player.position.y,
                event.clientX - player.position.x
            )
        )
    })


    socket.on('updateData', ({backendPlayers, backendBullets}) => {
        updatePlayers(backendPlayers)
        updateBullets(backendBullets)
        animate()
    })
})
