import { Img } from 'remotion';
import classroom from '../../../assets/backgrounds/BG-002 — Classroom First-Person Background.png';
import { ConsequenceScene } from '../level1/ConsequenceScene';
import { AlexCheckingSequence } from '../level2/AlexCheckingSequence';
import { alexCheckingFrame } from '../level2/alexCheckingTimeline';
import { WeightingSnapshot } from '../level3b/ResultVisuals';
import type { BehaviourPresentation } from '../level3b/types';
import { CinematicCamera } from '../shared/engine/CinematicCamera/CinematicCamera';
import { EnvironmentMotion } from '../shared/engine/EnvironmentMotion/EnvironmentMotion';
import { ease, RECAP } from './endingTimeline';
import type { EndingProps } from './types';
import '../level3b/level3b.css';

const NoAdaptation = () => null;

/** Reuses the actual CIN-03B result view; never derives effort from weights. */
export function CompareMemory({ input, WeightMemory, reducedMotion, time, compact = false }: EndingProps & { time: number; compact?: boolean }) {
  const behaviour: BehaviourPresentation = { Memory: WeightMemory, Adaptation: NoAdaptation };
  const push = reducedMotion ? 0 : Math.sin(Math.min(1, time / 7) * Math.PI) * .025;
  return <div className={`end-compare ${compact ? 'end-compare-small' : ''}`}>
    <CinematicCamera pose={{ scale: 1 + push, x: -push * 28, y: 0, vignette: .42 }}>
      <Img src={classroom} className="end-world" />
      <div className="end-classroom-shade" />
      <div className="end-comparison-pair">
        <WeightingSnapshot title="Uneven weights" result={input.comparison.uneven} selectedMetrics={input.selectedMetrics} behaviour={behaviour} elapsed={time} reducedMotion={reducedMotion} settled />
        <div className="end-comparison-divider" />
        <WeightingSnapshot title="Near-equal weights" result={input.comparison.nearEqual} selectedMetrics={input.selectedMetrics} behaviour={behaviour} elapsed={time} reducedMotion={reducedMotion} settled />
      </div>
      <EnvironmentMotion progress={reducedMotion ? 0 : time / 60} style={{ opacity: .4 }} />
    </CinematicCamera>
  </div>;
}

export function LevelMemory({ level, time, ...props }: EndingProps & { level: 1 | 2 | 3; time: number }) {
  if (level === 1) return <ConsequenceScene metric={props.input.selectedMetric} seconds={props.reducedMotion ? 2.5 : time} reducedMotion={props.reducedMotion} />;
  if (level === 2) {
    const elapsed = Math.min(4.2, time * 4.2 / 3.6);
    // The original three-item choreography finishes the sixth supplied criterion.
    const progress = (3 + 3 * alexCheckingFrame(elapsed).progress) / 6;
    return <AlexCheckingSequence elapsed={elapsed} count={6} labels={props.input.checklistLabels} progress={progress} reducedMotion={props.reducedMotion} />;
  }
  return <CompareMemory {...props} time={time} compact />;
}

export function SoloMemory({ level, time, duration, ...props }: EndingProps & { level: 1 | 2 | 3; time: number; duration: number }) {
  const opacity = ease(time, 0, .4) * (1 - ease(time, duration - .4, .4));
  return <div className="end-memory-space" style={{ opacity }}>
    <div className="end-solo-memory" style={{ scale: props.reducedMotion ? 1 : 1.01 + time * .006 }}>
      <LevelMemory {...props} level={level} time={time} />
    </div>
    <div className="end-memory-caption"><span>LEVEL {level}</span><p>{RECAP[level - 1]}</p></div>
  </div>;
}

export function Convergence({ time, ...props }: EndingProps & { time: number }) {
  return <div className="end-memory-space end-convergence" style={{ opacity: ease(time, 0, .5) * (1 - ease(time, 2.7, .9)) }}>
    <div className="end-thread-light" style={{ opacity: .2 + ease(time, .5, 1.5) * .45 }} />
    {([1, 2, 3] as const).map((level, index) => <div key={level} className={`end-floating-memory end-floating-${level}`} style={{
      opacity: ease(time, index * .17, .65),
      transform: props.reducedMotion ? 'none' : `translateY(${(1 - ease(time, 0, 3.6)) * (index - 1) * 17}px) rotate(${(index - 1) * 3}deg) scale(${1.03 - time * .018})`,
    }}><LevelMemory {...props} level={level} time={1.1 + time * .45 + index * .2} /></div>)}
  </div>;
}

export function RecapMemories({ time, ...props }: EndingProps & { time: number }) {
  return <div className="end-recap-memories">
    {([1, 2, 3] as const).map((level, index) => <div className={`end-recap-memory end-recap-${level}`} key={level} style={{ opacity: ease(time, .35 + index * 1.4, .9), translate: props.reducedMotion ? 'none' : `0 ${(1 - ease(time, .35 + index * 1.4, 1.4)) * 12}px` }}>
      <div className="end-recap-window"><LevelMemory {...props} level={level} time={1.2 + time * .2 + index * .15} /></div>
      <span>LEVEL {level}</span><p>{RECAP[index]}</p>
    </div>)}
  </div>;
}
