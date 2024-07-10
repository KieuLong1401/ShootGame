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
            x: this.basePosition.x - this.canvas.width / 2,
            y: this.basePosition.y - this.canvas.height / 2
        }

        const startCol = Math.ceil(cameraPosition.x / colSpacing)
        const startRow = Math.ceil(cameraPosition.y / rowSpacing)
        const endCol = Math.ceil((cameraPosition.x + this.canvas.width) / colSpacing) + 1;
        const endRow = Math.ceil((cameraPosition.y + this.canvas.height ) / (rowSpacing * 2)) + 1;

        const initialX = this.canvas.width / 2 - this.basePosition.x
        const initialY = this.canvas.height / 2 - this.basePosition.y

        let polygonPosition = {
            x: initialX,
            y: initialY,
        }

        for (var rowIndex = startRow; rowIndex < endRow; rowIndex++) {
            for (var colIndex = startCol; colIndex < endCol; colIndex++) {
                polygonPosition.x = initialX + colSpacing * colIndex
                polygonPosition.y = initialY + rowIndex * rowSpacing * 2 - (colIndex % 2) * rowSpacing
                
                this.drawPolygon(polygonPosition, polygonAngle)
            }
        }
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
