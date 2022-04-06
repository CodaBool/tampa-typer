import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Spinner from 'react-bootstrap/Spinner'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Game from '../Components/Game'
import Lobby from '../Components/Lobby'
import { socket } from '../constants'
import Cars from '../Components/Cars'
import Chat from '../Components/Chat'
import CountDown from '../Components/CountDown'
import Stats from '../Components/Stats'
import Navigation from '../Components/Navigation'

const Loading = ({ msg }) => (
  <>
    <Spinner animation="border" variant="info" style={{margin: '20% auto 0 auto', display: 'block'}} />
    <h3 className="text-muted delayedFade mt-5 text-center">This game does not appear reachable</h3>
    <hr className="delayedFade w-50 mx-auto my-3" />
    <h4 className="text-center delayedFade mb-2">{msg}</h4>
  </>
)

let gameID = ''

export default function index() {
  const router = useRouter()
  const [game, setGame] = useState({ _id: '', isOpen: false, isStarted: false, players: [] })
  const [gameStarted, setGameStarted] = useState(false)
  const [winnerSocket, setWinnerSocket] = useState(null)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!localStorage.getItem('name')) {
      router.push('/')
    }

    socket.on('updateGame', (game) => {
      // console.log('update game', game)
      setGame(game)
    })
    socket.on('timer', data => {
      // console.log('timer emitted', gameStarted)
      if (data.msg === 'Time Remaining' && !gameStarted) {
        // console.log('allow typing')
        setGameStarted(true)
      }
    })

    // TODO: should find a solution to not need client to finish the game for everyone
    socket.on('done', data => {
      socket.emit('done', data)
      setWinnerSocket(data.socketID)
      setGameStarted(false)
    })

    socket.on('error', msg => {
      if (msg.includes('No game')) {
        setError(msg)
      } else if (msg.includes('already exists')) {
        setError(msg)
      }
    })

    setTimeout(() => {
      // console.log('DEBUG: q', router.query, 'window =', typeof window)
      if (gameID) { // join existing game
        // console.log('join existing game of ID', gameID)
        socket.emit('join-game', { gameID, name: localStorage.getItem('name') })
      } else { // new game or blocked join
        socket.emit('create-game', localStorage.getItem('name'))
        // console.log('create new game for', localStorage.getItem('name'))
      }
    }, 3500)

    return () => socket.removeAllListeners()
  }, [])

  useEffect(() => gameID = router.query.gameID, [router])

  return (
    <>
      <Navigation />
      <Container>
        {game._id == '' &&
          <Loading msg={error} />
        }
        {error && 
          <Row>
            <Button onClick={() => router.push('/')} variant="outline-secondary" className="mx-auto my-4 w-25 quickFade">Return to Menu</Button>
          </Row>
        }
        <Row>
          <Col md={8} className="">
            {(game._id && !game.isStarted) && <Lobby game={game} />}
            {game.isStarted && <CountDown />}
            {game._id !== '' && <Cars game={game} />}
            <Stats game={game} gameStarted={gameStarted} winnerSocket={winnerSocket} setWinnerSocket={setWinnerSocket} />
            {game.isStarted && <Game game={game} loading={Loading} />}
          </Col>
          <Col md={4} className="mt-4">
            {game._id !== '' && <Chat game={game} />}
          </Col>
        </Row>
      </Container>
    </>
  )
}
