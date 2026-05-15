import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import './App.css'
import { ClassroomScene } from './components/ClassroomScene'
import { UIOverlay } from './components/UIOverlay'
import { GlitchEffect } from './components/GlitchEffect'
import { GameWorld2D } from './components/GameWorld2D'

export type GamePhase =
  | 'WAKE_UP'
  | 'APPROACH_DESK'
  | 'CLASSROOM_SITTING'
  | 'TERMINAL_INTERACTION'
  | 'GLITCH'
  | 'PREHISTORY'

function App() {
  const [phase, setPhase] = useState<GamePhase>('WAKE_UP')
  const [wakeUpStarted, setWakeUpStarted] = useState(false)
  const [sqlInput, setSqlInput] = useState('')
  const [sqlError, setSqlError] = useState<string | null>(null)

  useEffect(() => {
    if (phase === 'WAKE_UP' && !wakeUpStarted) {
      setWakeUpStarted(true)
      const timer = setTimeout(() => {
        setPhase('APPROACH_DESK')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [phase, wakeUpStarted])

  useEffect(() => {
    if (phase === 'GLITCH') {
      const audio = new Audio('/sounds/glitch.mp3')
      void audio.play().catch(() => undefined)
    }
  }, [phase])

  const handleSitDown = () => {
    setPhase('CLASSROOM_SITTING')
  }

  const handleOpenTerminal = () => {
    setPhase('TERMINAL_INTERACTION')
  }

  const handleSqlSubmit = () => {
    const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').replace(/;$/, '').trim().toLowerCase();
    const normalizedInput = normalizeSql(sqlInput);

    const expectedSql = /^insert into dochazka\s*\(jmeno,\s*prijmeni,\s*datum,\s*rok\)\s*values\s*\(\s*'.*?'\s*,\s*'.*?'\s*,\s*'.*?'\s*,\s*2025000000000000000000000\s*\)$/;

    if (!normalizedInput.startsWith('insert into dochazka')) {
      setSqlError("Začni dotaz správně: INSERT INTO dochazka (jmeno, prijmeni, datum, rok) VALUES ...");
      return;
    }

    if (!expectedSql.test(normalizedInput)) {
      setSqlError("Chyba v syntaxi dotazu! Zkontroluj, jestli máš správně všechny sloupce, 3 textové hodnoty v apostrofech a na konci to obří číslo.");
      return;
    }

    setSqlError(null)
    setPhase('GLITCH')

    setTimeout(() => {
      setPhase('PREHISTORY')
    }, 4000)
  }
  
  const showCanvas =
    phase === 'WAKE_UP' ||
    phase === 'APPROACH_DESK' ||
    phase === 'CLASSROOM_SITTING' ||
    phase === 'TERMINAL_INTERACTION' ||
    phase === 'GLITCH'

  return (
    <div className="game-root">
      {showCanvas && (
        <Canvas 
          className="game-canvas"
          shadows
          gl={{ 
            logarithmicDepthBuffer: true,
            antialias: true,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#111']} />
          <Suspense fallback={null}>
            <ClassroomScene
              phase={phase}
              onSitDown={handleSitDown}
              onOpenTerminal={handleOpenTerminal}
            />
            {phase === 'GLITCH' && <GlitchEffect />}
          </Suspense>
        </Canvas>
      )}

      <UIOverlay
        phase={phase}
        wakeUp={phase === 'WAKE_UP'}
        sqlInput={sqlInput}
        sqlError={sqlError}
        onSqlChange={setSqlInput}
        onSqlSubmit={handleSqlSubmit}
        onSitDown={handleSitDown}
        onGoToTerminal={handleOpenTerminal}
      />

      {phase === 'PREHISTORY' && <GameWorld2D />}
    </div>
  )
}

export default App