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

    render(ctx) {
        this.renderBody(ctx)
        this.renderGun(ctx)
        this.renderHP(ctx)
        this.renderName(ctx)
    }
    renderOnMap(ctx, ratio) {
        let size = this.size * ratio

        ctx.beginPath()
        ctx.arc(this.position.x * ratio, this.position.y * ratio, size , 0, 2 * Math.PI)
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
    renderHP(ctx) {
        ctx.fillStyle = 'gray'
        ctx.fillRect(this.positionOnCamera.x - 100 / 2, this.positionOnCamera.y - 60, this.hp, 10)
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 1
        ctx.strokeRect(this.positionOnCamera.x - 100 / 2, this.positionOnCamera.y - 60, 100, 10)
        
    }
    renderName(ctx) {
        const fontSize = 20 
        const spaceFromBodyToName = 15 

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
