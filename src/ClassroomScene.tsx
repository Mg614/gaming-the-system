import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ClassroomAmbient from './ClassroomAmbient';
import { STUDENTS } from './classroomMedia';

type StudentId = 'sleeping' | 'phone' | 'unprepared';
type Phase = 'waiting' | 'establishing' | 'explore' | 'focus' | 'response' | 'returnWide' | 'settle' | 'thought' | 'exitCue' | 'exitFocus' | 'leaving';
type Cue = 'studentInspect' | 'transition';

const WIDE = { scale: 1.01, x: '0%', y: '0%' };
const EXIT_CUE = { scale: 1.09, x: '-3%', y: '0%' };
const EXIT_FOCUS = { scale: 1.6, x: '-27%', y: '5%' };

export default function ClassroomScene({ active, onReturn, play, startClassroom, fadeClassroomOut }: {
  active: boolean;
  onReturn: () => void;
  play: (cue: Cue) => void;
  startClassroom: () => void;
  fadeClassroomOut: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [selected, setSelected] = useState<StudentId | null>(null);
  const [sleepingInspected, setSleepingInspected] = useState(false);
  const [phoneInspected, setPhoneInspected] = useState(false);
  const [unpreparedInspected, setUnpreparedInspected] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const interactionLock = useRef(false);
  const activeButton = useRef<HTMLButtonElement | null>(null);
  const returnButton = useRef<HTMLButtonElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const allInspected = sleepingInspected && phoneInspected && unpreparedInspected;
  const inspected = { sleeping: sleepingInspected, phone: phoneInspected, unprepared: unpreparedInspected };
  const focused = STUDENTS.find(student => student.id === selected);
  const camera = ['focus', 'response'].includes(phase) && focused ? focused.camera
    : phase === 'exitCue' ? EXIT_CUE
    : ['exitFocus', 'leaving'].includes(phase) ? EXIT_FOCUS : WIDE;

  useEffect(() => {
    if (!active) {
      setPhase('waiting'); setSelected(null);
      setSleepingInspected(false); setPhoneInspected(false); setUnpreparedInspected(false);
      interactionLock.current = false;
      return;
    }
    if (mediaReady && phase === 'waiting') {
      startClassroom();
      setPhase('establishing');
    }
  }, [active, mediaReady, phase, startClassroom]);

  useEffect(() => {
    if (!active) return;
    let delay: number;
    let advance: () => void;
    switch (phase) {
      case 'establishing': delay = 2600; advance = () => setPhase('explore'); break;
      case 'focus': delay = reducedMotion ? 250 : 1400; advance = () => setPhase('response'); break;
      case 'response':
        delay = 2700;
        advance = () => {
          if (selected === 'sleeping') setSleepingInspected(true);
          if (selected === 'phone') setPhoneInspected(true);
          if (selected === 'unprepared') setUnpreparedInspected(true);
          setPhase('returnWide');
        };
        break;
      case 'returnWide': delay = reducedMotion ? 250 : 1500; advance = () => { setSelected(null); interactionLock.current = false; setPhase(allInspected ? 'settle' : 'explore'); }; break;
      case 'settle': delay = 1600; advance = () => setPhase('thought'); break;
      case 'thought': delay = 2400; advance = () => setPhase('exitCue'); break;
      case 'exitFocus': delay = reducedMotion ? 350 : 1700; advance = () => { fadeClassroomOut(); setPhase('leaving'); }; break;
      case 'leaving': delay = 1300; advance = onReturn; break;
      default: return;
    }
    const timer = window.setTimeout(advance, delay);
    return () => window.clearTimeout(timer);
  }, [active, phase, selected, allInspected, reducedMotion, onReturn, fadeClassroomOut]);

  useEffect(() => {
    if (phase === 'explore' && !allInspected) {
      const button = activeButton.current ?? world.current?.querySelector<HTMLButtonElement>('.student-hotspot');
      button?.focus({ preventScroll: true });
    }
    if (phase === 'exitCue') returnButton.current?.focus({ preventScroll: true });
  }, [phase, allInspected]);

  return (
    <motion.div ref={world} className="classroom-world" aria-label="First-person classroom" aria-hidden={!active} inert={!active} data-phase={phase} initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: active ? 1.2 : 0 }}>
      <motion.div className="classroom-camera" initial={WIDE} animate={camera} transition={{ duration: reducedMotion ? 0 : 1.5, ease: 'easeInOut' }}>
        <ClassroomAmbient active={active} onReady={setMediaReady} />
        <div className="classroom-interactions" aria-label="Student observations">
        {STUDENTS.map(student => (
          <button key={student.id} className={`student-hotspot hotspot-${student.id}`} style={student.hotspot} aria-label={student.label} data-inspected={inspected[student.id]} disabled={!active || phase !== 'explore'} onClick={event => {
            if (interactionLock.current || phase !== 'explore') return;
            interactionLock.current = true;
            activeButton.current = event.currentTarget;
            setSelected(student.id); play('studentInspect'); setPhase('focus');
          }} />
        ))}
        </div>
        <AnimatePresence>
          {phase === 'exitCue' && <motion.button key="exit" ref={returnButton} className="classroom-exit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} onClick={() => {
            if (interactionLock.current) return;
            interactionLock.current = true; play('transition'); setPhase('exitFocus');
          }}>RETURN TO OFFICE</motion.button>}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {phase === 'explore' && !sleepingInspected && !phoneInspected && !unpreparedInspected && <motion.p key="look" className="classroom-look" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>Look around.</motion.p>}
        {phase === 'response' && focused && <motion.p key={focused.id} className={`student-dialogue ${focused.id === 'sleeping' ? 'sleeping-response' : ''}`} role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>{focused.id === 'sleeping' ? focused.dialogue : `“${focused.dialogue}”`}</motion.p>}
        {phase === 'thought' && <motion.p key="thought" className="classroom-thought" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>Okay... this is worse than I thought.</motion.p>}
      </AnimatePresence>
      <motion.div className="classroom-exposure" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: !active || phase === 'waiting' || phase === 'leaving' ? 1 : 0 }} transition={{ duration: reducedMotion ? 0.2 : 1.2 }} />
      {active && phase === 'waiting' && <p className="load-status" role="status">Entering the classroom…</p>}
    </motion.div>
  );
}
