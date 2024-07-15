import { PLAYER_SIZE } from '../const.js'

class Player {
    constructor(player) {
        this.position = player.position
        this.positionOnCamera = {
            x: player.positionOnCamera.x,
            y: player.positionOnCamera.y,
        }
        this.color = player.color
        this.kill = player.kill
        this.name = player.name
        this.gunRotateDegree = player.gunRotateDegree
        this.size = PLAYER_SIZE
        this.hp = player.hp
    }

    render(ctx, scale) {
        this.renderBody(ctx, scale)
        this.renderGun(ctx, scale)
        this.renderHP(ctx, scale)
        this.renderName(ctx, scale)
    }
    renderOnMap(ctx, ratio) {
        let size = this.size * ratio

        ctx.beginPath()
        ctx.arc(this.position.x * ratio, this.position.y * ratio, size , 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderBody(ctx, scale) {
        ctx.beginPath()
        ctx.arc(this.positionOnCamera.x, this.positionOnCamera.y, this.size * scale, 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderGun(ctx, scale) {
        const gunWidth = 30 * scale
        const gunHeight = 20 * scale

        ctx.setTransform(1, 0, 0, 1, this.positionOnCamera.x, this.positionOnCamera.y)
        ctx.rotate(this.gunRotateDegree)

        ctx.fillRect(this.size * scale - 5 * scale, -gunHeight / 2, gunWidth, gunHeight)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    renderHP(ctx, scale) {
        const hpWidth = 100 * scale
        const hpHeight = 10 * scale

        const spaceFromBodyToHpBar = 60 * scale

        ctx.fillStyle = 'gray'
        ctx.fillRect(this.positionOnCamera.x - hpWidth / 2, this.positionOnCamera.y - spaceFromBodyToHpBar, this.hp * scale, hpHeight)

        ctx.strokeStyle = 'white'
        ctx.lineWidth = 1
        ctx.strokeRect(this.positionOnCamera.x - hpWidth / 2, this.positionOnCamera.y - spaceFromBodyToHpBar, hpWidth, hpHeight)
        
    }
    renderName(ctx, scale) {
        const fontSize = 20 * scale
        const spaceFromBodyToName = 15 * scale

        ctx.font = `900 ${fontSize}px Arial`

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 4 * scale

        ctx.strokeText(
            this.name,
            this.positionOnCamera.x,
            this.positionOnCamera.y + this.size * scale + spaceFromBodyToName
        )
        ctx.fillText(
            this.name,
            this.positionOnCamera.x,
            this.positionOnCamera.y + this.size * scale + spaceFromBodyToName
        )
    }
}

export default Player
