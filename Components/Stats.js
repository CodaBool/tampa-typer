import React, { useState, useEffect } from 'react'
import { socket } from '../constants'
import Card from 'react-bootstrap/Card'

export default function Stats({ game, winnerSocket, setWinnerSocket }) {
  const [wins, setWins] = useState(null)

  useEffect(() => {
    setWins(localStorage.getItem('wins') || 0)
  }, [])

  useEffect(() => {
    if (wins !== null) {
      // console.log('updating storage to ', wins)
      localStorage.setItem('wins', wins)
    }
  }, [wins])

  useEffect(() => {
    if (winnerSocket !== null) {
      // console.log('winnerSocket of winner', winnerSocket,'=== client winnerSocket', socket.id, '| result =', winnerSocket === socket.id)
      if (winnerSocket === socket.id) { // winner
        // console.log('winnerSocket found, incrementing')
        setWins(prev => Number(prev) + 1)
        setWinnerSocket(null)
      }
    }
  }, [winnerSocket])

  return (
    <>
      {game.players.map(player => {
        if (player.isWinner && !game.isTypable) 
          return (
            <Card key={player._id} className="rounded shadow mt-5 p-3">
              <p className="text-muted">
                {game.quote.substring(0, 300)}
                {game.quote.length > 300 && ' ...'}
              </p>
              <p className="font-italic">
                - {game.source}
              </p>
              <div className="d-block">
                <span className="text-muted">
                  Average WPM: 
                </span>
                <span className=""> {game.speed}</span>
              </div>
            </Card>
          )
      })}
      {game.players.map(player => {
        if (!game.isTypable && !game.isStarted)
          return (
            <Card key={player._id} className="rounded shadow mt-3 p-3">
              <div className="d-block">
                {player.isWinner && <img src='/image/win.png' className="mb-1 me-1" style={{width: '30px', opacity: '.5'}} />}
                <h5 className="d-inline" style={{opacity: '.8'}}>{player.name}</h5>
              </div>
              <div className="d-block">
                <span className="text-muted">
                  Last Rounds Words per Minute: 
                </span>
                {player.WPM !== -1 && <span className=""> {player.WPM}</span>}
              </div>
              {/* Remote */}
              <div className="d-block">
                <span className="text-muted">
                  Wins: 
                </span>
                <span className=""> {player.wins}</span>
              </div>
            </Card>
          )
      })}
    </>
  )
}
