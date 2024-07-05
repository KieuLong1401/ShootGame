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
    function getMousePositionInCanvas() {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.top
        const y = e.clientY - rect.left

        return {
            x,
            y,
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
    window.addEventListener('click', (e) => {
        const mousePosition = getMousePositionInCanvas
        socket.emit('shoot', mousePosition)
    })

    canvas.addEventListener('mousemove', (e) => {
        if (!frontendPlayers[id]) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.top
        const y = e.clientY - rect.left

        socket.emit('mousemove', getMousePositionInCanvas(e))
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
