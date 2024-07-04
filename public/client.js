import Player from './classes/Player.js'
import Game from './classes/Game.js'

const socket = io()
var id = socket.id


const menu = document.querySelector('#menu')
const joinBtn = document.querySelector('#joinBtn')
const canvas = document.querySelector('#canvas')

const myGame = new Game(canvas)

var frontendPlayers = {}
var moves = new Set()


if(Object.keys(frontendPlayers).includes(id)) {
    menu.classList.add('hide')
}


function addPlayer() {
    if (!Object.keys(frontendPlayers).includes(socket.id)) {
        socket.emit('addPlayer', { name: 'long' })
        menu.classList.add('hide')
    }
}


joinBtn.addEventListener('click', addPlayer)

window.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyW':
            if(!moves.has('down')) moves.add('up')
            break
        case 'KeyA':
            if(!moves.has('right')) moves.add('left')
            break
        case 'KeyD':
            if(!moves.has('left')) moves.add('right')
            break
        case 'KeyS':
            if(!moves.has('up')) moves.add('down')
            break
    }
})
window.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyW':
            moves.delete('up')
            break
        case 'KeyA':
            moves.delete('left')
            break
        case 'KeyD':
            moves.delete('right')
            break
        case 'KeyS':
            moves.delete('down')
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

myGame.render(frontendPlayers)
