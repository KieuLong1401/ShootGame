import Player from './classes/Player.js'
import Game from './classes/Game.js'
import Bullet from './classes/Bullet.js'
import { CAMERA_BASE_WIDTH, DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, GAME_SIZE, JOYSTICK_SIZE, KILL_ANNOUNCE_TIMEOUT, MAX_PLAYER } from './const.js'

const socket = io()

socket.on('connect', () => {
    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const errorText = document.querySelector('#errorText')
    const canvas = document.querySelector('#canvas')
    const announceContainer = document.querySelector('.announceContainer')
    const leaderBoardMain = document.querySelector('.main')
    const rotateDeviceAnnounce = document.querySelector('.rotateDeviceAnnounce')
    const loadingScreen = document.querySelector('.loading')
    
    loadingScreen.classList.add('hide')

    const myGame = new Game(canvas)
    
    var frontendPlayers = {}
    var frontendBullets = []
    
    var id = socket.id

    if(isTouchDevice()) {
        myGame.isMobile = true

        if(window.innerWidth < window.innerHeight) {
            rotateDeviceAnnounce.classList.remove('hide')
        } else {
            rotateDeviceAnnounce.classList.add('hide')
        }
    } else {
        myGame.isMobile = false

        rotateDeviceAnnounce.classList.add('hide')
    }


    function addKillAnnounce(killedPlayer, beKilledPlayer) {
        if(!frontendPlayers[id]) return

        let announce = document.createElement('div')
        announce.classList.add('announce')

        let announceKilledPlayer = document.createElement('div')
        announceKilledPlayer.classList.add('killedPlayer')
        announceKilledPlayer.innerText= killedPlayer.name
        announceKilledPlayer.style.color = killedPlayer.color

        let announceBeKilledPlayer = document.createElement('div')
        announceBeKilledPlayer.classList.add('beKilledPlayer')
        announceBeKilledPlayer.innerText = beKilledPlayer.name
        announceBeKilledPlayer.style.color = beKilledPlayer.color

        let gunIcon = getHtmlElementFromText('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528 56c0-13.3-10.7-24-24-24s-24 10.7-24 24v8H32C14.3 64 0 78.3 0 96V208c0 17.7 14.3 32 32 32H42c20.8 0 36.1 19.6 31 39.8L33 440.2c-2.4 9.6-.2 19.7 5.8 27.5S54.1 480 64 480h96c14.7 0 27.5-10 31-24.2L217 352H321.4c23.7 0 44.8-14.9 52.7-37.2L400.9 240H432c8.5 0 16.6-3.4 22.6-9.4L477.3 208H544c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32H528V56zM321.4 304H229l16-64h105l-21 58.7c-1.1 3.2-4.2 5.3-7.5 5.3zM80 128H464c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>')
        gunIcon.classList.add('gunIcon') 
        
        announce.insertAdjacentElement('beforeend', announceKilledPlayer)
        announce.insertAdjacentElement('beforeend', gunIcon)
        announce.insertAdjacentElement('beforeend', announceBeKilledPlayer)
        
        announceContainer.insertAdjacentElement('beforeend', announce)

        setTimeout(() => {
            announce.remove()
        }, KILL_ANNOUNCE_TIMEOUT)
    }

    function getHtmlElementFromText(text) {
        let div = document.createElement('div')
        div.innerHTML = text

        return div.firstChild
    }
    function getPositionInCamera(position) {
        return {
            x:
                (position.x -
                myGame.basePosition.x +
                myGame.canvas.width / 2),
            y:
                (position.y -
                myGame.basePosition.y +
                myGame.canvas.height / 2),
        }
    }
    function getDistance(positionA, positionB) {
        let distanceX = positionA.x - positionB.x;
        let distanceY = positionA.y - positionB.y;
    
        return Math.sqrt(distanceX ** 2 + distanceY ** 2)
    }
    function getDirection(angle) {
        const degree = (angle * 180 / Math.PI + 360) % 360

        if(degree >= 22.5 && degree < 67.5) {
            return ['down', 'right']
        } else if(degree >= 67.5 && degree < 122.5) {
            return ['down']
        } else if(degree >= 122.5 && degree < 157.5) {
            return ['down', 'left']
        } else if(degree >= 157.5 && degree < 202.5) {
            return ['left']
        } else if(degree >= 202.5 && degree < 247.5) {
            return ['up', 'left']
        } else if(degree >= 247.5 && degree < 292.5) {
            return ['up']
        } else if(degree >= 292.5 && degree < 337.5) {
            return ['up', 'right']
        } else {
            return ['right']
        }
    }

    function animate() {
        myGame.render(frontendPlayers, frontendBullets)
        updateLeaderBoard(frontendPlayers)

        if(!frontendPlayers[id]) return
        myGame.renderMap(frontendPlayers)
    }

    function updatePlayers(backendPlayers) {
        const frontendPlayerIds = Object.keys(frontendPlayers)
        const backendPlayerIds = Object.keys(backendPlayers)

        const myPlayer = backendPlayers[id]

        if (!!myPlayer) {
            myGame.basePosition = myPlayer.position

            menu.classList.add('hide')

            myGame.havePlayer = true
        } else {
            myGame.basePosition = {
                x: GAME_SIZE / 2,
                y: GAME_SIZE / 2,
            }
            
            menu.classList.remove('hide')

            myGame.havePlayer = false
        }

        frontendPlayerIds.forEach((playerId) => {
            if (!backendPlayerIds.includes(playerId)) {
                delete frontendPlayers[playerId]
            }
        })
        backendPlayerIds.forEach((playerId) => {
            let backendPlayer = backendPlayers[playerId]

            const player = new Player({
                ...backendPlayer,
                positionOnCamera: getPositionInCamera(backendPlayer.position),
                position: backendPlayer.position
            })
            frontendPlayers[playerId] = player
        })
    }
    function updateBullets(backendBullets) {
        frontendBullets = []

        backendBullets.forEach((bullet) => {
            const frontendBullet = new Bullet({
                ...bullet,
                position: getPositionInCamera(bullet.position),
            })
            frontendBullets.push(frontendBullet)
        })
    }
    function updateLeaderBoard(players) {
        let sortedPlayer = Object.keys(players).sort((idA, idB) => players[idB].kill - players[idA].kill )

        leaderBoardMain.innerHTML = null
        leaderBoardMain.style.border = 'none'
        
        sortedPlayer.forEach((playerId, playerRank) => {
            let player = players[playerId]
            
            let container = document.createElement('div')
            container.classList.add('player')
            if(playerId ==  id) {
                container.style.color = 'yellow'
            }
            
            let rank = document.createElement('span')
            rank.classList.add('rank')
            rank.innerText = `${playerRank + 1}. ${player.name}`
            
            let kill = document.createElement('span')
            kill.classList.add('kill')
            kill.innerText = player.kill.toString()
            
            container.insertAdjacentElement('beforeend', rank)
            container.insertAdjacentElement('beforeend', kill)
            
            leaderBoardMain.insertAdjacentElement('beforeend', container)
            leaderBoardMain.style.border = '1px darkturquoise solid'
        })
    }

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    joinBtn.addEventListener('click', () => {
        const playerIds = Object.keys(frontendPlayers)
        const name = document.querySelector('#nameInput').value
        
        if(playerIds.includes(id)) return
        if (playerIds.length >= MAX_PLAYER) {
            errorText.innerHTML = 'full slot'
            return
        } 
        if(name == '') {
            errorText.innerHTML = 'please enter your name'
            return
        }

        socket.emit('addPlayer', name)
    })

    window.addEventListener('keydown', (event) => {
        let key = event.key
        let code = event.code

        if (
            event.ctrlKey &&
            (key === '=' ||
                key === '-' ||
                key === '0' ||
                key === '+')
        ) {
            event.preventDefault()
        } else if(code == 'KeyW' || code == 'KeyA' || code == 'KeyS' || code == 'KeyD') {
            socket.emit('keydown', code)
        }
    })
    window.addEventListener('keyup', (event) => {
        socket.emit('keyup', event.code)
    })
    window.addEventListener('blur', () => {
        socket.emit('windowBlur')
    })
    window.addEventListener('click', () => {
        let player = frontendPlayers[id]

        if (!player) return

        socket.emit('shoot', player.gunRotateDegree)
    })
    window.addEventListener('resize', () => {
        let scaleRate = window.innerWidth / CAMERA_BASE_WIDTH
        myGame.scaleRate = scaleRate
        myGame.canvas.width = window.innerWidth
        myGame.canvas.height = window.innerHeight

        if(!isTouchDevice() && window.innerWidth < window.innerHeight) {
            rotateDeviceAnnounce.classList.remove('hide')
        } else if(!isTouchDevice() && window.innerWidth > window.innerHeight) {
            rotateDeviceAnnounce.classList.add('hide')
        }
    })

    document.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault()
            }
        },
        { passive: false }
    )
    document.addEventListener('contextmenu', event => event.preventDefault());

    myGame.canvas.addEventListener('mousemove', (event) => {
        let player = frontendPlayers[id]
        
        if (!player) return

        socket.emit(
            'mousemove',
            Math.atan2(
                event.clientY - player.positionOnCamera.y,
                event.clientX - player.positionOnCamera.x
            )
        )
    })

    myGame.canvas.addEventListener('touchstart', (event) => {
        event.preventDefault()

        if(event.touches) {
            const moveJoystickPosition = {
                x: DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, 
                y: myGame.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER
            }
            const shootJoystickPosition = {
                x: myGame.canvas.width - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, 
                y: myGame.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER
            }

            Array.from(event.touches).forEach(touch => {
                const touchPosition = {
                    x: touch.pageX,
                    y: touch.pageY
                }

                const touchDistanceFromMoveJoystick = getDistance(moveJoystickPosition, touchPosition)
                const touchDistanceFromShootJoystick = getDistance(shootJoystickPosition, touchPosition)

                if(touchDistanceFromMoveJoystick <= JOYSTICK_SIZE * 2) {
                    let directionDegree = Math.atan2(
                        touchPosition.y - moveJoystickPosition.y,
                        touchPosition.x - moveJoystickPosition.x
                    )


                    myGame.movementJoystick = {
                        touchId: touch.identifier,
                        directionDegree,
                        distance: touchDistanceFromMoveJoystick < JOYSTICK_SIZE ? touchDistanceFromMoveJoystick : JOYSTICK_SIZE
                    }

                    socket.emit('moveJoystickTrigger', getDirection(directionDegree))
                }
                
                if(touchDistanceFromShootJoystick <= JOYSTICK_SIZE * 2) {
                    myGame.shootJoystick = {
                        touchId: touch.identifier,
                        directionDegree: Math.atan2(
                            touchPosition.y - shootJoystickPosition.y,
                            touchPosition.x - shootJoystickPosition.x
                        ),
                        distance: touchDistanceFromShootJoystick < JOYSTICK_SIZE ? touchDistanceFromShootJoystick : JOYSTICK_SIZE
                    }
                    socket.emit('mousemove', myGame.shootJoystick.directionDegree)
                    socket.emit('shootJoystickTrigger')
                }
            })
        }
    })
    myGame.canvas.addEventListener('touchmove', (event) => {
        event.preventDefault()

        if(event.touches) {
            const moveJoystickPosition = {
                x: DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, 
                y: myGame.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER
            }
            const shootJoystickPosition = {
                x: myGame.canvas.width - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER, 
                y: myGame.canvas.height - DISTANCE_FROM_JOYSTICK_TO_DEVICE_BORDER
            }

            Array.from(event.touches).forEach(touch => {
                const touchPosition = {
                    x: touch.pageX,
                    y: touch.pageY
                }
                const touchDistanceFromMoveJoystick = getDistance(moveJoystickPosition, touchPosition)
                const touchDistanceFromShootJoystick = getDistance(shootJoystickPosition, touchPosition)

                let directionDegree = Math.atan2(
                    touchPosition.y - moveJoystickPosition.y,
                    touchPosition.x - moveJoystickPosition.x
                )

                if(touch.identifier == myGame.movementJoystick.touchId) {
                    myGame.movementJoystick = {
                        touchId: myGame.movementJoystick.touchId,
                        directionDegree,
                        distance: touchDistanceFromMoveJoystick < JOYSTICK_SIZE ? touchDistanceFromMoveJoystick : JOYSTICK_SIZE
                    }
                    socket.emit('moveJoystickTrigger', getDirection(directionDegree))

                }
                
                if(touch.identifier == myGame.shootJoystick.touchId) {
                    myGame.shootJoystick = {
                        touchId: myGame.shootJoystick.touchId,
                        directionDegree: Math.atan2(
                            touchPosition.y - shootJoystickPosition.y,
                            touchPosition.x - shootJoystickPosition.x
                        ),
                        distance: touchDistanceFromShootJoystick < JOYSTICK_SIZE ? touchDistanceFromShootJoystick : JOYSTICK_SIZE
                    }
                    socket.emit('mousemove', myGame.shootJoystick.directionDegree)
                }
            })
        }
    })
    myGame.canvas.addEventListener('touchend', (event) => {
        event.preventDefault()

        Array.from(event.changedTouches).forEach(touch => {
            if(touch.identifier == myGame.movementJoystick.touchId) {
                myGame.movementJoystick = {
                    touchId: null,
                    directionDegree: 0,
                    distance: 0
                }
                socket.emit('moveJoystickUnTrigger')
            }
            if(touch.identifier == myGame.shootJoystick.touchId) {
                myGame.shootJoystick = {
                    touchId: null,
                    directionDegree: 0,
                    distance: 0
                }
                socket.emit('shootJoystickUnTrigger')
            }
        })
    })


    socket.on('updateData', ({backendPlayers, backendBullets}) => {
        updatePlayers(backendPlayers)
        updateBullets(backendBullets)
        animate()
    })
    socket.on('kill', ({killedPlayer, beKilledPlayer}) => {
        addKillAnnounce(killedPlayer, beKilledPlayer)
    })
})
