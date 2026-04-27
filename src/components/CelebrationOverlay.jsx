import { useEffect, useState } from 'react'
import { burstSmall, burstHuge } from '../utils/celebration.js'
import { playPing, playLevelUp } from '../utils/sound.js'
import { randomCompletionMessage } from '../data/levels.js'

export default function CelebrationOverlay({ celebration, soundEnabled, onDone }) {
  const [toast, setToast] = useState(null)
  const [levelUp, setLevelUp] = useState(null)

  useEffect(() => {
    if (!celebration) return
    if (celebration.type === 'completion') {
      burstSmall()
      playPing(soundEnabled)
      const msg = randomCompletionMessage()
      setToast({ msg, key: celebration.key })
      const t = setTimeout(() => {
        setToast(null)
        onDone?.()
      }, 1500)
      return () => clearTimeout(t)
    }
    if (celebration.type === 'levelUp') {
      burstHuge()
      playLevelUp(soundEnabled)
      setLevelUp({ level: celebration.level, key: celebration.key })
      const t = setTimeout(() => {
        setLevelUp(null)
        onDone?.()
      }, 2800)
      return () => clearTimeout(t)
    }
  }, [celebration?.key])

  return (
    <>
      {toast && (
        <div className="celebration-toast" key={toast.key}>
          {toast.msg}
        </div>
      )}
      {levelUp && (
        <div className="celebration-levelup" key={levelUp.key}>
          <div className="celebration-flash" />
          <div className="celebration-card">
            <div className="celebration-card-icon">{levelUp.level.icon}</div>
            <div className="celebration-card-title">
              עלית לרמה {levelUp.level.id}
            </div>
            <div className="celebration-card-name">{levelUp.level.name}</div>
            <blockquote className="celebration-card-quote">
              ״{levelUp.level.quote}״
            </blockquote>
          </div>
        </div>
      )}
    </>
  )
}
