import React, { useEffect, useState, useRef } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Modal from 'react-bootstrap/Modal'
import { socket } from '../constants'

export default function Game({ game }) {
  const [input, setInput] = useState('')
  const [quote, setQuote] = useState('')
  const [showQuit, setShowQuit] = useState(false)

  const inputRef = useRef()
  const quoteDisplay = useRef()

  useEffect(() => {
    setQuote(game.quote.split(''))
    setInput('')
    inputRef.current.focus()
  }, [])

  useEffect(() => inputRef.current.focus(), [game.isTypable])

  function updatePercent() {
    let percent = 0
    const inputValue = quoteDisplay.current?.querySelectorAll('.correct').length
    const quoteValue = game.quote.length
    percent = Math.floor((inputValue / quoteValue) * 100)
    // // check if percent is different
    const player = game.players.find(player => player.socketID === socket.id)
    if (player.percent !== percent && percent) {
      console.log('update', player.percent, 'to', percent)
      socket.emit('progress', { percent, gameID: game._id })
    }
  }

  function changeInput(e) {
    const arrayQuote = quoteDisplay.current.querySelectorAll('span')
    const arrayValue = e.target.value.split('')
    setInput(e.target.value)
  
    let correct = true
    arrayQuote.forEach((characterSpan, index) => {
      const character = arrayValue[index]
      if (character == null) {
        characterSpan.classList.remove('correct')
        characterSpan.classList.remove('incorrect')
        correct = false
      } else if (character === characterSpan.innerText) {
        characterSpan.classList.add('correct')
        characterSpan.classList.remove('incorrect')
      } else {
        characterSpan.classList.remove('correct')
        characterSpan.classList.add('incorrect')
        correct = false
      }
    })
    
    if (correct) {
      updatePercent() // complete
    } else {
      if (e.target.value?.slice(-1) == ' ') { // update progress on percentages
        updatePercent()
      }
    }
  }

  function giveUp() {
    const player = game.players.find(player => player.socketID === socket.id)
    socket.emit('give-up', { gameID: game._id, playerID: player._id })
    setShowQuit(false)
  }
  
  return (
    <div className="mb-4">
      
      <div ref={quoteDisplay} className="quoteDisplay">
        {quote && quote.map((char, index) => <span key={index}>{char}</span>)}
      </div>
      <Form.Control 
        as="textarea" 
        onPaste={(e) => e.preventDefault()} 
        onDragStart={(e) => e.preventDefault()} 
        onDrop={(e) => e.preventDefault()} 
        autoComplete="off"
        value={input} 
        ref={inputRef} 
        disabled={!game.isTypable} 
        className="gameInput" 
        onChange={changeInput} 
        rows={4} 
      />
      <Row>
        <Button variant='outline-secondary' className="mt-5 mx-auto w-25" onClick={() => setShowQuit(true)}>Give Up</Button>
      </Row>
      
      {/* Quit Screen Confirmation */}
      <Modal show={showQuit} onHide={() => setShowQuit(false)}>
        <Modal.Header>
          <Modal.Title>Forfeit this round</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Would you like to forfeit this round and head back to the game lobby?</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" className="me-auto" onClick={() => setShowQuit(false)}>No, continue the game</Button>
          <Button variant="danger" className="ms-auto" onClick={giveUp}>Forfeit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}