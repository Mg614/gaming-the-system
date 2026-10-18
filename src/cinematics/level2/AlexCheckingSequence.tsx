import look from '../../../assets/characters/alex-rig/production/actions/checking/ALEX-PROD-005-CLEAN.png';
import hand from '../../../assets/characters/alex-rig/production/actions/checking/ALEX-HAND-CHECKING.png';
import reaction from '../../../assets/characters/alex-rig/production/expressions/ALEX-PROD-003 — Pleased.png';
import { ChecklistSystem } from './ChecklistSystem';
import { alexCheckingFrame } from './alexCheckingTimeline';
import './alexChecking.css';

/** Reusable three-shot insert. No independent timers, baked checks or gameplay state.
 * Identity/framing reference: CHAR-L1-001 — Alex Character Set (existing asset).
 */
export function AlexCheckingSequence({ elapsed, reducedMotion = false }: { elapsed: number; reducedMotion?: boolean }) {
  const frame = alexCheckingFrame(elapsed);
  // Follow ChecklistSystem's actual SVG stroke: M3 10.5 L8 15 L18 3.
  const firstLeg = Math.hypot(5, 4.5) / (Math.hypot(5, 4.5) + Math.hypot(10, 12));
  const leg = frame.mark <= firstLeg ? frame.mark / firstLeg : (frame.mark - firstLeg) / (1 - firstLeg);
  const x = frame.mark <= firstLeg ? 3 + 5 * leg : 8 + 10 * leg;
  const y = frame.mark <= firstLeg ? 10.5 + 4.5 * leg : 15 - 12 * leg;
  const hover = frame.approach * (reducedMotion ? 0 : 32) + frame.lift * (reducedMotion ? 0 : 38);
  return (
    <div className={`l2-checking l2-checking--${frame.shot}`} data-checking-shot={frame.shot} data-pen-contact={frame.shot === 'insert' && frame.approach === 0 && frame.lift === 0}>
      {frame.shot === 'insert' ? (
        <div className="l2-checking-desk">
          <div className="l2-checking-notebook">
            <ChecklistSystem count={3} mode="complete" progress={frame.progress} reducedMotion={reducedMotion}
              markOverlay={{ criterion: 3, content: <span className="l2-checking-pen-anchor" style={{ left: `${-15 + x * 7}%`, top: `${-30 + y * 7 - hover}%` }}>
                <img className="l2-checking-hand" src={hand} alt="" draggable={false} />
              </span> }} />
          </div>
        </div>
      ) : (
        <img className="l2-checking-portrait" src={frame.shot === 'look' ? look : reaction} alt={frame.shot === 'look' ? 'Alex looks down at his checklist.' : 'Alex gives a small, satisfied smile.'}
          style={{ transform: `scale(${reducedMotion ? 1 : 1 + frame.push * 0.025})` }} />
      )}
      <div className="l2-checking-light" aria-hidden="true" />
    </div>
  );
}
