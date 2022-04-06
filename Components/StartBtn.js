import React, { useState, useEffect } from 'react'
import { socket } from '../constants'
import Button from 'react-bootstrap/Button'

export default function StartBtn({ player, game }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let allReady = true
    game.players.forEach(player => {
      if (!player.isReady) {
        allReady = false
      }
    })
    if (!game.isStarted) {
      setShow(allReady)
    }
  }, [game])

  function start() {
    socket.emit('timer', { playerID: player._id, gameID: game._id })
    setShow(false)
  }

  return (
    <>
      {show
        ? <Button className="mt-2" style={{width: '8rem'}} variant="danger" onClick={start}>Start</Button>
        : <div style={{height: '2.9rem'}}></div>
      }
    </>
  )
}