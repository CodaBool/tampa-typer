import Link from 'next/link'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { useRouter } from 'next/router'

export default function Navigation() {
  const router = useRouter()

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand className="mx-4">
        <Link href='/'>Type Racer</Link>
      </Navbar.Brand>
      <Navbar.Toggle className="m-3" />
      <Navbar.Collapse >
        <Nav>
          <Link href='/about'>
            <a className={router.pathname == "/about" ? "active-link" : ""}>
              About
            </a>
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}