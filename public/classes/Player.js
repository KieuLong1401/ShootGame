import { PLAYER_START_SIZE } from '../const.js'

class Player {
    constructor(player) {
        this.position = {
            x: player.position.x,
            y: player.position.y,
        }
        this.color = player.color
        this.point = player.point
        this.name = player.name
        this.mousePosition = player.mousePosition
    }

    render(ctx) {
        this.renderBody(ctx)
        this.renderGun(ctx)
        this.renderName(ctx)
    }
    renderBody(ctx) {
        this.size = PLAYER_START_SIZE + this.point / 10

        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderGun(ctx) {
        const gunWidth = 30
        const gunHeight = 20
        const gunRotateDegree = Math.atan2(
            this.mousePosition.y - this.position.y,
            this.mousePosition.x - this.position.x
        )

        ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y)
        ctx.rotate(gunRotateDegree)

        ctx.fillRect(this.size - 5, -gunHeight / 2, gunWidth, gunHeight)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    renderName(ctx) {
        const fontSize = 15 + (this.point / 100) * 4
        const spaceFromBodyToName = 15 + this.point / 100

        ctx.font = `900 ${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'

        ctx.strokeText(
            this.name,
            this.position.x,
            this.position.y + this.size + spaceFromBodyToName
        )
        ctx.fillText(
            this.name,
            this.position.x,
            this.position.y + this.size + spaceFromBodyToName
        )
    }
}

export default Player
