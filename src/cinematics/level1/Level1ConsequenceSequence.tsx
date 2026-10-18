import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Player, type PlayerRef, type CallbackListener } from '@remotion/player';
import { useReducedMotion } from 'framer-motion';
import officeBackground from '../../../assets/backgrounds/BG_Office_FirstPerson_v01.png';
import type { CinematicComplete, CinematicRequest } from '../../shared/contracts';
import { useSceneAudio } from '../../useSceneAudio';
import { Level1Composition } from './Level1Composition';
import { branches, LEVEL1, partStart, type PreviewPart } from './level1Content';

export type Level1Request = Extract<CinematicRequest, { cinematicId: 'level1' }>;
export type Level1SequenceProps = {
  readonly request: Level1Request;
  readonly playerName?: string;
  readonly onComplete?: (completion: CinematicComplete) => void;
  readonly playerRef?: RefObject<PlayerRef | null>;
  /** Used by the independent development preview, never gameplay selection. */
  readonly previewPart?: PreviewPart;
  readonly onPreviewEnd?: () => void;
  readonly reduceMotion?: boolean;
};

export function Level1ConsequenceSequence(props: Level1SequenceProps) {
  // Each request is an immutable run; rerenders cannot change or replay it.
  return <SequenceRun key={props.request.requestId} {...props} />;
}

function SequenceRun({ request, playerName, onComplete, playerRef, previewPart = 'full', onPreviewEnd, reduceMotion }: Level1SequenceProps) {
  const [snapshot] = useState(() => ({ ...request, input: { ...request.input } }));
  const internalRef = useRef<PlayerRef>(null);
  const ref = playerRef ?? internalRef;
  const completed = useRef(false);
  const callbacks = useRef({ onComplete, onPreviewEnd });
  callbacks.current = { onComplete, onPreviewEnd };
  const reducedPreference = useReducedMotion();
  const audio = useSceneAudio();
  const [assets, setAssets] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playbackError, setPlaybackError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([...new Set([branches[snapshot.input.selectedMetric].plate, branches['in-class-participation'].plate, officeBackground])].map(source => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Cinematic image unavailable'));
      image.src = source;
    }))).then(() => { if (active) setAssets('ready'); }, () => { if (active) setAssets('error'); });
    return () => { active = false; };
  }, [snapshot]);

  useEffect(() => {
    const player = ref.current;
    if (!player || assets !== 'ready') return;
    let playing = false;
    let inOffice = false;
    let notified = false;
    const ended = () => {
      audio.reset();
      callbacks.current.onPreviewEnd?.();
      if (previewPart !== 'full' || completed.current) return;
      completed.current = true;
      callbacks.current.onComplete?.({ type: 'animationComplete', requestId: snapshot.requestId, cinematicId: snapshot.cinematicId });
    };
    const play = () => {
      playing = true;
      inOffice = player.getCurrentFrame() / LEVEL1.fps >= LEVEL1.branch + LEVEL1.common;
      if (inOffice) audio.startOffice(); else audio.startClassroom();
    };
    const pause = () => { playing = false; audio.reset(); };
    const frame: CallbackListener<'frameupdate'> = ({ detail }) => {
      if (!playing) return;
      const officeTime = detail.frame / LEVEL1.fps - LEVEL1.branch - LEVEL1.common;
      if (officeTime >= 0 && !inOffice) { inOffice = true; audio.startOffice(); audio.fadeClassroomOut(); }
      if (officeTime >= 1.4 && !notified) { notified = true; audio.play('notification'); }
    };
    const error = () => { audio.reset(); setPlaybackError(true); };
    player.addEventListener('ended', ended);
    player.addEventListener('play', play);
    player.addEventListener('pause', pause);
    player.addEventListener('frameupdate', frame);
    player.addEventListener('error', error);
    return () => {
      player.removeEventListener('ended', ended);
      player.removeEventListener('play', play);
      player.removeEventListener('pause', pause);
      player.removeEventListener('frameupdate', frame);
      player.removeEventListener('error', error);
      audio.reset(); // Interruption is not completion.
    };
  }, [assets, ref, snapshot, previewPart, audio.reset, audio.startOffice, audio.startClassroom, audio.fadeClassroomOut, audio.play]);

  const inputProps = useMemo(() => ({ selectedMetric: snapshot.input.selectedMetric, playerName, prediction: snapshot.input.playerPrediction, reducedMotion: reduceMotion ?? Boolean(reducedPreference) }), [snapshot, playerName, reduceMotion, reducedPreference]);
  if (!snapshot.input.runRequested) return <p role="status">Waiting for the supplied cinematic request.</p>;
  if (assets === 'error' || playbackError) return <p role="alert">The cinematic could not load. Reload to try again; no completion was sent.</p>;
  if (assets !== 'ready') return <p role="status">Preparing the selected scene…</p>;
  return (
    <div className="l1-player-shell">
      <Player ref={ref} component={Level1Composition} inputProps={inputProps} compositionWidth={1280} compositionHeight={720} fps={LEVEL1.fps}
        durationInFrames={Math.round(LEVEL1.duration * LEVEL1.fps)} inFrame={Math.round(partStart(previewPart) * LEVEL1.fps)}
        outFrame={previewPart === 'common' ? Math.round((LEVEL1.branch + LEVEL1.common) * LEVEL1.fps) - 1 : undefined}
        initialFrame={Math.round(partStart(previewPart) * LEVEL1.fps)} controls moveToBeginningWhenEnded={false} acknowledgeRemotionLicense
        showVolumeControls={false} style={{ width: '100%', aspectRatio: '16 / 9' }} errorFallback={() => <p role="alert">Playback stopped. Reload to retry.</p>} />
      {audio.available && <button className="l1-sound" onClick={audio.toggleMuted} aria-pressed={audio.muted}>{audio.muted ? 'Sound off' : 'Sound on'}</button>}
    </div>
  );
}
