import confetti from 'canvas-confetti'

export function burstSmall() {
  confetti({
    particleCount: 50,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.7 },
    scalar: 0.9,
    ticks: 120
  })
}

export function burstHuge() {
  const end = Date.now() + 1200
  const colors = ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a855f7', '#f87171']

  ;(function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 75,
      origin: { x: 0, y: 0.7 },
      colors
    })
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 75,
      origin: { x: 1, y: 0.7 },
      colors
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()

  // central big burst
  setTimeout(() => {
    confetti({
      particleCount: 160,
      spread: 130,
      startVelocity: 45,
      origin: { y: 0.55 },
      colors,
      scalar: 1.1
    })
  }, 200)
}
