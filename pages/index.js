import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Modal from 'react-bootstrap/Modal'
import Popover from 'react-bootstrap/Popover'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Menu() {
  const [gameID, setGameID] = useState('')
  const [wins, setWins] = useState(null)
  const [nameError, setNameError] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [show, setShow] = useState(false)
  const router = useRouter()

  // if (typeof window !== "undefined") {
  //   setName(localStorage.getItem('name'))
  //   // localStorage.setItem(key, value)
  // }

  useEffect(() => {
    if (localStorage.getItem('wins')) {
      setWins(localStorage.getItem('wins'))
    }
    if (!localStorage.getItem('name')) {
      setShow(true)
    } else {
      setName(localStorage.getItem('name'))
    }
  }, [])

  function handleCode(e) {
    if (e.target.value.length > 6) {
      setError('Codes must be 6 characters long')
    } else {
      setError(null)
    }
    setGameID(e.target.value)
  }

  function handleName(e) {
    if (e.target.value.length > 11) {
      setNameError('Names must be max 12 characters')
    } else if (e.target.value.length == 0) {
      setNameError('Please Enter a Name')
      setName('')
    } else {
      setNameError(null)
      const char = e.target.value.slice(-1)
      if (char >= 'A' && char <= 'Z' || char >= 'a' && char <= 'z' || char == ' ') {
        localStorage.setItem('name', e.target.value)
        setName(e.target.value)
      } else {
        setNameError('Only letter characters Allowed')
      }
    }
  }

  function joinGame() {
    if (localStorage.getItem('name') && gameID) {
      router.push(`/online?gameID=${gameID}`)
    }
  }

  function createGame() {
    if (localStorage.getItem('name')) {
      router.push('/online')
    }
  }

  const popover = (
    <Popover>
      <Popover.Title as="h3" className="text-center">Join or Create</Popover.Title>
      <Popover.Content>
        &emsp;Join a room which someone has already created and provided you a 6 character code for to join
        <Form.Control className="my-1" value={gameID} placeholder="6 Character Code" onChange={handleCode} />
        {error && <p className="text-danger text-center">{error}</p>}
        <Button onClick={joinGame} className="w-100" disabled={gameID.length !== 6 || error || name.length == 0}>Join with Code</Button>
        <hr />
        &emsp;Create a new room which generates a 6 character code for you to provide to another player to join
        <Button onClick={createGame} disabled={error || name.length == 0} className="w-100 mt-3">Create New Room</Button>
      </Popover.Content>
    </Popover>
  )

  return (
    <div className="menuPage">
      <Row className="pt-5 m-0">
        <Col>
          <Button className="nameButton ms-auto d-block" onClick={() => setShow(true)}>{`${name ? name : 'Click to Enter Name'}`}</Button>
          <Button className="leftOtherButton my-3 ms-auto d-block">{wins ? wins : '0'} Wins</Button>
        </Col>
        <Col>
          <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
            <Button className="playButton">Play Now</Button>
          </OverlayTrigger>
          <Button className="rightOtherButton my-3 me-auto d-block" onClick={() => router.push('/about')}>About</Button>
        </Col>
      </Row>

      <Row className="p-0 m-0">
        <video autoPlay loop src="/video/title.mp4" className="w-75 mx-auto"></video>
      </Row>
      <Modal show={show} onHide={() => { if (name.length > 0) setShow(false) }}>
        <Modal.Header>
          <Modal.Title>Enter a Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">{nameError}</p>
          <Form.Control className="" value={name} placeholder="Name" onChange={handleName} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-100" disabled={name.length == 0} onClick={() => setShow(false)}>Play</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
