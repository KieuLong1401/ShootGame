import Player from './classes/Player.js'
import Game from './classes/Game.js'

const socket = io()
socket.on('connect', () => {
    var id = socket.id
    console.log(id)
    
    
    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const canvas = document.querySelector('#canvas')
    
    const myGame = new Game(canvas)
    
    var frontendPlayers = {}
    var directions = new Set()
    var animationId
    
    
    if(Object.keys(frontendPlayers).includes(id)) {
        menu.classList.add('hide')
    }
    
    
    function addPlayer() {
        if (!Object.keys(frontendPlayers).includes(socket.id)) {
            socket.emit('addPlayer', 'long')
            menu.classList.add('hide')
        }
    }
    function updatePlayerPosition() {
        const myCharacter = frontendPlayers[id]

        const isDiagonalDirection = directions.size == 2
        const speed = isDiagonalDirection ? Math.sqrt(Math.max(5, 10 - Math.floor(this.point / 500)))/2 : Math.max(5, 10 - Math.floor(this.point / 500))
        const nextPosition = {
            x: this.position.x,
            y: this.position.y
        }

        directions.forEach(direction => {
            switch(direction) {
                case 'up':
                    nextPosition.y -= speed
                    break
                case 'left':
                    nextPosition.x -= speed
                    break
                case 'right':
                    nextPosition.x += speed
                    break
                case 'down':
                    nextPosition.y += speed
                    break
            } 
        })

        socket.emit('updatePlayer', {
            ...myCharacter,
            position: nextPosition
        })
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
        updatePlayerPosition()
    }
    
    
    joinBtn.addEventListener('click', addPlayer)
    
    window.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'KeyW':
                if(!directions.has('down')) directions.add('up')
                break
            case 'KeyA':
                if(!directions.has('right')) directions.add('left')
                break
            case 'KeyD':
                if(!directions.has('left')) directions.add('right')
                break
            case 'KeyS':
                if(!directions.has('up')) directions.add('down')
                break
        }
    })
    window.addEventListener('keyup', (event) => {
        switch(event.code) {
            case 'KeyW':
                directions.delete('up')
                break
            case 'KeyA':
                directions.delete('left')
                break
            case 'KeyD':
                directions.delete('right')
                break
            case 'KeyS':
                directions.delete('down')
                break
        }
    })
    
    
    
    socket.on('updatePlayers', (backendPlayers) => {
        const frontendPlayerIds = Object.keys(frontendPlayers)
        const backendPlayerIds = Object.keys(backendPlayers)
    
        frontendPlayerIds.forEach(e => {
            if(!backendPlayerIds.includes(e)) {
                delete frontendPlayers[e]
            }
        })
        backendPlayerIds.forEach(e => {
            const player = new Player(backendPlayers[e])
            frontendPlayers[e] = player
        })
    })
    
    animate()
})

