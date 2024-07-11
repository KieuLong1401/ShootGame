import { GAME_SIZE, MINI_MAP_SIZE, PLAYER_SIZE } from '../const.js'

class Player {
    constructor(player) {
        this.position = player.position
        this.positionOnCamera = {
            x: player.positionOnCamera.x,
            y: player.positionOnCamera.y,
        }
        this.color = player.color
        this.point = player.point
        this.name = player.name
        this.gunRotateDegree = player.gunRotateDegree
        this.size = PLAYER_SIZE
    }

    render(ctx) {
        this.renderBody(ctx)
        this.renderGun(ctx)
        this.renderName(ctx)
    }
    renderOnMap(ctx) {
        let mapRatio = MINI_MAP_SIZE / GAME_SIZE
        let size = this.size * mapRatio

        ctx.beginPath()
        ctx.arc(ctx.canvas.width - MINI_MAP_SIZE + this.position.x * mapRatio, ctx.canvas.height - MINI_MAP_SIZE + this.position.y * mapRatio, size , 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderBody(ctx) {
        ctx.beginPath()
        ctx.arc(this.positionOnCamera.x, this.positionOnCamera.y, this.size , 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderGun(ctx) {
        const gunWidth = 30
        const gunHeight = 20

        ctx.setTransform(1, 0, 0, 1, this.positionOnCamera.x, this.positionOnCamera.y)
        ctx.rotate(this.gunRotateDegree)

        ctx.fillRect(this.size - 5, -gunHeight / 2, gunWidth, gunHeight)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    renderName(ctx) {
        const fontSize = 20 + (this.point / 100) * 4
        const spaceFromBodyToName = 15 + this.point / 100

        ctx.font = `900 ${fontSize}px Arial`

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 4

        ctx.strokeText(
            this.name,
            this.positionOnCamera.x,
            this.positionOnCamera.y + this.size + spaceFromBodyToName
        )
        ctx.fillText(
            this.name,
            this.positionOnCamera.x,
            this.positionOnCamera.y + this.size + spaceFromBodyToName
        )
    }
}

export default Player
