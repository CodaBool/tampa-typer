import Head from 'next/head'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Type Racer</title>
        <meta name="description" content="Type Racing game" />
        <link rel="icon" href="/favicon-32x32.gif" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  )
}