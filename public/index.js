const socket = io();
var canvas
var ctx
var playerList
var id

function getCanvas() {
    canvas = document.querySelector('#canvas')
    ctx = canvas.getContext("2d");
}

const Game = {
    renderPlayers() {
        Object.keys(playerList).forEach(e => {
            const player = playerList[e]
            ctx.fillStyle = player.color
            ctx.fillRect(player.position.x, player.position.y, 50, 50)
        })
    }
}

socket.on('connect', () => {
    id = socket.id
})
socket.on('updatePlayers', (players) => {
    playerList = players
    Game.renderPlayers()
})

