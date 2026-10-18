import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { MetricId } from '../../shared/contracts';
import { DialogueLayer } from '../shared/engine/DialogueLayer/DialogueLayer';
import { CinematicCamera } from '../shared/engine/CinematicCamera/CinematicCamera';
import { EnvironmentMotion } from '../shared/engine/EnvironmentMotion/EnvironmentMotion';
import { ConsequenceScene } from './ConsequenceScene';
import { SomethingFeelsWrong } from './SomethingFeelsWrong';
import { branches, COMMON_LINE, LEVEL1 } from './level1Content';
import '../../styles.css';
import './level1.css';

export type Level1CompositionProps = {
  readonly selectedMetric: MetricId;
  readonly playerName?: string;
  readonly prediction?: string;
  readonly reducedMotion?: boolean;
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

function SpokenLine({ seconds, start, end, text, player = false }: { seconds: number; start: number; end: number; text: string; player?: boolean }) {
  if (seconds < start || seconds >= end) return null;
  const opacity = interpolate(seconds, [start, start + 0.18, end - 0.18, end], [0, 1, 1, 0], clamp);
  return (
    <div className="l1-spoken" data-speaker={player ? 'player' : 'alex'}>
      <div className="l1-dialogue-shade" aria-hidden="true" style={{ opacity }} />
      <p className="l1-speaker" style={{ opacity }}>{player ? 'You' : 'Alex'}</p>
      <DialogueLayer opacity={opacity} style={{ bottom: '7%', left: '10%', right: '10%', fontSize: '2.15cqw', lineHeight: 1.5, fontStyle: player ? 'italic' : 'normal' }}>{text}</DialogueLayer>
    </div>
  );
}

/** One shared ending follows whichever single branch was supplied. */
export function CommonEnding({ metric, seconds, reducedMotion }: { metric: MetricId; seconds: number; reducedMotion: boolean }) {
  const arrival = interpolate(seconds, [0, 0.4], [0, 1], clamp);
  return (
    <>
      {seconds < 0.4 && <ConsequenceScene metric={metric} seconds={LEVEL1.branch} reducedMotion={reducedMotion} />}
      <div className="l1-scene l1-common" style={{ opacity: arrival }}>
        <CinematicCamera pose={{ scale: reducedMotion ? 1.15 : interpolate(seconds, [0, 4], [1.15, 1.22], clamp), x: 7, y: 2, vignette: 0.3 }}>
          {/* One shared, pleased Alex shot. This is a plate, not a facial rig. */}
          <Img className="l1-common-plate" src={branches['in-class-participation'].plate} alt="Alex, looking eagerly toward you in the classroom." />
          <EnvironmentMotion progress={reducedMotion ? 0 : seconds / 45} seed={21} style={{ opacity: 0.2 }} />
        </CinematicCamera>
      </div>
      <SpokenLine seconds={seconds} start={0.15} end={3.9} text={COMMON_LINE} />
    </>
  );
}

/** Pure presentation: frames own the clock, gameplay owns all outcome decisions. */
export function Level1Composition({ selectedMetric, playerName, prediction, reducedMotion = false }: Level1CompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;
  const branch = branches[selectedMetric];
  const officeStart = LEVEL1.branch + LEVEL1.common;
  const officeTime = seconds - officeStart;
  return (
    <AbsoluteFill className="l1-film" data-metric={selectedMetric} data-phase={seconds < LEVEL1.branch ? 'branch' : seconds < officeStart ? 'common' : 'office'}>
      {seconds < officeStart + 1.4 && (
        <div className="l1-scene" style={{ opacity: officeTime < 0 ? 1 : interpolate(officeTime, [0, 1.4], [1, 0], clamp) }}>
          {seconds < LEVEL1.branch ? (
            <>
              <ConsequenceScene metric={selectedMetric} seconds={seconds} reducedMotion={reducedMotion} />
              <SpokenLine seconds={seconds} start={2.2} end={5.3} text={branch.boast} />
              <SpokenLine seconds={seconds} start={5.5} end={8.2} text={branch.question} player />
              <SpokenLine seconds={seconds} start={8.9} end={12.1} text={branch.reveal} />
            </>
          ) : <CommonEnding metric={selectedMetric} seconds={Math.min(seconds - LEVEL1.branch, 3.99)} reducedMotion={reducedMotion} />}
        </div>
      )}
      {officeTime >= 0 && (
        <div className="l1-scene" style={{ opacity: interpolate(officeTime, [0, 1.4], [0, 1], clamp) }}>
          <SomethingFeelsWrong metric={selectedMetric} seconds={officeTime} playerName={playerName} prediction={prediction} reducedMotion={reducedMotion}
            memory={<ConsequenceScene metric={selectedMetric} seconds={10.6} reducedMotion />} />
        </div>
      )}
      <div className="l1-film-grain" aria-hidden="true" />
    </AbsoluteFill>
  );
}
