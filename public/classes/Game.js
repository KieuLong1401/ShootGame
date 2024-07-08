import { GAME_SIZE } from '../const.js'

class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.basePosition = {
            x: GAME_SIZE / 2,
            y: GAME_SIZE / 2,
        }

        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    renderBackground() {
        let image = new Image()
        image.src = '../asset/background.jpg'
        this.ctx.drawImage(image, this.canvas.width / 2 - this.basePosition.x, this.canvas.height / 2 - this.basePosition.y, GAME_SIZE, GAME_SIZE)
    }
    render() {
        this.clearScreen()

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.renderBackground()

        this.ctx.strokeStyle = 'darkturquoise'
        this.ctx.lineWidth = 5
        this.ctx.strokeRect(
            this.canvas.width / 2 - this.basePosition.x,
            this.canvas.height / 2 - this.basePosition.y,
            GAME_SIZE,
            GAME_SIZE
        )
    }
}

export default Game
