import Player from './classes/Player.js'
import Game from './classes/Game.js'
import Bullet from './classes/Bullet.js'
import { CAMERA_BASE_WIDTH, GAME_SIZE, KILL_ANNOUNCE_TIMEOUT, MAX_PLAYER } from './const.js'

const socket = io()


socket.on('connect', () => {
    const menu = document.querySelector('#menu')
    const joinBtn = document.querySelector('#joinBtn')
    const errorText = document.querySelector('#errorText')
    const canvas = document.querySelector('#canvas')
    const announceContainer = document.querySelector('.announceContainer')
    const myGame = new Game(canvas)

    var frontendPlayers = {}
    var frontendBullets = []

    var id = socket.id

    function addKillAnnounce(killedPlayer, beKilledPlayer) {
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

    function animate() { 
        myGame.render(frontendPlayers, frontendBullets)
    }

    function updatePlayers(backendPlayers) {
        const frontendPlayerIds = Object.keys(frontendPlayers)
        const backendPlayerIds = Object.keys(backendPlayers)

        const myPlayer = backendPlayers[id]

        if (!!myPlayer) {
            myGame.basePosition = myPlayer.position

            menu.classList.add('hide')
        } else {
            myGame.basePosition = {
                x: GAME_SIZE / 2,
                y: GAME_SIZE / 2,
            }

            menu.classList.remove('hide')
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
    })

    document.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault()
            }
        },
        { passive: false }
    )

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


    socket.on('updateData', ({backendPlayers, backendBullets}) => {
        updatePlayers(backendPlayers)
        updateBullets(backendBullets)
        animate()
    })
    socket.on('kill', ({killedPlayer, beKilledPlayer}) => {
        addKillAnnounce(killedPlayer, beKilledPlayer)
    })
})
