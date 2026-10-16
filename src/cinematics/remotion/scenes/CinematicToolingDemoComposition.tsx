import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CharacterRig } from '../../shared/engine/CharacterRig/CharacterRig';
import { CinematicCamera } from '../../shared/engine/CinematicCamera/CinematicCamera';
import { DialogueLayer } from '../../shared/engine/DialogueLayer/DialogueLayer';
import { EnvironmentMotion } from '../../shared/engine/EnvironmentMotion/EnvironmentMotion';
import { pulse } from '../../shared/engine/timeline/animationMath';
import type { CharacterPose, Expression, GazeDirection } from '../../shared/engine/types';

export type CinematicToolingDemoProps = { readonly label: string };

export const CinematicToolingDemoComposition = ({ label }: CinematicToolingDemoProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const gaze: GazeDirection = frame < 1.4 * fps ? 'center' : frame < 3.7 * fps ? 'right' : frame < 4.5 * fps ? 'down' : 'center';
  const expression: Expression = frame >= 2.2 * fps && frame < 5.2 * fps ? 'uncertain' : 'neutral';
  const blink = Math.max(pulse(frame, 0.92 * fps, 1.0 * fps, 1.1 * fps), pulse(frame, 3.88 * fps, 3.96 * fps, 4.08 * fps));
  const pose: CharacterPose = {
    gaze,
    expression,
    blink,
    headTilt: interpolate(frame, [2.7 * fps, 3.4 * fps, 5.1 * fps, 5.8 * fps], [0, 3.5, 3.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    headY: interpolate(frame, [3.2 * fps, 3.8 * fps, 5.2 * fps], [0, 2, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  };
  const breathing = Math.sin((frame / fps) * Math.PI * 0.65);

  return (
    <AbsoluteFill style={{ backgroundColor: '#101923', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>
      <CinematicCamera pose={{
        scale: interpolate(frame, [0, 2.2 * fps, 4.7 * fps, durationInFrames - 1], [1, 1.015, 1.085, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        x: interpolate(frame, [0, 4.7 * fps, durationInFrames - 1], [0, -1.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        y: 0,
        vignette: 0.48,
      }}>
        <AbsoluteFill style={{ background: 'linear-gradient(145deg, #263a4c, #111923 72%)' }}>
          <div style={{ position: 'absolute', left: '8%', top: '10%', width: '27%', height: '44%', border: '10px solid #202c37', background: 'linear-gradient(135deg, #d6e6e9, #8da8b7)', boxShadow: 'inset 0 0 60px #fff7d844' }} />
          <div style={{ position: 'absolute', left: '6%', right: '6%', bottom: '7%', height: '18%', borderRadius: '14px 14px 0 0', background: '#503f36', boxShadow: '0 -12px 30px #0005' }} />
          <EnvironmentMotion progress={frame / durationInFrames} seed={11} />
          <div style={{ position: 'absolute', left: '50%', bottom: '9%', width: '29%', height: '72%', translate: '-50% 0' }}>
            <CharacterRig pose={pose} breathing={breathing} label="Temporary layered SVG character for tooling validation" />
          </div>
          <div style={{ position: 'absolute', top: 32, left: 42, color: '#efd5a7', fontFamily: 'Arial, sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>{label}</div>
          <div style={{ position: 'absolute', right: 42, top: 32, color: '#ffffff88', fontFamily: 'Arial, sans-serif', fontSize: 16, letterSpacing: 2 }}>TEMPORARY SVG • NOT PRODUCTION ART</div>
        </AbsoluteFill>
      </CinematicCamera>
      <DialogueLayer
        opacity={interpolate(frame, [3.55 * fps, 3.8 * fps, 5.0 * fps, 5.3 * fps], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        style={{ fontSize: 34 }}
      >
        “Wait… was that the intended answer?”
      </DialogueLayer>
    </AbsoluteFill>
  );
};
