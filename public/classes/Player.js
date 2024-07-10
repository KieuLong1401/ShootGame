import { PLAYER_SIZE } from '../const.js'

class Player {
    constructor(player) {
        this.position = {
            x: player.position.x,
            y: player.position.y,
        }
        this.color = player.color
        this.point = player.point
        this.name = player.name
        this.gunRotateDegree = player.gunRotateDegree
        this.size = PLAYER_SIZE + this.point / 10
    }

    render(ctx) {
        this.renderBody(ctx)
        this.renderGun(ctx)
        this.renderName(ctx)
    }
    renderBody(ctx) {
        this.size = PLAYER_SIZE 

        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size , 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderGun(ctx) {
        const gunWidth = 30
        const gunHeight = 20

        ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y)
        ctx.rotate(this.gunRotateDegree)

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
