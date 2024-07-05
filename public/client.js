import Player from './classes/Player.js'
import Game from './classes/Game.js'

const socket = io()
socket.on('connect', () => {
    var id = socket.id

    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const canvas = document.querySelector('#canvas')

    const myGame = new Game(canvas)

    var frontendPlayers = {}
    var animationId

    function addPlayer() {
        if (!Object.keys(frontendPlayers).includes(id)) {
            socket.emit('addPlayer', 'long')
            menu.classList.add('hide')
        }
    }
    function renderPlayers() {
        Object.keys(frontendPlayers).forEach((e) => {
            const player = frontendPlayers[e]
            player.render(myGame.ctx)
        })
    }
    function animate() {
        animationId = requestAnimationFrame(animate)

        myGame.render()
        renderPlayers()
    }
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect()
        var mouseX = e.clientX - rect.top
        var mouseY = e.clientY - rect.left
        return {
            x: mouseX,
            y: mouseY,
        }
    }

    joinBtn.addEventListener('click', addPlayer)

    window.addEventListener('keydown', (event) => {
        socket.emit('keydown', event.code)
    })
    window.addEventListener('keyup', (event) => {
        socket.emit('keyup', event.code)
    })
    window.addEventListener('blur', () => {
        socket.emit('windowBlur')
    })

    canvas.addEventListener('mousemove', (e) => {
        if (!frontendPlayers[id]) return
        const mousePosition = getMousePos(canvas, e)
        const rotation = Math.atan2(
            mousePosition.y - frontendPlayers[id].position.y,
            mousePosition.x - frontendPlayers[id].position.x
        )
        socket.emit('changeGunRotateDegree', rotation)
    })

    socket.on('updatePlayers', (backendPlayers) => {
        const frontendPlayerIds = Object.keys(frontendPlayers)
        const backendPlayerIds = Object.keys(backendPlayers)

        frontendPlayerIds.forEach((e) => {
            if (!backendPlayerIds.includes(e)) {
                delete frontendPlayers[e]
            }
        })
        backendPlayerIds.forEach((e) => {
            const player = new Player(backendPlayers[e])
            frontendPlayers[e] = player
        })
    })

    animate()
})
