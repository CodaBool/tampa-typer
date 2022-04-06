import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Navigation from '../Components/Navigation'

export default function About() {
  return (
    <>
      <Navigation />
      <Container>
        <h1 className="display-1 my-3">About</h1>
        <Row>
          <Col md={6} className="aboutSummary p-3">
            <h5 className="display-4">Type Fast to Win ⌨️</h5>
            <p>
              &emsp;Do you have fast fingers? Put them to the test by typing out a provided quote as fast as possible.
              Battle against your friends by inviting them to the same lobby.
              Watch live as your car will progress as you type.
              Reach the finish line to win and prove your skills.
            </p>
          </Col>
          <Col md={6}>
            <img src="/image/race.PNG" className="rounded shadow w-100 mb-3" />
          </Col>
          <Col md={6}>
            <div className="aboutTech">
              <img src="/image/simple.png" className="rounded w-100 mt-3" />
            </div>
          </Col>
          <Col md={6} className="aboutSummary p-3">
            <h5 className="display-4">Under the Hood 🧰</h5>
            <ul>
              <dd className="d-inline">- React </dd><span className="text-muted"> (Front end)</span><br />
              <dd className="d-inline">- Socket.io </dd><span className="text-muted"> (Web Sockets)</span><br />
              <dd className="d-inline">- Express.js </dd><span className="text-muted"> (Back end)</span><br />
              <dd className="d-inline">- MongoDB </dd><span className="text-muted"> (Database)</span><br />
            </ul>
            <Row>
              <p className="text-muted ms-5" style={{fontSize: '1.1rem'}}>Read More at <a href="https://codabool.com">CodaBool.com</a></p>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <h2 className="mt-5">Credit 🎨</h2>
            <p style={{fontSize: '1.1rem'}}>
              &emsp;The art at the title page is video recording of a JavaScript keyboard written by Matthew Nau.
              Which was originally inspired by Reddit user zhengc. All the details can be read about in the README page of matthewnau keyboard repo 
              <a href="https://github.com/matthewnau/keyboard"> github.com</a>
            </p>
          </Col>
        </Row>
      </Container>
    </>
  )
}
