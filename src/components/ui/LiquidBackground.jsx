import { useEffect, useRef } from 'react'

export function LiquidBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Smooth fluid waves matching the user's reference screenshot
    const waves = [
      { color: 'rgba(88, 28, 135, 0.70)', speed: 0.005, amplitude: 120, wavelength: 0.0018, yOffset: 0.65 }, // Deep Indigo/Purple
      { color: 'rgba(67, 56, 202, 0.60)', speed: 0.008, amplitude: 95, wavelength: 0.0024, yOffset: 0.72 },  // Electric Indigo
      { color: 'rgba(30, 58, 138, 0.65)', speed: 0.004, amplitude: 140, wavelength: 0.0012, yOffset: 0.58 }, // Deep Blue
      { color: 'rgba(124, 58, 237, 0.45)', speed: 0.010, amplitude: 80, wavelength: 0.0032, yOffset: 0.80 },  // Violet wave accent
    ]

    let step = 0

    const render = () => {
      step += 0.04
      ctx.clearRect(0, 0, width, height)

      // Base dark space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#06060A')
      bgGrad.addColorStop(0.5, '#0B0B12')
      bgGrad.addColorStop(1, '#050508')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Render smooth animated fluid wave layers
      waves.forEach((wave, idx) => {
        ctx.beginPath()
        const baseLine = height * wave.yOffset
        ctx.moveTo(0, height)

        for (let x = 0; x <= width; x += 10) {
          const y = Math.sin(x * wave.wavelength + step * wave.speed + idx * 1.5) * wave.amplitude +
                    Math.cos(x * 0.0008 + step * 0.008) * 25 + baseLine
          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()

        const waveGrad = ctx.createLinearGradient(0, baseLine - wave.amplitude, 0, height)
        waveGrad.addColorStop(0, wave.color)
        waveGrad.addColorStop(1, 'rgba(5, 5, 8, 0.95)')

        ctx.fillStyle = waveGrad
        ctx.fill()
      })

      // Soft ambient light glow in top-left & bottom-right
      const lightGrad = ctx.createRadialGradient(
        width * 0.2, height * 0.3, 10,
        width * 0.2, height * 0.3, 600
      )
      lightGrad.addColorStop(0, 'rgba(124, 58, 237, 0.15)')
      lightGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = lightGrad
      ctx.fillRect(0, 0, width, height)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
