import { CAMERA_BASE_WIDTH, GAME_SIZE, POLYGONAL_TYPE, POLYGON_RADIUS } from '../const.js'

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
        this.scaleRate = (window.innerWidth + window.innerHeight) / CAMERA_BASE_WIDTH
    }

    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    drawPolygon(position, polygonAngle) {
        this.ctx.beginPath();
        
        for (let pointIndex = 0; pointIndex < POLYGONAL_TYPE; pointIndex++) {
            let angleCos = Math.cos(polygonAngle * pointIndex)
            let angleSin = Math.sin(polygonAngle * pointIndex)
            
            let pointPosition = {
                x: position.x + POLYGON_RADIUS * angleCos,
                y: position.y + POLYGON_RADIUS * angleSin
            }
            
            this.ctx.lineTo(pointPosition.x, pointPosition.y);
        }
        
        this.ctx.closePath();
        this.ctx.strokeStyle = 'gray'
        this.ctx.lineWidth = 10
        this.ctx.stroke();
    }
    renderPolygonGridBackground() {
        const polygonAngle = 2 * Math.PI / POLYGONAL_TYPE;
        const rowSpacing = (POLYGON_RADIUS * Math.sin(polygonAngle));
        const colSpacing = POLYGON_RADIUS * (1 + Math.cos(polygonAngle));

        const cameraPosition = {
            x: this.canvas.width / 2 - this.basePosition.x,
            y: this.canvas.height / 2 - this.basePosition.y
        }

        const endRow = Math.ceil((this.basePosition.y + this.canvas.height) / (rowSpacing * 2)) + 1;
        const endCol = Math.ceil((this.basePosition.x + this.canvas.width) / colSpacing) + 1;
        const startCol = Math.ceil((0 - cameraPosition.x) / colSpacing)
        const startRow = Math.ceil((0 - cameraPosition.y) / rowSpacing)

        let polygonPosition = {
            x: -this.basePosition.x,
            y: -this.basePosition.y,
        }

        for (var rowIndex = startRow; rowIndex < endRow; rowIndex++) {
            polygonPosition.x = -this.basePosition.x
            
            for (var colIndex = startCol; colIndex < endCol; colIndex++) {
                this.drawPolygon(polygonPosition, polygonAngle)
                
                polygonPosition.x = -this.basePosition.x + colSpacing * (colIndex + 1)
                polygonPosition.y += (-1) ** colIndex * rowSpacing
            }
            
            polygonPosition.y = -this.basePosition.y + rowIndex * rowSpacing * 2
        }
        // console.log((-1) ** 3 * rowSpacing, -(3 % 2) * rowSpacing)
    }

    render() {
        this.clearScreen()

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.renderPolygonGridBackground()

        this.ctx.strokeStyle = 'darkturquoise'
        this.ctx.lineWidth = 10
        this.ctx.strokeRect(
            this.canvas.width / 2 - this.basePosition.x,
            this.canvas.height / 2 - this.basePosition.y,
            GAME_SIZE,
            GAME_SIZE
        )
    }
}

export default Game
