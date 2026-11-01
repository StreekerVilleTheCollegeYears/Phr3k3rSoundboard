import { useMemo, useRef, useState } from 'react';
import {
  Activity,
  AudioLines,
  Cable,
  Delete,
  Headphones,
  Phone,
  Play,
  Radio,
  Search,
  Signal,
  Square,
  Volume2,
} from 'lucide-react';

type Category = 'DTMF' | 'Line tones' | 'Switching' | 'Signaling' | 'Line noise';
type ToneEvent = {
  frequencies: number[];
  duration: number;
  gap?: number;
  wave?: OscillatorType;
  sweep?: [number, number];
};
type Sound = {
  id: string;
  name: string;
  category: Category;
  note: string;
  events: ToneEvent[];
};

const dtmfFrequencies: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
  A: [697, 1633], B: [770, 1633], C: [852, 1633], D: [941, 1633],
};

const dtmfEvent = (digit: string, duration = 360): ToneEvent => ({
  frequencies: dtmfFrequencies[digit] ?? dtmfFrequencies['5'],
  duration,
  wave: 'sine',
});
const tone = (frequencies: number[], duration = 650, wave: OscillatorType = 'sine'): ToneEvent => ({
  frequencies, duration, wave,
});
const pulse = (frequencies: number[], duration: number, gap: number, wave: OscillatorType = 'sine'): ToneEvent => ({
  frequencies, duration, gap, wave,
});

const sounds: Sound[] = [
  ...['1','2','3','4','5','6','7','8','9','*','0','#','A','B','C','D'].map((digit) => ({
    id: `dtmf-${digit}`,
    name: `DTMF ${digit}`,
    category: 'DTMF' as const,
    note: `Dual-frequency keypad tone · ${dtmfFrequencies[digit].join(' + ')} Hz`,
    events: [dtmfEvent(digit, 450)],
  })),
  { id: 'dial-us', name: 'US dial tone', category: 'Line tones', note: '350 + 440 Hz · steady North American line tone', events: [tone([350, 440], 1900)] },
  { id: 'dial-uk', name: 'UK dial tone', category: 'Line tones', note: '350 + 450 Hz · continuous UK tone', events: [tone([350, 450], 1900)] },
  { id: 'ringback-us', name: 'US ringback', category: 'Line tones', note: 'Two seconds on, four seconds off', events: [pulse([440, 480], 1800, 450), pulse([440, 480], 1800, 450)] },
  { id: 'ringback-uk', name: 'UK ringback', category: 'Line tones', note: '400 Hz · double burst cadence', events: [pulse([400], 380, 180), pulse([400], 380, 680), pulse([400], 380, 350)] },
  { id: 'busy', name: 'Busy signal', category: 'Line tones', note: 'US busy cadence · 480 + 620 Hz', events: [pulse([480, 620], 430, 430), pulse([480, 620], 430, 430), pulse([480, 620], 430, 430)] },
  { id: 'fast-busy', name: 'Fast busy / reorder', category: 'Line tones', note: 'Rapid congestion cadence · 480 + 620 Hz', events: [pulse([480, 620], 180, 160), pulse([480, 620], 180, 160), pulse([480, 620], 180, 160), pulse([480, 620], 180, 160), pulse([480, 620], 180, 160)] },
  { id: 'sit-unavailable', name: 'SIT · number unavailable', category: 'Line tones', note: 'Special Information Tones · unassigned number triplet', events: [tone([950], 320), tone([1400], 320), tone([1800], 650)] },
  { id: 'sit-reorder', name: 'SIT · reorder', category: 'Line tones', note: 'Special Information Tones · reorder triplet', events: [tone([950], 320), tone([1400], 320), tone([1800], 650)] },
  { id: 'sit-vacant', name: 'SIT · vacant code', category: 'Line tones', note: 'Special Information Tones · vacant code triplet', events: [tone([950], 320), tone([1400], 320), tone([1800], 650)] },
  { id: 'coin-collect', name: 'Coin collect / going', category: 'Switching', note: 'Coin-control pulse simulation · historical line audio', events: [tone([1700, 2200], 170, 'square'), tone([1100], 120), tone([1700, 2200], 170, 'square')] },
  { id: 'coin-return', name: 'Coin return / refund', category: 'Switching', note: 'Coin-control return sequence simulation', events: [tone([1100], 130), tone([1700, 2200], 250, 'square'), tone([1100], 130)] },
  { id: 'howler', name: 'Howler · off-hook alarm', category: 'Switching', note: 'Escalating reminder tone · simulated', events: [tone([480, 620], 220), tone([480, 620], 220), tone([480, 620], 220), tone([480, 620], 220), tone([480, 620], 220)] },
  { id: 'relay', name: 'Trunk connect / relay', category: 'Switching', note: 'Switching pulses with relay-like clicks', events: [tone([1200], 55, 'square'), tone([620], 130), tone([1500], 50, 'square'), tone([880], 220)] },
  { id: 'intercept', name: 'Operator intercept', category: 'Switching', note: 'Intercept cadence simulation · no recorded speech', events: [tone([440, 620], 650), tone([350, 440], 500), tone([480, 620], 430), tone([480, 620], 430)] },
  { id: 'mf-kp', name: 'MF signaling · KP', category: 'Signaling', note: 'Multifrequency trunk start marker', events: [tone([1100, 1700], 360, 'sine')] },
  { id: 'mf-st', name: 'MF signaling · ST', category: 'Signaling', note: 'Multifrequency trunk end marker', events: [tone([1500, 1700], 360, 'sine')] },
  { id: 'bluebox-2600', name: '2600 Hz · trunk clear', category: 'Signaling', note: 'Single-frequency signaling tone · historical simulation', events: [tone([2600], 1050)] },
  { id: 'mf-1', name: 'MF digit · 1', category: 'Signaling', note: 'Multifrequency signaling pair', events: [tone([700, 900], 330)] },
  { id: 'mf-2', name: 'MF digit · 2', category: 'Signaling', note: 'Multifrequency signaling pair', events: [tone([700, 1100], 330)] },
  { id: 'mf-5', name: 'MF digit · 5', category: 'Signaling', note: 'Multifrequency signaling pair', events: [tone([900, 1100], 330)] },
  { id: 'mf-0', name: 'MF digit · 0', category: 'Signaling', note: 'Multifrequency signaling pair', events: [tone([1300, 1500], 330)] },
  { id: 'mf-keypulsing', name: 'Blue-box sequence · KP 1 ST', category: 'Signaling', note: 'Historical MF sequence demonstration', events: [tone([1100, 1700], 250), tone([700, 900], 240), tone([1500, 1700], 250)] },
  { id: 'modem', name: 'Download / modem handshake', category: 'Line noise', note: 'Carrier sweep and data chirps · synthesized', events: [{ frequencies: [900], duration: 540, sweep: [480, 1900], wave: 'sawtooth' }, tone([2100, 2225], 270, 'square'), tone([1850, 2100], 360), { frequencies: [1200], duration: 550, sweep: [2200, 780], wave: 'sawtooth' }, pulse([2100, 2400], 105, 70, 'square'), pulse([1800, 2300], 80, 60, 'square')] },
  { id: 'fax-carrier', name: 'Fax carrier', category: 'Line noise', note: 'High carrier tone with short signal bursts', events: [tone([2100], 620), pulse([1300, 2100], 130, 100, 'square'), pulse([1300, 2100], 130, 100, 'square')] },
  { id: 'phone-ring', name: 'Telephone bell ring', category: 'Line noise', note: 'Old line bell cadence · synthesized', events: [pulse([440, 480], 520, 80, 'square'), pulse([440, 480], 520, 540, 'square'), pulse([440, 480], 520, 250, 'square')] },
  { id: 'rotary', name: 'Rotary dial pulses', category: 'Line noise', note: 'Ten interrupt pulses · simulated', events: Array.from({ length: 10 }, () => pulse([900], 55, 45, 'square')) },
  { id: 'line-click', name: 'Line click / pickup', category: 'Line noise', note: 'Switch-hook transient and dial tone onset', events: [tone([1150], 48, 'square'), tone([340, 440], 650)] },
  { id: 'carrier-drop', name: 'Carrier drop', category: 'Line noise', note: 'Descending carrier into line silence', events: [{ frequencies: [1800], duration: 620, sweep: [1800, 280], wave: 'sawtooth' }, tone([230], 100, 'square')] },
];

const categories = ['All sounds', 'DTMF', 'Line tones', 'Switching', 'Signaling', 'Line noise'] as const;
const keypad = [
  { digit: '1', letters: '' }, { digit: '2', letters: 'ABC' }, { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' }, { digit: '5', letters: 'JKL' }, { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' }, { digit: '8', letters: 'TUV' }, { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' }, { digit: '0', letters: '+' }, { digit: '#', letters: '' },
];

function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All sounds');
  const [digits, setDigits] = useState('');
  const [volume, setVolume] = useState(62);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState('No signal selected');
  const [audioError, setAudioError] = useState('');
  const audioContext = useRef<AudioContext | null>(null);
  const oscillators = useRef<OscillatorNode[]>([]);
  const finishTimer = useRef<number | null>(null);
  const playbackGeneration = useRef(0);

  const filteredSounds = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sounds.filter((sound) =>
      (category === 'All sounds' || sound.category === category) &&
      (!needle || `${sound.name} ${sound.note} ${sound.category}`.toLowerCase().includes(needle)),
    );
  }, [category, query]);

  const stopPlayback = () => {
    playbackGeneration.current += 1;
    if (finishTimer.current !== null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
    for (const oscillator of oscillators.current) {
      try { oscillator.stop(); } catch { /* already stopped */ }
    }
    oscillators.current = [];
    setActiveId(null);
    setActiveLabel('Playback stopped');
  };

  const playEvents = async (events: ToneEvent[], id: string, label: string) => {
    stopPlayback();
    const generation = playbackGeneration.current;
    setAudioError('');
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) {
        setAudioError('Web Audio is unavailable in this browser.');
        return;
      }
      const context = audioContext.current ?? new AudioContextConstructor();
      audioContext.current = context;
      if (context.state === 'suspended') await context.resume();
      if (generation !== playbackGeneration.current) return;
      const now = context.currentTime + 0.035;
      let offset = 0;
      const gainScale = Math.min(0.14, (volume / 100) * 0.14);
      for (const event of events) {
        const duration = Math.max(0.045, Math.min(event.duration / 1000, 2));
        const start = now + offset;
        for (const frequency of event.frequencies) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = event.wave ?? 'sine';
          oscillator.frequency.setValueAtTime(event.sweep?.[0] ?? frequency, start);
          if (event.sweep) oscillator.frequency.linearRampToValueAtTime(event.sweep[1], start + duration);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(gainScale, start + Math.min(0.018, duration * 0.2));
          gain.gain.setValueAtTime(gainScale, start + duration * 0.78);
          gain.gain.linearRampToValueAtTime(0.0001, start + duration);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.01);
          oscillators.current.push(oscillator);
        }
        offset += duration + Math.max(0, (event.gap ?? 55) / 1000);
      }
      setActiveId(id);
      setActiveLabel(label);
      finishTimer.current = window.setTimeout(() => {
        if (generation !== playbackGeneration.current) return;
        oscillators.current = [];
        finishTimer.current = null;
        setActiveId(null);
        setActiveLabel('No signal selected');
      }, Math.min(8200, offset * 1000 + 120));
    } catch {
      setAudioError('Audio could not start. Try pressing a sound again.');
      setActiveId(null);
    }
  };

  const playSound = (sound: Sound) => playEvents(sound.events, sound.id, sound.name);
  const playDigits = () => {
    const sequence = digits.slice(0, 24).split('').map((digit) => dtmfEvent(digit, 125));
    if (sequence.length) playEvents(sequence, 'keypad-sequence', `Key sequence · ${digits}`);
  };
  const pressKey = (digit: string) => {
    setDigits((current) => (current + digit).slice(-24));
    playEvents([dtmfEvent(digit, 165)], `key-${digit}`, `DTMF ${digit}`);
  };

  return (
    <main className="shell">
      <header className="masthead">
        <div className="brand" aria-label="Signal Soundboard">
          <div className="brand-mark"><Cable size={18} strokeWidth={1.6} /></div>
          <div>
            <div className="brand-name">Signal Soundboard</div>
            <div className="brand-sub">An archive of the audible line</div>
          </div>
        </div>
        <div className="archive-status"><span className="status-lamp" /> <span>Local synthesis</span><span>·</span><span>Offline by design</span></div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div>
          <div className="eyebrow">Field archive / 01—08</div>
          <h1 id="page-title">Signals from<br /><span>the old line.</span></h1>
          <p className="hero-copy">A hands-on index of vintage telephony and phreaking-era sounds. Every tone is synthesized in this browser: a listening archive, not a connection to any telephone network.</p>
        </div>
        <div className="hero-stamp"><strong>Historical sound simulations</strong>For listening &amp; study only<br />No network signaling</div>
      </section>

      <div className="workbench">
        <section className="library" aria-labelledby="library-heading">
          <div className="section-head">
            <div className="section-title"><Radio size={15} /><span id="library-heading">Signal index</span></div>
            <span className="tiny-label">{filteredSounds.length} / {sounds.length} sound simulations</span>
          </div>
          <div className="toolbar">
            <label className="search-wrap">
              <Search size={15} aria-hidden="true" />
              <input className="search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a tone, signal, frequency..." aria-label="Search sound archive" data-testid="input-search-sounds" />
            </label>
            <button className="stop-button" type="button" onClick={stopPlayback} disabled={!activeId} aria-label="Stop active playback" data-testid="button-stop-playback">
              <Square size={12} fill="currentColor" /> Stop
            </button>
          </div>
          <div className="filters" role="group" aria-label="Filter sound categories">
            {categories.map((item) => (
              <button key={item} className={`filter-chip ${category === item ? 'selected' : ''}`} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} data-testid={`filter-category-${item.toLowerCase().replaceAll(' ', '-')}`}>
                {item}
              </button>
            ))}
          </div>
          {filteredSounds.length ? (
            <div className="samples-grid">
              {filteredSounds.map((sound, index) => (
                <article className={`sample-card ${activeId === sound.id ? 'is-playing' : ''}`} key={sound.id} data-testid={`card-sound-${sound.id}`}>
                  <div className="sample-top">
                    <span className="sample-code">SIG / {String(index + 1).padStart(2, '0')}</span>
                    <span className="sample-tag">{sound.category}</span>
                  </div>
                  <div className="sample-name">{sound.name}</div>
                  <div className="sample-note">{sound.note}</div>
                  <button className="play-button" type="button" onClick={() => playSound(sound)} aria-label={`Play ${sound.name}`} data-testid={`button-play-${sound.id}`}>
                    {activeId === sound.id ? <AudioLines /> : <Play fill="currentColor" />}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state" role="status">No archive entries match this search. Adjust the filter or try another term.</div>
          )}
        </section>

        <aside className="keypad-panel" aria-labelledby="keypad-heading">
          <div className="keypad-intro">
            <div className="section-title"><Phone size={14} /><h2 id="keypad-heading">Touch-tone console</h2></div>
            <p>Build a sequence, then audition its DTMF tones in order.</p>
          </div>
          <div className="digit-display">
            <input
              value={digits}
              onChange={(event) => setDigits(event.target.value.replace(/[^0-9*#ABCDabcd]/g, '').toUpperCase().slice(0, 24))}
              placeholder="ENTER DIGITS"
              aria-label="DTMF keypad sequence"
              inputMode="text"
              maxLength={24}
              data-testid="input-dtmf-sequence"
            />
            <button type="button" className="clear-button" onClick={() => setDigits((value) => value.slice(0, -1))} aria-label="Delete last digit" data-testid="button-delete-digit"><Delete size={15} /></button>
            <button type="button" className="clear-button" onClick={() => setDigits('')} aria-label="Clear keypad sequence" data-testid="button-clear-sequence">Clear</button>
          </div>
          <div className="keypad" role="group" aria-label="DTMF keypad">
            {keypad.map(({ digit, letters }) => (
              <button className="key-button" key={digit} type="button" onClick={() => pressKey(digit)} aria-label={`Enter and play DTMF ${digit}`} data-testid={`button-key-${digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}`}>
                {digit}<small>{letters || '\u00a0'}</small>
              </button>
            ))}
          </div>
          <div className="keypad-actions">
            <button type="button" onClick={playDigits} disabled={!digits} data-testid="button-play-sequence"><Play size={11} fill="currentColor" /> Play sequence</button>
            <button type="button" onClick={() => { setDigits(''); stopPlayback(); }} data-testid="button-reset-keypad">Reset console</button>
          </div>
          <div className="transport" role="status" aria-live="polite" data-testid="status-playback">
            <div className={`transport-bars ${activeId ? 'active' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="transport-copy"><strong>{activeLabel}</strong><span>{activeId ? 'SYNTHESIZING IN BROWSER' : 'TRANSPORT STANDBY'}</span></div>
            <Activity size={14} color={activeId ? '#d1a34f' : '#68716e'} aria-hidden="true" />
          </div>
          <div className="volume-row">
            <Volume2 size={13} aria-hidden="true" />
            <label htmlFor="volume-control">Output cap</label>
            <input id="volume-control" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Playback volume, capped" data-testid="input-volume" />
            <span className="volume-value">{volume}%</span>
          </div>
          {audioError && <div className="notice" role="alert">{audioError}</div>}
          <div className="notice"><strong>Simulation only.</strong> These locally generated tones cannot place calls, control a switch, or interact with telephone networks.</div>
        </aside>
      </div>

      <footer className="footer">
        <span><em>Signal Soundboard</em> · An independent listening index of historic line sounds. Credit: JSparkleDick Plasteek.</span>
        <span><Headphones size={11} aria-hidden="true" /> Consider low volume before playback · <Signal size={11} aria-hidden="true" /> Audio generated locally</span>
      </footer>
    </main>
  );
}

export default App;
