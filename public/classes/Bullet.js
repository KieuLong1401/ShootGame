import { BULLET_HEIGHT, BULLET_WIDTH, PLAYER_SIZE } from '../const.js'

class Bullet {
    constructor(bullet) {
        this.position = bullet.position
        this.rotateDegree = bullet.rotateDegree
        this.color = bullet.color
    }

    render(ctx, scale) {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotateDegree)

        ctx.fillStyle = this.color
        ctx.fillRect(
            -BULLET_WIDTH * scale / 2 + 60 * scale,
            -BULLET_HEIGHT * scale / 2,
            BULLET_WIDTH * scale,
            BULLET_HEIGHT * scale
        )

        ctx.restore()
    }
}

export default Bullet
