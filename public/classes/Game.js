class Game {
    constructor(canvas) {
        var devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = innerWidth * devicePixelRatio
        canvas.height = innerHeight * devicePixelRatio

        this.ctx = canvas.getContext('2d')
        this.canvasWidth = canvas.width
        this.canvasHeight = canvas.height

        this.render = this.render.bind(this)
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    }
}

export default Game