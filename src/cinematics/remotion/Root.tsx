import { Composition, Folder, registerRoot } from 'remotion';
import { CinematicToolingDemoComposition } from './scenes/CinematicToolingDemoComposition';
import { Level1Composition } from '../level1/Level1Composition';

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
    <Composition
      id="Level1Consequences"
      component={Level1Composition}
      durationInFrames={1002}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ selectedMetric: 'pre-class-preparation', playerName: 'Taylor', prediction: '', reducedMotion: false }}
    />
  </Folder>
);

registerRoot(RemotionRoot);
