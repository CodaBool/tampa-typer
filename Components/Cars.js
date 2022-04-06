import React from 'react'

export default function Cars({ game }) {

  function getRandomCar(id) {
    let number = 0
    for (const char of id.split('').reverse()) {
      if (/^\d+$/.test(char)) {
        number = Number(char)
        break
      }
    }
    if (number < 2) {
      return "/image/car-blue.png"
    } else if (number < 4) {
      return "/image/car-green.png"
    } else if (number < 6) {
      return "/image/car-pink.png"
    } else {
      return "/image/car-red.png"
    }
  }

  function getLeft(progress) {
    return progress / 1.3 + '%'
  }

  return (
    <>
      {game._id &&
        game.players.map((player, index) => {
          return (
            <div key={index}>
              {player.isWinner && <img src='/image/win.png' className="me-auto d-block" />}
              {!game.isStarted && 
                <div className="me-3" style={{display: 'inline'}}>
                  {player.isReady
                    ? <img src="/image/traffic-green.gif" />
                    : <img src="/image/traffic-red.gif" />
                  }
                </div>
              }
              <div className="carBox" style={{position: 'relative', left: getLeft(player.percent), display: 'inline'}}>
                <p className="d-inline me-2">{player.name}</p>
                <img src={`${getRandomCar(player._id)}`} />
              </div>
            </div>
          )
        })
      }
    </>
  )
}