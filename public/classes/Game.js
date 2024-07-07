import { CAMERA_HEIGHT, CAMERA_WIDTH, GAME_SIZE } from '../const.js'

class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.playerPosition = {
            x: GAME_SIZE / 2,
            y: GAME_SIZE / 2,
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.ctx.strokeStyle = 'white'
        this.ctx.strokeRect(
            this.canvas.width / 2 - this.playerPosition.x,
            this.canvas.height / 2 - this.playerPosition.y,
            GAME_SIZE,
            GAME_SIZE
        )
    }
}

export default Game
