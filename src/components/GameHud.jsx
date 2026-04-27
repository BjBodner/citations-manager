import { COMPLETIONS_PER_LEVEL } from '../data/levels.js'

export default function GameHud({ gamification, level, soundEnabled, onToggleSound, streak }) {
  const filled = gamification.completionsAtLevel
  const total = COMPLETIONS_PER_LEVEL
  const pips = Array.from({ length: total }, (_, i) => i < filled)
  const pct = (filled / total) * 100

  return (
    <div className={'game-hud level-theme-' + level.cardTheme}>
      <div className="hud-left">
        <div className="hud-level-badge" title={`רמה ${level.id}`}>
          <span className="hud-level-icon">{level.icon}</span>
          <div className="hud-level-text">
            <span className="hud-level-num">רמה {level.id}</span>
            <span className="hud-level-name">{level.name}</span>
          </div>
        </div>

        <div className="hud-progress">
          <div className="hud-progress-bar">
            <div className="hud-progress-fill" style={{ width: pct + '%' }} />
          </div>
          <div className="hud-progress-pips">
            {pips.map((on, i) => (
              <span key={i} className={'hud-pip' + (on ? ' on' : '')}>{on ? '◆' : '◇'}</span>
            ))}
            <span className="hud-progress-text">{filled} / {total} לרמה הבאה</span>
          </div>
        </div>
      </div>

      <div className="hud-quote">
        <span className="hud-quote-mark">״</span>
        <span>{level.quote}</span>
        <span className="hud-quote-mark">״</span>
      </div>

      <div className="hud-right">
        <div className="hud-stat" title="ניקוד">
          <span className="hud-stat-icon">⭐</span>
          <span className="hud-stat-value">{gamification.points}</span>
        </div>
        {streak?.current > 0 && (
          <div className="hud-stat" title="רצף ימים">
            <span className="hud-stat-icon">🔥</span>
            <span className="hud-stat-value">{streak.current}</span>
          </div>
        )}
        <button
          type="button"
          className="hud-sound"
          onClick={() => onToggleSound(!soundEnabled)}
          title={soundEnabled ? 'כבה צליל' : 'הפעל צליל'}
        >{soundEnabled ? '🔊' : '🔇'}</button>
      </div>
    </div>
  )
}
