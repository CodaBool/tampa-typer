import React, { useState, useEffect, useRef } from 'react'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import Overlay from 'react-bootstrap/Overlay'
import Tooltip from 'react-bootstrap/Tooltip'
import StartBtn from './StartBtn'
import { socket } from '../constants'

function getPlayer(players) {
  if (!players) return null
  return players.find(player => player.socketID === socket.id)
}

export default function Lobby({ game }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const player = getPlayer(game?.players)
  const codeBtn = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (player) {
      socket.emit('change-ready', { gameID: game._id, playerID: player._id, isReady })
    }
  }, [isReady])
  
  useEffect(() => {
    if (player) {
      socket.emit('change-open', { gameID: game._id, isOpen })
    }
  }, [isOpen])


  function copyCode() {
    setShow(true)
    navigator.clipboard.writeText(game._id)
    setTimeout(() => {
      setShow(false)
    }, 4000)
  }

  if (!player) {
    return (
      <>
        <Spinner animation="border" variant="info" style={{margin: '20% auto 0 auto', display: 'block'}} />
        <h4 className="delayedFade mt-5 text-center">Cannot connect to lobby</h4>
      </>
    )
  }

  return (
    <>
      <h1 className="display-1">Lobby</h1>
      <Row className="my-2">
        <Button ref={codeBtn} onClick={copyCode} className="mb-2" style={{width: '10rem'}}>Copy Share Code</Button>
        <Overlay target={codeBtn.current} show={show} placement="top">
          {props => (
            <Tooltip id="overlay" {...props}>
              Share Code {game._id} copied to clipboard! 
            </Tooltip>
          )}
        </Overlay>
        <div className="form-check form-switch ms-0">
          <input className="form-check-input" type="checkbox" checked={isReady} onChange={() => setIsReady(prev => !prev)} id="ready" />
          <label className="form-check-label">Ready</label>
        </div>
        {player.isLeader &&
          <>
            <div className="form-check form-switch ms-0">
              <input className="form-check-input" type="checkbox" checked={isOpen} onChange={() => setIsOpen(prev => !prev)} id="open" />
              <label className="form-check-label">Open</label>
            </div>
            <span className="border-right mx-3"></span>
            <StartBtn player={player} game={game} />
          </>
        }
      </Row>
    </>
  )
}
