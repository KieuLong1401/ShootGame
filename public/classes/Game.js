import { CAMERA_WIDTH, DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, GAME_SIZE, JOYSTICK_SIZE, MINI_MAP_RATIO, POLYGONAL_TYPE, POLYGON_RADIUS } from '../const.js'

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
        this.movementJoystick = {
            touchId: null,
            directionDegree: 0,
            distance: 0
        }
        this.shootJoystick = {
            touchId: null,
            directionDegree: 0,
            distance: 0
        }
        this.isMobile = false
        this.havePlayer = false
        this.scale = window.innerWidth / CAMERA_WIDTH
    }

    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    renderBackgroundColor() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawPolygon(position, polygonAngle) {
        this.ctx.beginPath();
        
        for (let pointIndex = 0; pointIndex < POLYGONAL_TYPE; pointIndex++) {
            let angleCos = Math.cos(polygonAngle * pointIndex)
            let angleSin = Math.sin(polygonAngle * pointIndex)
            
            let pointPosition = {
                x: (position.x + POLYGON_RADIUS * this.scale * angleCos),
                y: (position.y + POLYGON_RADIUS * this.scale * angleSin)
            }
            
            this.ctx.lineTo(pointPosition.x, pointPosition.y);
        }
        
        this.ctx.closePath();
        this.ctx.strokeStyle = 'gray'
        this.ctx.lineWidth = 10 * this.scale
        this.ctx.stroke();
    }
    renderPolygonGridBackground() {
        const polygonAngle = 2 * Math.PI / POLYGONAL_TYPE;

        const rowSpacing = POLYGON_RADIUS * this.scale * Math.sin(polygonAngle);
        const colSpacing = POLYGON_RADIUS * this.scale * (1 + Math.cos(polygonAngle));

        const cameraPosition = {
            x: this.basePosition.x - this.canvas.width / this.scale / 2,
            y: this.basePosition.y - this.canvas.height / this.scale / 2
        }

        const startCol = Math.ceil(cameraPosition.x / (colSpacing / this.scale)) - 1 
        const startRow = Math.ceil(cameraPosition.y / (rowSpacing / this.scale) / 2) - 1
        const endCol = Math.ceil((cameraPosition.x + this.canvas.width / this.scale) / (colSpacing / this.scale)) + 1;
        const endRow = Math.ceil((cameraPosition.y + this.canvas.height / this.scale) / ((rowSpacing / this.scale) * 2)) + 1;

        const initialX = (0 - this.basePosition.x) * this.scale + this.canvas.width / 2
        const initialY = (0 - this.basePosition.y) * this.scale + this.canvas.height / 2

        let polygonPosition = {
            x: initialX,
            y: initialY,
        }

        for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
            for (let colIndex = startCol; colIndex < endCol; colIndex++) {
                polygonPosition.x = initialX + (colIndex * colSpacing)
                polygonPosition.y = initialY + (rowIndex * rowSpacing * 2) - (Math.abs(colIndex % 2) * rowSpacing)
                
                this.drawPolygon(polygonPosition, polygonAngle) 
            }
        }
    }

    renderPlayers(players) {
        Object.keys(players).forEach((id) => {
            const player = players[id]
            player.render(this.ctx, this.scale)
        })
    }
    renderBullets(bullets) {
        bullets.forEach((bullet) => {
            bullet.render(this.ctx, this.scale)
        })
    }

    renderGameBorder() {
        this.ctx.strokeStyle = 'darkturquoise'
        this.ctx.lineWidth = 10 * this.scale
        this.ctx.strokeRect(
            (0 - this.basePosition.x) * this.scale + this.canvas.width / 2,
            (0 - this.basePosition.y) * this.scale + this.canvas.height / 2,
            GAME_SIZE * this.scale,
            GAME_SIZE * this.scale
        )
    }
    renderMap(players) {
        let mapSize = this.canvas.height * MINI_MAP_RATIO
        let mapRatio = mapSize / GAME_SIZE

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
        this.ctx.fillRect(0, 0, mapSize, mapSize)

        Object.keys(players).forEach((id) => {
            const player = players[id]
            player.renderOnMap(this.ctx, mapRatio)
        })

        this.ctx.strokeStyle = 'darkturquoise'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(0, 0, mapSize, mapSize)
    }

    renderMovementJoystick() {
        this.ctx.beginPath()
        this.ctx.arc(DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, this.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, JOYSTICK_SIZE , 0, 2 * Math.PI)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.arc(DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER + Math.cos(this.movementJoystick.directionDegree) * this.movementJoystick.distance, this.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER + Math.sin(this.movementJoystick.directionDegree) * this.movementJoystick.distance, JOYSTICK_SIZE / 2 , 0, 2 * Math.PI)
        this.ctx.fillStyle = 'black'
        this.ctx.fill()
    }
    renderShootJoystick() {
        this.ctx.beginPath()
        this.ctx.arc(this.canvas.width - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, this.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, JOYSTICK_SIZE , 0, 2 * Math.PI)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.arc(this.canvas.width - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER + Math.cos(this.shootJoystick.directionDegree) * this.shootJoystick.distance, this.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER + Math.sin(this.shootJoystick.directionDegree) * this.shootJoystick.distance, JOYSTICK_SIZE / 2 , 0, 2 * Math.PI)
        this.ctx.fillStyle = 'black'
        this.ctx.fill()
    }

    render(players, bullets) {
        this.clearScreen()
        this.renderBackgroundColor()

        this.renderPolygonGridBackground()
        this.renderPlayers(players)
        this.renderBullets(bullets)
        this.renderGameBorder()

        if(this.isMobile && this.havePlayer) {
            this.renderMovementJoystick()
            this.renderShootJoystick()
        }
    }
}

export default Game
