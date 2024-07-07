import { BULLET_HEIGHT, BULLET_WIDTH } from '../const.js'

class Bullet {
    constructor(bullet) {
        this.position = bullet.position
        this.rotateDegree = bullet.rotateDegree
        this.color = bullet.color
    }

    render(ctx) {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotateDegree)

        ctx.fillStyle = this.color
        ctx.fillRect(
            -BULLET_WIDTH / 2 + 60,
            -BULLET_HEIGHT / 2,
            BULLET_WIDTH,
            BULLET_HEIGHT
        )

        ctx.restore()
    }
}

export default Bullet
