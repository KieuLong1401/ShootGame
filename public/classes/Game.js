class Game {
    animationId

    constructor(canvas) {
        var devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = innerWidth * devicePixelRatio
        canvas.height = innerHeight * devicePixelRatio

        this.ctx = canvas.getContext('2d')
        this.canvasWidth = canvas.width
        this.canvasHeight = canvas.height

        this.render = this.render.bind(this)
    }

    renderBackground() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    }
    renderPlayers(frontendPlayers) {
        Object.keys(frontendPlayers).forEach((e) => {
            const player = frontendPlayers[e]
            player.render(this.ctx)
        })
    }
    render(frontendPlayers) {
        this.animationId = requestAnimationFrame(() => this.render(frontendPlayers))
    
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.renderBackground()
        this.renderPlayers(frontendPlayers)
    }
}

export default Game