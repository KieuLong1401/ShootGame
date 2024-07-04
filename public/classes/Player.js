class Player {
    constructor(player) {
        this.position = {
            x: player.position.x * window.devicePixelRatio,
            y: player.position.y * window.devicePixelRatio,
        }
        this.color = player.color
        this.point = player.point
        this.name = player.name
    }

    render(ctx) {
        this.renderBody(ctx)
        this.renderName(ctx)
    }
    renderBody(ctx) {
        this.playerSize = (40 + this.point) * window.devicePixelRatio

        ctx.beginPath()
        ctx.arc(
            this.position.x,
            this.position.y,
            this.playerSize,
            0,
            2 * Math.PI
        )
        ctx.fillStyle = this.color
        ctx.fill()
    }
    renderName(ctx) {
        const fontSize = (15 + (this.point / 10) * 4) * window.devicePixelRatio
        const spaceFromBodyToName = 15 * window.devicePixelRatio

        ctx.font = `900 ${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.fillText(this.name, this.position.x, this.position.y + this.playerSize + spaceFromBodyToName)
    }
    move(moves) {
        moves.forEach(e => {
            switch(e) {
                case '':
                    this.position. += 5
                    break
                case '':
                    this.position. += 5
                    break
                case '':
                    this.position. += 5
                    break
                case '':
                    this.position. += 5
                    break
            }
        })
    }
}

export default Player