import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { DialogueLayer } from '../shared/engine/DialogueLayer/DialogueLayer';
import { CompareMemory, Convergence, SoloMemory } from './EndingMemories';
import { OfficeReveal } from './OfficeReveal';
import { dialogueAt, ease, shotAt } from './endingTimeline';
import type { EndingProps } from './types';
import './ending.css';

/** One frame-driven scene. Only the visible scene (or three light memories) mounts. */
export function EndingComposition(props: EndingProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const shot = shotAt(seconds);
  const local = seconds - shot.start;
  const dialogue = dialogueAt(seconds);
  return <AbsoluteFill className="end-stage" data-shot={shot.id} data-reduced-motion={props.reducedMotion}>
    {seconds < 17 && <div className="end-compare-scene" style={{ opacity: ease(seconds, 0, .65) * (1 - ease(seconds, 14.8, 2.2)) }}>
      <CompareMemory {...props} time={seconds} />
      <div className="end-dialogue-shade" />
    </div>}
    {seconds >= 17 && seconds < 20.2 && <SoloMemory {...props} level={1} time={local} duration={3.2} />}
    {seconds >= 20.2 && seconds < 23.8 && <SoloMemory {...props} level={2} time={local} duration={3.6} />}
    {seconds >= 23.8 && seconds < 27.4 && <SoloMemory {...props} level={3} time={local} duration={3.6} />}
    {seconds >= 27.4 && seconds < 31 && <Convergence {...props} time={local} />}
    {seconds >= 31 && <OfficeReveal {...props} seconds={seconds} />}
    {dialogue && <div style={{ opacity: ease(seconds, dialogue.start, .28) * (1 - ease(seconds, dialogue.end - .18, .18)) }}>
      <div className="end-speaker">{dialogue.speaker}</div>
      <DialogueLayer style={{ fontSize: 27, lineHeight: 1.45, bottom: '8%', left: '14%', right: '14%' }}>{dialogue.text}</DialogueLayer>
    </div>}
    <div className="end-film-vignette" aria-hidden="true" />
  </AbsoluteFill>;
}
