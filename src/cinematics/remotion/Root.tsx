import { Composition, Folder, registerRoot } from 'remotion';
import { CinematicToolingDemoComposition } from './scenes/CinematicToolingDemoComposition';

export const RemotionRoot = () => (
  <Folder name="Cinematic-Tooling">
    <Composition
      id="CinematicToolingDemo"
      component={CinematicToolingDemoComposition}
      durationInFrames={180}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ label: 'TIMELINE / REMOTION' }}
    />
  </Folder>
);

registerRoot(RemotionRoot);
