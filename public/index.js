const socket = io()
const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
var players
var id = socket.id

function join() {
    if (!Object.keys(players).includes(socket.id))
        socket.emit('addPlayer', { name: 'long' })
}

const Game = {
    renderBackground() {
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    },
    renderPlayers() {
        Object.keys(players).forEach((e) => {
            const player = players[e]
            const playerSize = 40 + player.point
            const fontSize = 15 + (player.point / 10) * 4

            ctx.beginPath()
            ctx.arc(
                player.position.x,
                player.position.y,
                playerSize,
                0,
                2 * Math.PI
            )
            ctx.fillStyle = player.color
            ctx.fill()

            ctx.font = `900 ${fontSize}px Arial`
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(player.name, player.position.x, player.position.y)
        })
    },
    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.renderBackground()
        this.renderPlayers()
    },
}

socket.on('updatePlayers', (backendPlayers) => {
    players = backendPlayers
    Game.render()
})
