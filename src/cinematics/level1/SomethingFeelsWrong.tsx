import type { ReactNode } from 'react';
import { Easing, Img, interpolate } from 'remotion';
import officeBackground from '../../../assets/backgrounds/BG_Office_FirstPerson_v01.png';
import type { MetricId } from '../../shared/contracts';
import { DialogueLayer } from '../shared/engine/DialogueLayer/DialogueLayer';
import { branches, BRIDGE_LINE, FIRST_THOUGHT, metricIds, SECOND_THOUGHT } from './level1Content';
import './office.css';

export type SomethingFeelsWrongProps = {
  readonly metric: MetricId;
  /** Local office time in seconds; the parent owns playback and arrival fades. */
  readonly seconds: number;
  readonly playerName?: string;
  readonly prediction?: string;
  readonly reducedMotion: boolean;
  readonly memory: ReactNode;
};

const clamped = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const cameraEasing = { ...clamped, easing: Easing.bezier(0.33, 0, 0.2, 1) };

/** Presentation only: the supplied metric is already successful when this scene begins. */
export function SomethingFeelsWrong({ metric, seconds, playerName, prediction, reducedMotion, memory }: SomethingFeelsWrongProps) {
  const name = playerName?.trim();
  const greeting = name ? `Great work, ${name}!` : 'Great work!';
  const firstThought = seconds >= 7.1 && seconds < 10.1;
  const secondThought = seconds >= 11.2 && seconds < 13.7;
  const bridge = seconds >= 13.8;

  return (
    <div className="l1-office" aria-label="Your sunlit office">
      {/* Original opening camera geometry and laptop placement stay together. */}
      <div
        className="office-camera"
        style={{
          scale: reducedMotion ? 2.65 : interpolate(seconds, [0, 1.4, 2.3, 3.25, 6, 7.1, 10.1, 11.2, 13.7, 16.8], [1.08, 2.25, 2.25, 3.05, 3.05, 2.65, 2.65, 2.6, 1.35, 1.32], cameraEasing),
          translate: reducedMotion ? '62.275% -1.325%' : `${interpolate(seconds, [0, 1.4, 2.3, 3.25, 6, 7.1, 10.1, 11.2, 13.7, 16.8], [0, 52.875, 52.875, 71.675, 71.675, 62.275, 62.275, 61.1, 8, 8], cameraEasing)}% ${interpolate(seconds, [0, 1.4, 2.3, 3.25, 6, 7.1, 10.1, 11.2, 13.7, 16.8], [0, -1.125, -1.125, -1.525, -1.525, -1.325, -1.325, -1.3, 0, 0], cameraEasing)}%`,
        }}
      >
        <Img className="office-background" src={officeBackground} alt="Your desk, laptop, plants and office door in warm afternoon light." />
        <div className="laptop-screen">
          <div
            className="screen-cue"
            aria-hidden="true"
            style={{ opacity: interpolate(seconds, [0, 1.1, 1.4, 2.3, 2.8], [0, 0, 0.24, 0.24, 0], clamped) }}
          />
          {seconds >= 1.4 && seconds < 2.6 && (
            <div
              className="notification"
              role="status"
              style={{ opacity: interpolate(seconds, [1.4, 1.7, 2.3, 2.6], [0, 1, 1, 0], clamped) }}
            >
              <span className="envelope" aria-hidden="true">✉</span>
              <span><strong>University Management</strong><span className="notification-detail">New message <i aria-hidden="true" /></span><b>Great work!</b></span>
            </div>
          )}
          {seconds >= 2.3 && (
            <article
              className="email"
              aria-label="Email from University Management"
              style={{ opacity: interpolate(seconds, [2.3, 2.85], [0, 1], clamped) }}
            >
              <header className="mail-bar"><span aria-hidden="true">✉</span> University <span className="inbox-label">INBOX / 1</span></header>
              <div className="mail-content">
                <div className="sender"><span className="sender-seal" aria-hidden="true">U</span><div><small>From</small><strong>University Management</strong></div><time>Just now</time></div>
                <h2>{greeting}</h2>
                <p>Student engagement has improved significantly!</p>
                <p className="l1-office-signature">University Management</p>
                {seconds >= 6 && (
                  <div
                    className="l1-office-result"
                    role="status"
                    style={{ opacity: interpolate(seconds, [6, 6.6], [0, 1], clamped) }}
                  >
                    <small>Selected metric</small>
                    <strong>{branches[metric].label}</strong>
                    <span><span aria-hidden="true">✓</span> TARGET ACHIEVED</span>
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      </div>

      <div className="l1-office-warmth" aria-hidden="true" style={{ opacity: reducedMotion ? 0.08 : interpolate(seconds, [0, 6, 13.7, 16.8], [0.08, 0.1, 0.05, 0.04], clamped) }} />
      <div className="vignette" aria-hidden="true" />
      <div className="l1-office-thought-shade" aria-hidden="true" style={{ opacity: interpolate(seconds, [6.5, 7.1, 13.8, 16.8], [0, 0.65, 0.8, 0.8], clamped) }} />

      {prediction?.trim() && seconds >= 7.6 && seconds < 9.75 && (
        <p className="l1-office-prediction" style={{ opacity: interpolate(seconds, [7.6, 8.1, 9.25, 9.75], [0, 0.42, 0.42, 0], clamped) }}>
          <small>Your earlier prediction</small>“{prediction.trim()}”
        </p>
      )}

      {firstThought && (
        <DialogueLayer opacity={interpolate(seconds, [7.1, 7.65, 9.75, 10.1], [0, 1, 1, 0], clamped)} style={{ fontSize: '2.05cqw', lineHeight: 1.6, fontStyle: 'italic', bottom: '8.2%', left: '10%', right: '10%' }}>
          {FIRST_THOUGHT}
        </DialogueLayer>
      )}

      {/* Exactly one memory of the selected branch, between the two thoughts. */}
      {seconds >= 10.2 && seconds < 11.1 && (
        <div
          className="l1-office-memory"
          aria-label="A brief memory of Alex's response"
          style={{
            opacity: interpolate(seconds, [10.2, 10.43, 10.83, 11.1], [0, reducedMotion ? 0.45 : 0.66, reducedMotion ? 0.45 : 0.66, 0], clamped),
            scale: reducedMotion ? 1 : interpolate(seconds, [10.2, 11.1], [1.01, 1.035], clamped),
            filter: reducedMotion ? undefined : 'blur(1.3px)',
          }}
        >
          {memory}
        </div>
      )}

      {secondThought && (
        <DialogueLayer opacity={interpolate(seconds, [11.2, 11.7, 13.35, 13.7], [0, 1, 1, 0], clamped)} style={{ fontSize: '2.05cqw', lineHeight: 1.6, fontStyle: 'italic', bottom: '8.2%' }}>
          {SECOND_THOUGHT}
        </DialogueLayer>
      )}

      {bridge && (
        <>
          <ul className="l1-office-concepts" aria-label="Possible measures">
            {metricIds.map((id, index) => (
              <li key={id} style={{ opacity: interpolate(seconds, [13.8 + index * 0.16, 14.65 + index * 0.16], [0, 0.62], clamped) }}>
                {branches[id].label}
              </li>
            ))}
          </ul>
          <DialogueLayer opacity={interpolate(seconds, [13.8, 14.5], [0, 1], clamped)} style={{ fontSize: '2.2cqw', lineHeight: 1.6, fontStyle: 'italic', bottom: '8.2%' }}>
            {BRIDGE_LINE}
          </DialogueLayer>
        </>
      )}
    </div>
  );
}
