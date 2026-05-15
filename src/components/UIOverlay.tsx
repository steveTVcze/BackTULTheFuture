import React, { useRef, useEffect } from 'react'
import type { GamePhase } from '../App'

type UIOverlayProps = {
  phase: GamePhase
  wakeUp: boolean
  sqlInput: string
  sqlError: string | null
  onSqlChange: (value: string) => void
  onSqlSubmit: () => void
  onSitDown: () => void
  onGoToTerminal: () => void
}

export function UIOverlay({
  phase,
  wakeUp,
  sqlInput,
  sqlError,
  onSqlChange,
  onSqlSubmit,
  onSitDown,
  onGoToTerminal,
}: UIOverlayProps) {
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    let audioFile = '';
    
    if (phase === 'APPROACH_DESK') { audioFile = '/audio/sedni_do_lavice.mp3';
    } 
    else if (phase === 'CLASSROOM_SITTING') {
      audioFile = '/audio/jdu_pozde.mp3';
    } 
    else if (phase === 'TERMINAL_INTERACTION') {
      audioFile = '/audio/zapis_sql_command.mp3'; 
    }

    if (audioFile) {
      audioRef.current = new Audio(audioFile);
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(err => {
        console.warn("Prohlížeč zablokoval automatické přehrání zvuku:", err);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [phase]);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    onSqlSubmit()
  }

  return (
    <div className="ui-root">
      {wakeUp && (
        <div className="wake-overlay" />
      )}

      {phase === 'APPROACH_DESK' && (
        <div className="ui-bubble bottom-center">
          <p>Sedni si do lavice (klikni na zvýrazněnou lavici).</p>
          <button type="button" className="ui-button" onClick={onSitDown}>
            Sednout si
          </button>
        </div>
      )}

      {phase === 'CLASSROOM_SITTING' && (
        <div className="ui-bubble bottom-left">
          <p>
            Sakra, jdu pozdě... Učitel už začal. Radši se rychle zapíšu do
            docházky.
          </p>
          <button
            type="button"
            className="ui-button"
            onClick={onGoToTerminal}
          >
            Otevřít terminál na monitoru
          </button>
        </div>
      )}

      {phase === 'TERMINAL_INTERACTION' && (
        <div className="ui-terminal">
          <div className="ui-terminal-header">SQL TERMINÁL – DOCHÁZKA</div>
          <form onSubmit={handleSubmit} className="ui-terminal-body">
            
            <div className="ui-terminal-instructions">
              <strong>Úkol:</strong>
              <br />
              Zapiš se do databáze docházky. Rychle, než si učitel všimne, že jdeš pozdě! 
              <br />
              <span style={{ color: '#aaa', fontSize: '0.9em' }}>
                (Tip: Co se asi stane, když systém přetížíš a místo aktuálního roku zadáš schválně nesmyslně obrovskou hodnotu, která se do Integeru nevejde?)
              </span>
              <br />
              <code style={{color: '#ffcc00', display: 'block', marginTop: '10px'}}>
                INSERT INTO dochazka (jmeno, prijmeni, datum, rok)<br />
                VALUES ('Jan', 'Novak', '03-07', 2025000000000000000000000);
              </code>
            </div>

            <label className="ui-terminal-label">
              Zadej SQL dotaz:
            </label>
            <textarea
              className="ui-terminal-input"
              spellCheck={false}
              value={sqlInput}
              onChange={(e) => onSqlChange(e.target.value)}
              placeholder="Sem napiš kód..."
              rows={4}
            />
            {sqlError && <div className="ui-terminal-error">{sqlError}</div>}
            <button type="submit" className="ui-button wide">
              Spustit INSERT (Enter)
            </button>
          </form>
        </div>
      )}

      {phase === 'GLITCH' && (
        <div className="ui-glitch-overlay">
          <div className="ui-glitch-text">SYSTÉM DOCHÁZKY PŘETÍŽEN...</div>
        </div>
      )}
    </div>
  )
}