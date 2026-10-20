import { Composition, registerRoot } from 'remotion';
import { EndingStudioComposition } from './devInput';

// Separate development entry: the shared Studio root and prior modules stay intact.
const EndingStudioRoot = () => <Composition id="EndingTheoryReveal" component={EndingStudioComposition}
  width={1280} height={720} fps={30} durationInFrames={1746} defaultProps={{ reducedMotion: false }} />;
registerRoot(EndingStudioRoot);
