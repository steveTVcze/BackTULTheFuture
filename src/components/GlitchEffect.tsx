import { EffectComposer, Glitch } from '@react-three/postprocessing'
import { GlitchMode } from 'postprocessing'
import { Vector2 } from 'three'

export function GlitchEffect() {
  return (
    <EffectComposer>
      <Glitch
        delay={new Vector2(0.1, 0.3)}
        duration={new Vector2(0.6, 1.2)}
        strength={new Vector2(0.3, 1.0)}
        mode={GlitchMode.CONSTANT_WILD}
        ratio={0.9}
      />
    </EffectComposer>
  )
}

