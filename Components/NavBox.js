import { useRef, useEffect, useState } from 'react'
// import useScreen from '../lib/useScreen'

export default function NavBox() {
  let screen = useScreen()
  if (!screen) screen = 'medium'

  const imgHome = useRef(null)
  const imgCode = useRef(null)
  const home = useRef(null)
  const code = useRef(null)

  useEffect(() => {
    imgCode.current.style.height = "0px"
    imgHome.current.style.height = "0px"
  }, [])

  if (home.current && code.current) {
    if (screen.includes('small')) {
      home.current.innerText = "HOME"
      code.current.innerText = "CODE"
    } else {
      home.current.innerText = "GO HOME"
      code.current.innerText = "SEE CODE"
    }
  }

  
  function expand(ref) {
    if (screen.includes('small')) { // Small, screen width <= 991px
      if (ref.current.id === "img-code") {
        imgCode.current.style.height = "70%"
      } else {
        imgHome.current.style.height = "100%"
      }
    } else { // Large, screen width > 991px
      if (ref.current.id === "img-code") {
        imgCode.current.style.height = "160%"
      } else {
        imgHome.current.style.height = "160%"
      }
    }
  }

  function contract(ref) {
    if (ref.current.id === "img-code") {
      imgCode.current.style.height = "0%"
    } else {
      imgHome.current.style.height = "0%"
    }
  }

  return (
    <div className="navBox">
      <img src='/image/navBox-home.png' ref={imgHome} id="img-home" />
      <a href="https://codabool.com/projects" ref={home} className="navBox-btn" id="btn-home" onMouseEnter={() => expand(imgHome)} onMouseLeave={() => contract(imgHome)}>GO HOME</a>
      <a href="https://github.com/CodaBool?tab=repositories" ref={code} className="navBox-btn" id="btn-code" onMouseEnter={() => expand(imgCode)} onMouseLeave={() => contract(imgCode)}>SEE CODE</a>
      <img src="/image/navBox-code.png" ref={imgCode} id="img-code" />
    </div>
  )
}


function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function useScreen() {
	const [screenType, setScreenType] = useState(getScreenType());
	const resizeEvent = debounce(() => {
		setScreenType(getScreenType())
	}, 100);

	useEffect(() => {
		window.addEventListener('resize', resizeEvent);
		return () => {
			window.removeEventListener('resize', resizeEvent);
		};
	}, [])

	return screenType;
}

function getScreenType() {
	let screenType = null;

	if (typeof window !== 'undefined') {
		if (window.matchMedia('(max-width: 575px)').matches) {
			screenType = 'xsmall';
		} else if (window.matchMedia('(max-width: 768px)').matches) {
			screenType = 'small';
		} else if (window.matchMedia('(max-width: 991px)').matches) {
			screenType = 'medium';
		} else if (window.matchMedia('(max-width: 1199px)').matches) {
			screenType = 'large';
		} else {
			screenType = 'xlarge';
		}
	}
	return screenType;
}