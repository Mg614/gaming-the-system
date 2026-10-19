import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import classroom from '../../../assets/backgrounds/BG-002 — Classroom First-Person Background.png';
import { CinematicCamera } from '../shared/engine/CinematicCamera/CinematicCamera';
import { DialogueLayer } from '../shared/engine/DialogueLayer/DialogueLayer';
import { EnvironmentMotion } from '../shared/engine/EnvironmentMotion/EnvironmentMotion';
import { useCinematicAudio, type CinematicAudioSources } from '../shared/engine/audio/useCinematicAudio';
import type { MetricId } from '../../shared/contracts';
import type { BehaviourPresentation, CompareComplete, ShotEvent, ShotFrame, Three } from './types';
import { adaptationShots, cameraScale, ease, handoffShots, metricNames, mix, resultCopy, shotSeconds } from './presentation';
import { WeightingSnapshot } from './ResultVisuals';
import './level3b.css';

export interface Level3RebalanceCompareProps {
  requestId: string;
  frame: ShotFrame;
  selectedMetrics: Three<MetricId>;
  /** Seconds within the current shot, supplied by the host's existing timeline. */
  elapsed: number;
  paused?: boolean;
  reducedMotion?: boolean;
  behaviour: BehaviourPresentation;
  audio?: CinematicAudioSources<'result' | 'transition' | 'compare'>;
  onShotComplete?: (event: ShotEvent) => void;
  onHandoff?: (event: ShotEvent) => void;
  onComplete?: (event: CompareComplete) => void;
}
const silentSources = {};

/** Controlled presentation only. The host supplies the shot, outcomes and clock.
 * It remains mounted on S14 so CIN-04 can start over the same comparison frame. */
export function Level3RebalanceCompareSequence({ requestId, frame, selectedMetrics, elapsed, paused = false, reducedMotion = false, behaviour, audio = silentSources, onShotComplete, onHandoff, onComplete }: Level3RebalanceCompareProps) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = reducedMotion || !!prefersReducedMotion;
  const { shot, current, previous, comparison } = frame;
  const identity = `${requestId}:${shot}`;
  const liveIdentity = useRef(identity);
  liveIdentity.current = identity;
  const emitted = useRef(new Set<string>());
  const [finishedAdaptation, setFinishedAdaptation] = useState<{ identity: string; at: number }>();
  const adaptationDone = finishedAdaptation?.identity === identity ? finishedAdaptation.at : undefined;
  const isAdaptation = adaptationShots.includes(shot);
  const lead = shot === 'S11' ? 2 : shot === 'S08' ? 1.5 : 0;
  const settle = shot === 'S11' ? 3 : shot === 'S08' ? 2 : 0;
  const isCompare = shot === 'S12' || shot === 'S13' || shot === 'S14';
  const visualTime = shot === 'S14' ? 7 : Math.min(elapsed, shotSeconds[shot]);
  const compareTime = shot === 'S12' ? 0 : visualTime;
  const { play, stop } = useCinematicAudio(audio);
  const audioCue = isCompare ? 'compare' : shot === 'S02' || shot === 'S10' ? 'transition' : 'result';

  useEffect(() => {
    if (paused) return;
    play(audioCue, { volume: .16, loop: audioCue === 'compare' });
    return () => { stop(audioCue); };
  }, [requestId, paused, play, stop, audioCue]);

  useEffect(() => {
    if (paused || emitted.current.has(identity)) return;
    const ready = isAdaptation
      ? adaptationDone !== undefined && elapsed >= adaptationDone + settle
      : elapsed >= shotSeconds[shot];
    if (!ready) return;
    // S14 must have actual comparison data before it can signal completion.
    if (shot === 'S14' && !comparison) return;
    emitted.current.add(identity);
    const event = { requestId, shot };
    if (handoffShots.includes(shot)) onHandoff?.(event);
    else if (shot === 'S14') onComplete?.({ type: 'compare_patterns_complete', requestId, comparison: comparison! });
    else onShotComplete?.(event);
  }, [identity, shot, elapsed, paused, requestId, isAdaptation, adaptationDone, settle, comparison, onShotComplete, onHandoff, onComplete]);

  const onAdaptationComplete = () => {
    if (liveIdentity.current !== identity || paused) return;
    setFinishedAdaptation(old => old?.identity === identity ? old : { identity, at: elapsed });
  };

  const pullback = cameraScale(shot, visualTime, reduced, adaptationDone);
  const bridgeFocus = !reduced && shot === 'S02' ? Math.sin(Math.min(1, elapsed / 7) * Math.PI) : 0;
  const copy = resultCopy(shot, isCompare ? compareTime : elapsed, current.category === 'near-equal');
  const common = { selectedMetrics, behaviour, reducedMotion: reduced };
  const showAdaptation = isAdaptation && elapsed >= lead && adaptationDone === undefined;
  const Adaptation = behaviour.Adaptation;
  const showPair = (shot === 'S06' || shot === 'S09') && previous;
  const stableCurrent = shot === 'S02' || shot === 'S03' || shot === 'S10';
  const launching = shot === 'S04' || (isAdaptation && elapsed < lead);

  return <div className={`l3b-stage ${reduced ? 'l3b-reduced' : ''}`} data-shot={`CIN3B-${shot}`} data-request={requestId} aria-label="Level 3 Rebalance and Compare cinematic">
    <CinematicCamera pose={{ scale: pullback, x: bridgeFocus * -1.2, y: 0, vignette: .32 }}>
      <img className="l3b-environment" src={classroom} alt="Warm afternoon light in the classroom" />
      <div className="l3b-light" />
      <EnvironmentMotion progress={reduced ? 0 : (isCompare ? Math.min(compareTime, 7) : visualTime) / 60} style={{ opacity: .35 }} />
      <div className="l3b-hero" aria-hidden={isCompare || !!showPair || showAdaptation} style={{ opacity: isCompare || showPair || showAdaptation ? 0 : .95 }}>{behaviour.hero}</div>

      {shot === 'S12' && comparison && frame.history?.filter(result => result.id !== comparison.uneven.id && result.id !== comparison.nearEqual.id).slice(-1).map(result =>
        <div key={result.id} className="l3b-receding-history" style={{ opacity: (1 - ease(elapsed, 0, 1.5)) * .45 }}><WeightingSnapshot {...common} result={result} title="" elapsed={3} settled compact /></div>)}
      {isCompare && comparison ? <div className="l3b-comparison" data-stable-comparison={shot === 'S14' ? 'true' : undefined}>
        <WeightingSnapshot {...common} result={comparison.uneven} title="Uneven Weights" elapsed={compareTime} settled={shot === 'S12'} style={{ opacity: shot === 'S12' ? ease(elapsed, 0, 1) : 1, transform: reduced ? undefined : `translateX(${-mix(22, 0, ease(shot === 'S12' ? elapsed : 3, 0, 2.5))}px)` }} />
        <div className="l3b-divider" aria-hidden="true" />
        <WeightingSnapshot {...common} result={comparison.nearEqual} title="Near-Equal Weights" elapsed={Math.max(0, compareTime - .45)} settled={shot === 'S12'} style={{ opacity: shot === 'S12' ? ease(elapsed, .5, 1.3) : 1, transform: reduced ? undefined : `translateX(${mix(22, 0, ease(shot === 'S12' ? elapsed : 3, .3, 2.2))}px)` }} />
      </div> : isCompare ? <p className="l3b-awaiting">Preparing comparison…</p> : launching ? <div className="l3b-launch" style={{ opacity: reduced ? 1 : ease(elapsed, 0, .5) }}>
        <h2>Your Weights</h2><div>{selectedMetrics.map((metric, i) => <p key={metric}><strong>{current.weights[i]}<small>%</small></strong><span>{metricNames[metric]}</span></p>)}</div>
      </div> : showAdaptation ? <div className="l3b-adaptation">
        <Adaptation key={identity} selectedMetrics={selectedMetrics} result={current} elapsed={elapsed - lead} paused={paused} reducedMotion={reduced} onComplete={onAdaptationComplete} />
      </div> : shot === 'S07' ? <>
        <div className="l3b-history" style={{ opacity: .45, transform: reduced ? undefined : `scale(${mix(1, .86, ease(elapsed, 0, 2))})` }}>
          {(frame.history ?? [previous, current].filter(Boolean)).slice(-2).map(result => result && <WeightingSnapshot {...common} key={result.id} result={result} title="" elapsed={3} settled compact />)}
        </div>
        <div className="l3b-test-condition" style={{ opacity: ease(elapsed, .5, 1.2) }}><span>Near-Equal</span><strong>34 <i>/</i> 33 <i>/</i> 33</strong></div>
      </> : showPair ? <div className="l3b-comparison l3b-before-after">
        <WeightingSnapshot {...common} result={previous} title="Before" elapsed={3} settled />
        <div className="l3b-divider" aria-hidden="true" />
        <WeightingSnapshot {...common} result={current} from={previous} title={shot === 'S09' ? 'Near-Equal' : 'After'} elapsed={elapsed} style={{ opacity: reduced ? 1 : ease(elapsed, 0, .6) }} />
      </div> : <div className="l3b-single" style={{ transform: reduced || stableCurrent ? undefined : `translateY(${mix(12, 0, ease(visualTime, 0, 1.5))}px)` }}>
        <WeightingSnapshot {...common} result={current} title="Your Weights" elapsed={stableCurrent ? 4 : adaptationDone === undefined ? elapsed : elapsed - adaptationDone} settled={stableCurrent} />
      </div>}
    </CinematicCamera>
    {copy && <DialogueLayer style={{ left: '8%', right: '8%', bottom: '5.2%', font: '400 clamp(15px, 1.65vw, 26px)/1.45 Georgia, serif', zIndex: 4 }}>
      {copy}
    </DialogueLayer>}
    {shot === 'S02' && <span className="l3b-speaker">{elapsed < 3.8 ? 'You' : 'Alex'}</span>}
  </div>;
}
