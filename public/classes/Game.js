import { GAME_MAX_SIZE } from '../const.js'

class Game {
    constructor(canvas) {
        canvas.width = innerWidth
        canvas.height = innerHeight

        this.ctx = canvas.getContext('2d')
        this.canvasWidth = canvas.width
        this.canvasHeight = canvas.height

        this.render = this.render.bind(this)
    }

    render() {
        this.ctx.clearRect(0, 0, GAME_MAX_SIZE, GAME_MAX_SIZE)

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

        this.ctx.strokeStyle = 'white'
        this.ctx.strokeRect(0, 0, GAME_MAX_SIZE, GAME_MAX_SIZE)
    }
}

export default Game
