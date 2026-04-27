let ctx = null

function getCtx() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  return ctx
}

function tone(freq, durationMs, type = 'sine', startGain = 0.18) {
  const ac = getCtx()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume().catch(() => {})
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(startGain, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationMs / 1000)
  osc.connect(gain).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + durationMs / 1000)
}

export function playPing(enabled) {
  if (!enabled) return
  try { tone(880, 140, 'triangle', 0.15) } catch {}
}

export function playLevelUp(enabled) {
  if (!enabled) return
  try {
    tone(523, 140, 'triangle', 0.18)
    setTimeout(() => tone(659, 140, 'triangle', 0.18), 110)
    setTimeout(() => tone(880, 240, 'triangle', 0.22), 230)
  } catch {}
}
