require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').createServer(app)

const socket = require('socket.io')
const io = socket(server, {
  cors: { origin: '*' }
})

const crypto = require("crypto")
const cors = require('cors')

// middleware
app.use(cors())

const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const Game = require('./Models/Game')
const allData = require( './constants/data.json')
mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Successfully connected to database')
)

const path = require('path')

app.use('/', express.static(path.join(__dirname, 'out')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './out/index.html'))
})
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, './out/about.html'))
})
app.get('/online', (req, res) => {
  res.sendFile(path.join(__dirname, './out/online.html'))
})
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './out/404.html'))
})

io.on('connection', async (socket) => {
  var gameTime = null
  socket.on('progress', async ({ percent, gameID }) => {
    try {
      let game = await Game.findById(gameID)
      if (game.isStarted) {
        const player = game.players.find(player => player.socketID === socket.id)
        // console.log('progress', player.name, 'is at', percent)
        for (const index in game.players) {
          if (game.players[index]._id == player._id) {
            if (percent < 100) { // unfinished and verify that there was a change
              if (game.players[index].percent !== percent) {
                // console.log('progress change game state =', game)
                // console.log('progress for', player.name, game.players[index].percent, '->', percent)
                game.players[index].percent = percent
                game = await game.save() // too many calls to perform a save every progress
                io.to(gameID).emit('updateGame', game)
              }
            } else {
              // get timestamp of when the user finished
              let endTime = new Date().getTime()
              // get timestamp of when the game started
              let { startTime } = game
              // calculate Words Per Minute
              game.players[index].WPM = calculateWPM(endTime, startTime, player, game.words)
              game.players[index].percent = 100

              // if no one is winner set winner
              let existsWinner = false
              for (const player of game.players) {
                if (player.isWinner) {
                  existsWinner = true
                }
              }
              if (!existsWinner) {
                game.players[index].wins++
                game.players[index].isWinner = true
              }

              // find if all players have finished
              let allDone = true
              for (const player of game.players) {
                if (player.percent !== 100 && !player.givenUp) {
                  allDone = false
                }
              }
              if (allDone) {
                // console.log('everyone finished or gave up')
                // reset game
                game.isOpen = true
                game.isStarted = false
                game.players[index].percent = 0
                game.players[index].isReady = false
                // console.log('finishing game with winner as', player.name, 'with wpm =', game.players[index].WPM)
                io.to(gameID).emit('done', { gameID: game._id, socketID: game.players[index].socketID })
              }
              // save game
              game = await game.save()
              io.to(gameID).emit('updateGame', game)
            }
          }
        }
      } else {
        // console.log('game either over or not started')
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('done', async data => {
    console.log('got DONE event with data', data, ' | socket', socket.id)
    let id = data
    if (typeof data == 'object') {
      id = data.gameID
    }
    // if (gameTime) {
    //   console.log('clearing gameTime interval')
    //   clearInterval(gameTime)
    // } else {
    //   console.log('no gametime found')
    // }
    let game = await Game.findById(id)
    for (const player of game.players) {
      // skip wpm to display as stat in lobby
      player.percent = 0
      player.givenUp = false
      player.ready = false
    }
    game.isTypable = false
    game.isStarted = false
    game = await game.save()
    io.to(id).emit('updateGame', game)
    clearInterval(gameTime)
  })

  socket.on('give-up', async ({ gameID, playerID }) => {
    try {
      let game = await Game.findById(gameID)
      // console.log('INITIAL: game', game._id, 'playerID', playerID)
      let allDone = true
      for (const index in game.players) {
        if (String(game.players[index]._id) !== playerID) {
          console.log('checking status of', game.players[index].name, 'percent =', game.players[index].percent, ' & givenUp status =', game.players[index].givenUp)
          if (game.players[index].percent !== 100 && !game.players[index].givenUp) {
            console.log('since percent was not all the way and not given up, the game will continue')
            allDone = false
          }
        } else {
          console.log('found this player', game.players[index].name, 'setting givenUp to true')
          game.players[index].givenUp = true
        }
      }

      if (allDone) {
        console.log('last player gave up, Finishing game', gameID, 'game._id', game._id)
        game.isOpen = true
        game.isStarted = false
        let socketID = ''
        let highestPercent = 0

        // find declared winner
        for (const player of game.players) {
          if (player.isWinner) {
            console.log('found an existing winner of', player.name)
            socketID = player.socketID
          }
          if (player.percent > highestPercent) {
            console.log('loop set of highestPercent', player.percent)
            highestPercent = player.percent
          }
        }
        console.log('finish player loops with highest percent', highestPercent, 'and declared winner of', socketID)
        // find closest winner if none were declared
        if (!socketID) {
          for (const player of game.players) {
            if (player.percent >= highestPercent) {
              console.log('highest percent was by', player.name, 'with', player.percent)
              socketID = player.socketID
            }
          }
        }

        // set winner
        if (socketID) {
          for (const player of game.players) {
            if (player.socketID === socketID) {
              console.log('saving winner as', player.name)
              player.isWinner = true
            }
          }
        }

        console.log('sending done with', gameID, typeof gameID, 'and', socketID, typeof socketID)

        socket.emit('done', { gameID, socketID })

        // original working emit
        // io.to(gameID).emit('done', { gameID: game._id, socketID: game.players[0].socketID })
      } else {
        console.log('logic says that the game should NOT end')
      }
      game = await game.save()

    } catch (err) {
      console.log(err)
    }
  })

  socket.on('timer', async ({ gameID, playerID }) => {
    // time in seconds
    let countDown = 5
    // find game
    let game = await Game.findById(gameID)
    // find player who made request
    let player = game.players.id(playerID)
    // check if player has permission to start game

    let allReady = true
    // check if everyone is ready
    game.players.forEach(player => {
      if (!player.isReady) {
        allReady = false
      }
    })

    if (player.isLeader && allReady) {

      if (countDown == 5) { // move from lobby to game
        // reset player stats
        // console.log('reseting player stats, starting game in', countDown)
        for (const player of game.players) {
          player.WPM = -1
          player.percent = 0
          player.givenUp = false
          player.ready = false
          player.isWinner = false
          // prod data
          const excerpt = allData[Math.floor(Math.random() * allData.length)]
          // test data
          // const excerpt = simpleData[Math.floor(Math.random() * simpleData.length)]
          
          game.quote = excerpt.quote
          game.source = excerpt.source
          game.speed = excerpt.speed
          game.words = excerpt.quote.split(' ').length
        }
        game.isTypable = false
        game.isStarted = true
        game = await game.save()
        io.to(gameID).emit('updateGame', game)
      }

      // clear if existing
      if (gameTime) {
        console.log('clearing past gameTime interval')
        clearInterval(gameTime)
      }
      
      // start time countdown
      let timerID = setInterval(async () => {
        // keep counting down until we hit 0
        if (countDown >= 0) {
          // emit countDown to all players within game
          io.to(gameID).emit('timer', { countDown, msg: "Starting Game" })
          countDown--
        }
        // start time clock over, now time to start game
        else {
          io.to(gameID).emit('start-race')
          // close game so no one else can join
          game.isOpen = false
          game.isTypable = true

          // save the game
          game = await game.save()
          // send updated game to all sockets within game
          io.to(gameID).emit('updateGame', game)
          // start game clock
          startGameClock(gameID)
          clearInterval(timerID)
        }
      }, 1000)
    }
  })

  socket.on('join-game', async ({ gameID, name }) => {
    try {
      // get game
      let game = await Game.findById(gameID)
      if (!game) {
        throw `No game found by ID ${gameID}`
      }
      // check if game is allowing users to join
      if (game.isOpen) {

        // check if player is already in game
        const playerObj = game.players.find(player => player.name === name)
        if (playerObj) {
          throw 'A player with that name already exists. Please change your name and try again or create a new game.'
        }

        // make players socket join the game room
        socket.join(gameID)
        // create our player
        let player = {
          socketID: socket.id,
          name
        }
        // add player to the game
        game.players.push(player)
        // save the game
        game = await game.save()
        // send updated game to all sockets within game

        io.to(gameID).emit('updateGame', game)
      } else {
        // deny request
        // console.log('game closed id =', gameID)
        throw 'Game Closed'
      }
    } catch (err) {
      console.log(err)
      if (typeof err === 'string') { // thrown error, 400
        socket.emit('error', err)
      } else { // unknown server error 500
        socket.emit('error', err.message || err)
      }
    }
  })

  socket.on('change-ready', async ({ gameID, playerID, isReady }) => {
    try {
      let game = await Game.findById(gameID)
      for (const index in game.players) {
        if (game.players[index]._id == playerID) {
          if (game.players[index].isReady !== isReady) {
            game.players[index].isReady = isReady
            game = await game.save()
            // console.log('updated Game Ready state', playerID, 'to', isReady)
            io.to(gameID).emit('updateGame', game)
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('change-open', async ({ gameID, isOpen }) => {
    try {
      let game = await Game.findById(gameID)
      if (game.isOpen !== isOpen) {
        game.isOpen = isOpen
        game = await game.save()
        // console.log('updated Game Open state', gameID, 'to', isOpen)
        io.to(gameID).emit('updateGame', game) 
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('send-message', body => {
    io.emit('get-message', body)
  })

  // socket.on('clear-timer', () => {

  // })

  socket.on('create-game', async name => {
    try {
      // create game
      let game = new Game()
      // production data
      const excerpt = allData[Math.floor(Math.random() * allData.length)]
      // test data
      // const excerpt = simpleData[Math.floor(Math.random() * simpleData.length)]
      
      game.quote = excerpt.quote
      game.source = excerpt.source
      game.speed = excerpt.speed
      game.words = excerpt.quote.split(' ').length
      game._id = crypto.randomBytes(3).toString('hex').toUpperCase()

      // create player
      let player = {
        socketID: socket.id,
        isLeader: true,
        name
      }

      // add player
      game.players.push(player)
      // save the game
      game = await game.save()
      // make players socket join the game room
      const gameID = game._id.toString()
      socket.join(gameID)
      // send updated game to all sockets within game
      io.to(gameID).emit('updateGame', game)
    } catch (err) {
      console.log(err)
    }
  })

  async function startGameClock(gameID) {
    // get the game
    let game = await Game.findById(gameID)
    // get time stamp of when the game started
    game.startTime = new Date().getTime()
    // save the game
    game = await game.save()
    // time is in seconds
    let time = 120
    // Start the Game Clock
    gameTime = setInterval(() => {
      // keep countdown going
      if (time >= 0) {
        const formatTime = calculateTime(time)
        console.log('time left', formatTime)
        io.to(gameID).emit('timer', { countDown: formatTime, msg: "Time Remaining" })
        time--
      }
      // game clock has run out, game is over
      else {
        (async () => {
          // get time stamp of when the game ended
          let endTime = new Date().getTime()
          // find the game
          let game = await Game.findById(gameID)
          // get the game start time
          let { startTime } = game
          // calculate all players WPM who haven't finished typing out sentence
          game.players.forEach((player, index) => {
            if (player.WPM === -1)
              game.players[index].WPM = calculateWPM(endTime, startTime, player, game.words)
          })
          // save the game
          game = await game.save()
          // send updated game to all sockets within game
          io.to(gameID).emit('updateGame', game)
          socket.emit('done', gameID)
          clearInterval(gameTime)
        })()
      }
    }, 1000)
  }
})

server.listen(port, err => {
  if (err) throw err
  console.log(`----> http://localhost:${port}`)
})

function calculateTime(time) {
  let minutes = Math.floor(time / 60)
  let seconds = time % 60
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
}

function calculateWPM(endTime, startTime, player, words, finished) {
  let numOfWords = 0
  if (finished) {
    numOfWords = words
  } else {
    numOfWords = player.percent / 100 * words
  }
  const timeInSeconds = (endTime - startTime) / 1000
  const timeInMinutes = timeInSeconds / 60
  const WPM = Math.floor(numOfWords/ timeInMinutes)
  return WPM
}