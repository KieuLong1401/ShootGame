import { GAME_SIZE, POLYGONAL_TYPE, POLYGON_RADIUS } from '../const.js'

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
        this.ctx.stroke();
    }
    renderPolygonGridBackground(width, height) {
        const polygonAngle = 2 * Math.PI / POLYGONAL_TYPE;
        const rowSpacing = (POLYGON_RADIUS * Math.sin(polygonAngle));
        const colSpacing = POLYGON_RADIUS * (1 + Math.cos(polygonAngle));
        const numRows = Math.ceil(height / rowSpacing) + 1;
        const numCols = Math.ceil(width / colSpacing) + 1;
        const polygonWidth = POLYGON_RADIUS * 2
        
        let polygonPosition = {
            x: -this.basePosition.x,
            y: -this.basePosition.y,
        }

        // while(polygonPosition.y + rowSpacing < height + polygonWidth) {
        //     polygonPosition.x = -this.basePosition.x
        //     for (let polygonIndex = 0; polygonPosition.x + colSpacing < width + polygonWidth; polygonIndex++) {
        //         this.drawPolygon(polygonPosition, polygonAngle)
                
        //         polygonPosition.x += colSpacing
        //         polygonPosition.y += (-1) ** polygonIndex * rowSpacing
        //     }
            
        //     polygonPosition.y += rowSpacing * 2
        // }
  

        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            polygonPosition.x = -this.basePosition.x
            for (let polygonIndex = 0; polygonPosition.x + colSpacing < width + polygonWidth; polygonIndex++) {
                this.drawPolygon(polygonPosition, polygonAngle)
                
                polygonPosition.x += colSpacing
                polygonPosition.y += (-1) ** polygonIndex * rowSpacing
            }
            
            polygonPosition.y += rowSpacing * 2
        }
    }
    render() {
        this.clearScreen()

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.renderPolygonGridBackground(this.canvas.width, this.canvas.height)

        // this.drawPolygon({
        //     x: this.basePosition.x,
        //     y: this.basePosition.y,
        // }, 2 * Math.PI / POLYGONAL_TYPE)
        // this.drawPolygon({
        //     x: this.basePosition.x,
        //     y: this.basePosition.y + POLYGON_RADIUS * Math.sin(2 * Math.PI / POLYGONAL_TYPE) * 2,
        // }, 2 * Math.PI / POLYGONAL_TYPE)

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
