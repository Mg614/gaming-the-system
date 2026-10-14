import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import officeBackground from '../assets/backgrounds/BG_Office_FirstPerson_v01.png';
import { useSceneAudio } from './useSceneAudio';
import ClassroomScene from './ClassroomScene';

type Beat = 'title' | 'reveal' | 'identity' | 'seating' | 'quiet' | 'cue' | 'laptopFocus' | 'notification' | 'emailFocus' | 'reading' | 'thought' | 'ready' | 'pullback' | 'door' | 'depart' | 'classroom' | 'returnArrival' | 'officeEnd';
// WATCH beats advance automatically; ACT beats wait indefinitely.
const TIMELINE: Partial<Record<Beat, { next: Beat; ms: number }>> = {
  reveal: { next: 'identity', ms: 1800 }, seating: { next: 'quiet', ms: 2000 },
  quiet: { next: 'cue', ms: 1700 }, cue: { next: 'laptopFocus', ms: 650 },
  laptopFocus: { next: 'notification', ms: 2200 }, emailFocus: { next: 'reading', ms: 1800 },
  reading: { next: 'thought', ms: 1400 }, thought: { next: 'ready', ms: 1700 },
  pullback: { next: 'door', ms: 1900 }, door: { next: 'depart', ms: 2300 },
  depart: { next: 'classroom', ms: 1300 },
  returnArrival: { next: 'officeEnd', ms: 350 },
};
// A fixed centre origin: x = (50 - targetX) * scale, likewise for y.
const CAMERAS = {
  opening: { scale: 1.01, x: '0%', y: '0%' },
  seated: { scale: 1.08, x: '0%', y: '0%' },
  laptop: { scale: 2.25, x: '52.875%', y: '-1.125%' },
  email: { scale: 3.05, x: '71.675%', y: '-1.525%' },
  pullback: { scale: 1.25, x: '8%', y: '0%' },
  door: { scale: 2, x: '-47%', y: '6%' },
};

export default function App() {
  const [beat, setBeat] = useState<Beat>('title');
  const [playerName, setPlayerName] = useState('');
  const [draftName, setDraftName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const reducedMotion = useReducedMotion();
  const nameInput = useRef<HTMLInputElement>(null);
  const notification = useRef<HTMLButtonElement>(null);
  const subject = useRef<HTMLHeadingElement>(null);
  const visit = useRef<HTMLButtonElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const audio = useSceneAudio();
  const returnToOffice = useCallback(() => setBeat('returnArrival'), []);
  const emailOpen = ['emailFocus', 'reading', 'thought', 'ready'].includes(beat);
  const leaving = ['pullback', 'door', 'depart', 'classroom'].includes(beat);
  const laptopCue = ['cue', 'laptopFocus', 'notification'].includes(beat);
  const camera = emailOpen ? CAMERAS.email
    : ['laptopFocus', 'notification'].includes(beat) ? CAMERAS.laptop
    : beat === 'pullback' ? CAMERAS.pullback
    : ['door', 'depart', 'classroom'].includes(beat) ? CAMERAS.door
    : ['title', 'reveal', 'identity'].includes(beat) ? CAMERAS.opening : CAMERAS.seated;

  useEffect(() => {
    if (!loaded) return;
    const step = TIMELINE[beat];
    if (!step) return;
    const timer = window.setTimeout(() => setBeat(step.next), step.ms);
    return () => window.clearTimeout(timer);
  }, [beat, loaded]);
  useEffect(() => {
    if (beat === 'identity') nameInput.current?.focus({ preventScroll: true });
    if (beat === 'notification') notification.current?.focus({ preventScroll: true });
    if (beat === 'reading') subject.current?.focus({ preventScroll: true });
    if (beat === 'ready') visit.current?.focus({ preventScroll: true });
    if (beat === 'officeEnd') { audio.startOffice(); replay.current?.focus({ preventScroll: true }); }
    if (beat === 'cue') audio.play('notification');
    if (beat === 'depart') audio.fadeOfficeOut();
  }, [beat, audio.play, audio.fadeOfficeOut, audio.startOffice]);

  const fade = { duration: reducedMotion ? 0.2 : 1.2 };
  return (
    <main className="game-shell">
      <div className="stage" aria-label="First-person cinematic opening" data-beat={beat}>
        {/* One persistent world. All laptop content inherits the same camera transform. */}
        <motion.div className="office-camera" aria-hidden={beat === 'classroom'} inert={beat === 'classroom'} initial={CAMERAS.opening} animate={camera} transition={{ duration: reducedMotion ? 0 : beat === 'door' ? 2.3 : 1.9, ease: 'easeInOut' }}>
          <img className="office-background" src={officeBackground} alt="Your desk in a sunlit office, with a laptop to the left and an office door to the right." onLoad={() => setLoaded(true)} onError={() => setLoadError(true)} />
          <div className="laptop-screen">
            <motion.div className="screen-cue" aria-hidden="true" animate={{ opacity: laptopCue ? 0.35 : 0 }} transition={{ duration: 0.65 }} />
            <AnimatePresence>
              {beat === 'notification' && (
                <motion.button key="notification" ref={notification} className="notification" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} onClick={() => { audio.play('emailOpen'); setBeat('emailFocus'); }}>
                  <span className="envelope" aria-hidden="true">✉</span>
                  <span><strong>University Management</strong><span className="notification-detail">New message <i aria-hidden="true" /></span><b>Urgent Mission</b></span>
                </motion.button>
              )}
            </AnimatePresence>
            {(emailOpen || leaving) && (
              <motion.article className="email" initial={{ opacity: 0 }} animate={{ opacity: emailOpen ? 1 : 0 }} transition={{ duration: 0.7 }} inert={!emailOpen} aria-label="Email from University Management">
                <header className="mail-bar"><span aria-hidden="true">✉</span> University <span className="inbox-label">INBOX / 1</span></header>
                <div className="mail-content">
                  <div className="sender"><span className="sender-seal" aria-hidden="true">U</span><div><small>From</small><strong>University Management</strong></div><time>Monday, 9:12 AM</time></div>
                  <h2 ref={subject} tabIndex={-1}>Urgent Mission</h2>
                  <p className="salutation">Dear <span>{playerName}</span>,</p>
                  <p>Student engagement is at an all-time low.</p>
                  <div className="mission"><strong>Your mission:</strong><p>Improve student engagement before the next evaluation.</p></div>
                  <p>We need <strong className="underline">measurable results.</strong></p>
                  <p>Good luck,<br />University Management</p>
                  <div className="email-action"><button ref={visit} className="primary" disabled={beat !== 'ready'} onClick={() => { audio.play('transition'); setBeat('pullback'); }}>VISIT CLASSROOM</button></div>
                </div>
              </motion.article>
            )}
          </div>
        </motion.div>
        <ClassroomScene active={beat === 'classroom'} onReturn={returnToOffice} play={audio.play} startClassroom={audio.startClassroom} fadeClassroomOut={audio.fadeClassroomOut} />
        <div className="vignette" aria-hidden="true" />
        <motion.div className="exposure" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: beat === 'title' ? 0.97 : ['reveal', 'identity'].includes(beat) ? 0.45 : ['depart', 'returnArrival'].includes(beat) ? 1 : 0 }} transition={{ duration: beat === 'returnArrival' ? 0 : reducedMotion ? 0.2 : beat === 'reveal' ? 2 : 1.3 }} />
        <AnimatePresence>
          {beat === 'title' && (
            <motion.div key="title" className="title-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, delay: 0.3 }}>
              <h1>GAMING<br /><span>THE SYSTEM</span></h1>
              <motion.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>Can you design an assessment<br />that measures what really matters?</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}><button className="cinematic-button" disabled={!loaded} onClick={() => { audio.startOffice(); audio.play('interaction'); setBeat('reveal'); }}>START GAME</button></motion.div>
            </motion.div>
          )}
          {beat === 'identity' && (
            <motion.form key="identity" className="identity-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} onSubmit={(event) => {
              event.preventDefault();
              if (!draftName.trim()) return;
              setPlayerName(draftName.trim()); audio.play('transition'); setBeat('seating');
            }}>
              <h1>This desk is yours now.</h1>
              <label htmlFor="player-name">What name should we put on it?</label>
              <p>You'll be making the decisions from here.</p>
              <input ref={nameInput} id="player-name" autoComplete="off" maxLength={40} value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Name on the desk..." required />
              <button className="cinematic-button" disabled={!draftName.trim()}>TAKE YOUR SEAT</button>
            </motion.form>
          )}
          {beat === 'seating' && <motion.p key="time" className="time-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>Monday, 9:12 AM</motion.p>}
          {beat === 'thought' && <motion.p key="thought" className="thought-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>Sounds simple enough.</motion.p>}
          {beat === 'officeEnd' && <motion.div key="end" className="office-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade}><button ref={replay} className="cinematic-button" onClick={() => { audio.reset(); setDraftName(''); setPlayerName(''); setBeat('title'); }}>REPLAY OPENING</button></motion.div>}
        </AnimatePresence>
        {loadError && <p className="load-status" role="alert">The office background could not load. Please refresh to try again.</p>}
        {!loaded && !loadError && <p className="load-status" role="status">Preparing your desk…</p>}
        {audio.available && <button className="sound-toggle" onClick={audio.toggleMuted} aria-pressed={audio.muted}>{audio.muted ? 'SOUND OFF' : 'SOUND ON'}</button>}
      </div>
    </main>
  );
}
