import { useEffect, useRef } from "react"

const BAR_COUNT = 28
const CANVAS_WIDTH = 280
const CANVAS_HEIGHT = 32

// Draws a live equalizer-style waveform from a MediaStream's audio levels.
// Runs its own requestAnimationFrame loop against a <canvas> instead of React
// state, since redrawing 28 bars ~60x/sec through React would thrash renders.
export function VoiceWaveform({ stream, className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!stream) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContextClass()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.75
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const step = Math.max(1, Math.floor(analyser.frequencyBinCount / BAR_COUNT))
    let rafId

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = "#ffffff"

      const barWidth = CANVAS_WIDTH / BAR_COUNT
      const gap = barWidth * 0.35

      for (let i = 0; i < BAR_COUNT; i++) {
        const level = dataArray[i * step] / 255
        const barHeight = Math.max(3, level * CANVAS_HEIGHT)
        const x = i * barWidth + gap / 2
        const y = (CANVAS_HEIGHT - barHeight) / 2
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth - gap, barHeight, 2)
        ctx.fill()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(rafId)
      source.disconnect()
      audioContext.close()
    }
  }, [stream])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className={className}
    />
  )
}
