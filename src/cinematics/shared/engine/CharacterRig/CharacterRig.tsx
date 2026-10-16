import type { ReactNode } from 'react';
import type { ArmPose, CharacterPose, Expression, GazeDirection } from '../types';

export type CharacterRigLayers = Partial<{
  body: ReactNode;
  head: ReactNode;
  arms: Partial<Record<ArmPose, ReactNode>>;
  eyes: Partial<Record<GazeDirection, ReactNode>>;
  eyebrows: Partial<Record<Expression, ReactNode>>;
  mouth: Partial<Record<Expression, ReactNode>>;
}>;

type CharacterRigProps = {
  pose: CharacterPose;
  previousPose?: CharacterPose;
  blend?: number;
  layers?: CharacterRigLayers;
  breathing?: number;
  label?: string;
};

const gazeOffset = {
  center: [0, 0],
  left: [-4, 0],
  right: [4, 0],
  down: [0, 3],
} as const;

function DefaultEyes({ gaze, blink, target }: { gaze: GazeDirection; blink: number; target?: { x: number; y: number } }) {
  const [directionX, directionY] = gazeOffset[gaze];
  const x = target ? Math.max(-4, Math.min(4, target.x * 4)) : directionX;
  const y = target ? Math.max(-3, Math.min(3, target.y * 3)) : directionY;
  return (
    <g style={{ transformBox: 'fill-box', transformOrigin: 'center', scale: `1 ${Math.max(0.06, 1 - blink)}` }}>
      <ellipse cx="111" cy="115" rx="15" ry="10" fill="#f8efe0" />
      <ellipse cx="169" cy="115" rx="15" ry="10" fill="#f8efe0" />
      <circle cx={111 + x} cy={115 + y} r="5" fill="#24313c" />
      <circle cx={169 + x} cy={115 + y} r="5" fill="#24313c" />
    </g>
  );
}

function DefaultEyebrows({ expression }: { expression: Expression }) {
  const raised = expression === 'surprised' || expression === 'pleased' ? -5 : 0;
  const concerned = expression === 'concerned' || expression === 'uncertain';
  return (
    <g fill="none" stroke="#372d2c" strokeLinecap="round" strokeWidth="5">
      <path d={`M96 ${93 + raised} Q111 ${concerned ? 88 : 87 + raised} 125 ${93 + raised}`} />
      <path d={`M155 ${93 + raised} Q169 ${concerned ? 88 : 87 + raised} 184 ${93 + raised}`} />
    </g>
  );
}

function DefaultMouth({ expression }: { expression: Expression }) {
  if (expression === 'surprised') return <ellipse cx="140" cy="157" rx="8" ry="11" fill="#6e3f43" />;
  if (expression === 'pleased') return <path d="M124 153 Q140 168 157 151" fill="none" stroke="#6e3f43" strokeLinecap="round" strokeWidth="5" />;
  if (expression === 'uncertain' || expression === 'concerned') return <path d="M124 158 Q134 151 143 158 Q151 164 159 157" fill="none" stroke="#6e3f43" strokeLinecap="round" strokeWidth="5" />;
  return <path d="M127 157 Q140 160 154 157" fill="none" stroke="#6e3f43" strokeLinecap="round" strokeWidth="5" />;
}

function Face({ pose, layers, opacity = 1 }: { pose: CharacterPose; layers: CharacterRigLayers; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {layers.eyes?.[pose.gaze] ?? <DefaultEyes gaze={pose.gaze} blink={pose.blink} target={pose.gazeTarget} />}
      {layers.eyebrows?.[pose.expression] ?? <DefaultEyebrows expression={pose.expression} />}
      {layers.mouth?.[pose.expression] ?? <DefaultMouth expression={pose.expression} />}
    </g>
  );
}

export function CharacterRig({ pose, previousPose, blend = 1, layers = {}, breathing = 0, label = 'Temporary layered character' }: CharacterRigProps) {
  const armPose = pose.arms ?? 'idle';

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width: '100%',
        height: '100%',
        translate: `0 ${pose.headY + breathing * 2}px`,
        scale: `${1 + breathing * 0.008}`,
        transformOrigin: '50% 88%',
      }}
    >
      <svg viewBox="0 0 280 420" width="100%" height="100%" aria-hidden="true">
        <g>{layers.body ?? <path d="M68 408 Q74 257 140 246 Q206 257 214 408Z" fill="#364c61" />}</g>
        <g>{layers.arms?.[armPose] ?? <><path d="M90 284 Q53 320 55 404" fill="none" stroke="#2c3f52" strokeWidth="35" strokeLinecap="round" /><path d="M190 284 Q226 320 225 404" fill="none" stroke="#2c3f52" strokeWidth="35" strokeLinecap="round" /></>}</g>
        <g style={{ transformBox: 'fill-box', transformOrigin: '50% 85%', rotate: `${pose.headTilt}deg` }}>
          {layers.head ?? <><path d="M89 55 Q140 17 191 55 L187 153 Q178 211 140 225 Q102 211 93 153Z" fill="#d79a72" /><path d="M86 84 Q92 28 143 28 Q194 30 196 91 Q169 64 90 94Z" fill="#443637" /></>}
          {previousPose && blend < 1 && <Face pose={previousPose} layers={layers} opacity={1 - blend} />}
          <Face pose={pose} layers={layers} opacity={previousPose ? blend : 1} />
        </g>
      </svg>
    </div>
  );
}
