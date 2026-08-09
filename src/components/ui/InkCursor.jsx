import { useEffect, useRef } from 'react'

export function InkCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Inject global cursor:none style to hide default browser mouse cursor arrow
    const styleEl = document.createElement('style')
    styleEl.setAttribute('id', 'ink-cursor-override')
    styleEl.innerHTML = `* { cursor: none !important; }`
    document.head.appendChild(styleEl)

    const amount = 20
    const sineDots = Math.floor(amount * 0.3)
    const width = 26
    const idleTimeout = 150

    let mousePosition = { x: -100, y: -100 }
    let timeoutID = null
    let idle = false
    let animationFrameId = null

    // Create dot DOM elements
    const dots = []
    cursor.innerHTML = '' // Clear existing dots

    for (let i = 0; i < amount; i++) {
      const scale = 1 - 0.05 * i
      const range = width / 2 - (width / 2) * scale + 2
      const el = document.createElement('span')
      el.style.position = 'absolute'
      el.style.display = 'block'
      el.style.width = `${width}px`
      el.style.height = `${width}px`
      el.style.borderRadius = '50%'
      el.style.backgroundColor = 'white'
      el.style.transformOrigin = 'center center'
      el.style.pointerEvents = 'none'
      el.style.transform = `translate3d(-50%, -50%, 0) scale(${scale})`
      cursor.appendChild(el)

      dots.push({
        index: i,
        x: -100,
        y: -100,
        scale,
        range,
        anglespeed: 0.05,
        angleX: Math.PI * 2 * Math.random(),
        angleY: Math.PI * 2 * Math.random(),
        lockX: 0,
        lockY: 0,
        element: el,
      })
    }

    const startIdleTimer = () => {
      timeoutID = setTimeout(() => {
        idle = true
        for (const dot of dots) {
          dot.lockX = dot.x
          dot.lockY = dot.y
          dot.angleX = Math.PI * 2 * Math.random()
          dot.angleY = Math.PI * 2 * Math.random()
        }
      }, idleTimeout)
      idle = false
    }

    const resetIdleTimer = () => {
      clearTimeout(timeoutID)
      startIdleTimer()
    }

    const onMouseMove = (event) => {
      mousePosition.x = event.clientX
      mousePosition.y = event.clientY
      resetIdleTimer()
    }

    const onTouchMove = (event) => {
      if (event.touches.length > 0) {
        mousePosition.x = event.touches[0].clientX
        mousePosition.y = event.touches[0].clientY
        resetIdleTimer()
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove)

    const render = () => {
      let x = mousePosition.x
      let y = mousePosition.y

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const nextDot = dots[i + 1] || dots[0]

        dot.x = x
        dot.y = y

        if (!idle || dot.index <= sineDots) {
          dot.element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%) scale(${dot.scale})`
        } else {
          dot.angleX += dot.anglespeed
          dot.angleY += dot.anglespeed
          dot.y = dot.lockY + Math.sin(dot.angleY) * dot.range
          dot.x = dot.lockX + Math.sin(dot.angleX) * dot.range
          dot.element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%) scale(${dot.scale})`
        }

        if (!idle || i <= sineDots) {
          const dx = (nextDot.x - dot.x) * 0.35
          const dy = (nextDot.y - dot.y) * 0.35
          x += dx
          y += dy
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      clearTimeout(timeoutID)
      cancelAnimationFrame(animationFrameId)
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl)
      }
    }
  }, [])

  return (
    <>
      {/* SVG Gooey Filter Definition */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="hidden fixed pointer-events-none">
        <defs>
          <filter id="ink-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Ink Cursor Container */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-difference"
        style={{ filter: 'url("#ink-goo")' }}
      />
    </>
  )
}
