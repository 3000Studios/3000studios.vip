import { useMemo, useRef, useState, type FormEvent } from 'react';
import {
  BookOpen,
  BracketsCurly,
  Check,
  CloudArrowUp,
  EnvelopeSimple,
  GearSix,
  GlobeHemisphereWest,
  HardDrives,
  Microphone,
  PaperPlaneTilt,
  Play,
  ShieldCheck,
  Sparkle,
  Stop,
  VideoCamera,
  Wallet,
  Wrench,
  X,
} from '@phosphor-icons/react';
import { sendDudeChat, type DudeChatMessage } from '../lib/api';
import '../styles/agent-command-center.css';

type AgentMode = 'talk' | 'work' | 'learn';
type Gate = 'none' | 'spend-code' | 'spend-confirm' | 'email-first' | 'email-second';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';
const ABORT_PHRASES = ['abort', 'abort damn it abort', 'abort, damn it, abort'];

const UNIVERSAL_POLICY = [
  'Use every owner-approved folder, tool, and website needed to complete a request.',
  'Run ordinary requested work automatically and keep an owner-visible audit trail.',
  'Never spend money until owner code 3000 is entered and the purchase is confirmed.',
  'Never send an email until the owner confirms the exact message twice.',
  'Keep long-term memory and encrypted backups in the owner Google Drive.',
  'Monitor, learn, audit, repair, and improve continuously while preserving rollback.',
  'Stop all active work immediately when ABORT is pressed or the abort phrase is heard.',
];

const toolItems = [
  { label: 'Browser', icon: GlobeHemisphereWest },
  { label: 'Code', icon: BracketsCurly },
  { label: 'Media', icon: VideoCamera },
  { label: 'Cloud', icon: CloudArrowUp },
];

const initialMessages: DudeChatMessage[] = [
  {
    role: 'assistant',
    content:
      'I am online. Tell me what you want done, and I will show every important action as it happens.',
  },
];

function needsSpendGate(command: string) {
  return /\b(buy|purchase|pay|spend|subscribe|checkout|order|upgrade plan)\b/i.test(command);
}

function needsEmailGate(command: string) {
  return /\b(email|e-mail|send mail|message .*@)\b/i.test(command);
}

export function AgentCommandCenter() {
  const [mode, setMode] = useState<AgentMode>('work');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DudeChatMessage[]>(initialMessages);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [aborted, setAborted] = useState(false);
  const [gate, setGate] = useState<Gate>('none');
  const [pendingCommand, setPendingCommand] = useState('');
  const [ownerCode, setOwnerCode] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [driveConnected, setDriveConnected] = useState(
    () => localStorage.getItem('3000-agent-drive-connected') === 'true',
  );
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activity = useMemo(() => {
    if (aborted)
      return {
        title: 'Emergency stop active',
        detail: 'All agent work is paused until you resume.',
        progress: 0,
      };
    if (busy)
      return {
        title: 'Working on your request',
        detail: 'Planning, checking policy, then acting.',
        progress: 56,
      };
    return {
      title: 'Continuous monitor active',
      detail: 'Watching for safer, faster ways to help.',
      progress: 18,
    };
  }, [aborted, busy]);

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.98;
    window.speechSynthesis.speak(utterance);
  }

  function emergencyAbort() {
    abortRef.current?.abort();
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setBusy(false);
    setListening(false);
    setGate('none');
    setOwnerCode('');
    setAborted(true);
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content:
          'ABORT confirmed. Every active task is stopped and no queued action will continue.',
      },
    ]);
  }

  function startListening() {
    const SpeechRecognition = (
      window as unknown as {
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
          onend: () => void;
          onerror: () => void;
        };
      }
    ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'Voice recognition is unavailable in this browser. You can still type any command.',
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? '';
      if (ABORT_PHRASES.some((phrase) => transcript.toLowerCase().includes(phrase))) {
        emergencyAbort();
        return;
      }
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    setListening(true);
  }

  async function execute(command: string) {
    setAborted(false);
    setBusy(true);
    setMessages((current) => [...current, { role: 'user', content: command }]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await sendDudeChat({
        ownerEmail: OWNER_EMAIL,
        message: command,
        history: messages.slice(-12),
      });
      if (controller.signal.aborted) return;
      setMessages((current) => [...current, { role: 'assistant', content: result.reply }]);
      speak(result.reply);
    } catch (error) {
      if (controller.signal.aborted) return;
      const detail = error instanceof Error ? error.message : 'Agent service unavailable';
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `The cloud brain could not complete that request: ${detail}. No external action was taken.`,
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const command = input.trim();
    if (!command || busy) return;
    if (ABORT_PHRASES.some((phrase) => command.toLowerCase().includes(phrase))) {
      emergencyAbort();
      setInput('');
      return;
    }
    setPendingCommand(command);
    setInput('');
    if (needsSpendGate(command)) {
      setGate('spend-code');
      return;
    }
    if (needsEmailGate(command)) {
      setGate('email-first');
      return;
    }
    void execute(command);
  }

  function advanceGate() {
    if (gate === 'spend-code') {
      if (ownerCode !== '3000') return;
      setGate('spend-confirm');
      setOwnerCode('');
      return;
    }
    if (gate === 'spend-confirm') {
      setGate('none');
      void execute(pendingCommand);
      return;
    }
    if (gate === 'email-first') {
      setGate('email-second');
      return;
    }
    if (gate === 'email-second') {
      setGate('none');
      void execute(pendingCommand);
    }
  }

  function connectDrive() {
    localStorage.setItem('3000-agent-drive-connected', 'true');
    setDriveConnected(true);
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content:
          'Google Drive backup is marked ready in this browser. OAuth and the local companion must still verify the real Drive connection before any backup is claimed.',
      },
    ]);
  }

  return (
    <main className={`agentCenter ${aborted ? 'isAborted' : ''}`}>
      <header className="agentTopbar">
        <div className="agentBrand">
          <img src="/media/3k.jpg" alt="3000 Studios" />
          <span>
            <strong>3000 Studios</strong>
            <small>Private command center</small>
          </span>
        </div>
        <div className="agentTitle">Hologram Booth</div>
        <div className="agentTopActions">
          <span className="securePill">
            <ShieldCheck weight="duotone" /> Owner policy active
          </span>
          <button
            type="button"
            className="iconButton"
            onClick={() => setPolicyOpen(true)}
            aria-label="Open universal policy"
          >
            <GearSix />
          </button>
        </div>
      </header>

      <section className="agentWorkspace">
        <aside className="hologramStage" aria-label="Virtual assistant">
          <div className="assistantStatus">
            <Sparkle weight="fill" />
            <span>
              <strong>DUDE</strong>
              {listening ? 'Listening…' : busy ? 'Working…' : 'Always monitoring'}
            </span>
          </div>
          <img
            className="hologramAvatar"
            src="/media/agent-hologram.png"
            alt="DUDE virtual assistant hologram"
          />
          <div className="hologramCaption">
            <strong>{aborted ? 'Emergency stop active.' : 'Ready when you are.'}</strong>
            <span>
              {aborted
                ? 'Press Resume only when you want work to continue.'
                : 'Speak naturally or type any request.'}
            </span>
          </div>
        </aside>

        <section className="agentPlan" aria-label="Current work">
          <div className="requestLabel">
            <Microphone weight="duotone" /> Current request
          </div>
          <h1>{pendingCommand || 'Make my work easier, faster, and better.'}</h1>

          <div className="livePlan">
            <div className="planHeading">
              <Wrench /> Live plan
            </div>
            {[
              ['Understand and plan', 'Read the request and choose the right tools.', true],
              [
                'Check universal policy',
                'Block spending and email until owner confirmation.',
                true,
              ],
              [
                'Work across systems',
                'Use approved folders, browser, code, media, and cloud.',
                busy,
              ],
              ['Verify and remember', 'Audit the result and save useful knowledge.', false],
            ].map(([title, detail, active], index) => (
              <article className={`planStep ${active ? 'active' : ''}`} key={String(title)}>
                <span className="stepNumber">{active ? <Check weight="bold" /> : index + 1}</span>
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
                <em>{active ? 'Ready' : 'Queued'}</em>
              </article>
            ))}
          </div>

          <div className="activityRail">
            <span>
              <Play weight="fill" />
            </span>
            <div>
              <strong>{activity.title}</strong>
              <small>{activity.detail}</small>
              <i
                style={{ '--activity-progress': `${activity.progress}%` } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="toolRail" aria-label="Agent tools">
            {toolItems.map(({ label, icon: Icon }) => (
              <button type="button" key={label}>
                <Icon weight="duotone" />
                {label}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="agentDock">
        <button
          type="button"
          className={`talkOrb ${listening ? 'listening' : ''}`}
          onClick={startListening}
          aria-label="Speak to DUDE"
        >
          <Microphone weight="fill" />
          <span>{listening ? 'Listening' : 'Press to talk'}</span>
        </button>
        <form className="commandComposer" onSubmit={submit}>
          <label htmlFor="agent-command">Ask DUDE anything or give a command</label>
          <div>
            <input
              id="agent-command"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="What should I do?"
              autoComplete="off"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send command">
              <PaperPlaneTilt weight="fill" />
            </button>
          </div>
        </form>
        <div className="modeSwitch" aria-label="Agent mode">
          {(
            [
              ['talk', Microphone],
              ['work', Wrench],
              ['learn', BookOpen],
            ] as const
          ).map(([value, Icon]) => (
            <button
              type="button"
              className={mode === value ? 'active' : ''}
              onClick={() => setMode(value)}
              key={value}
            >
              <Icon />
              {value}
            </button>
          ))}
        </div>
        <button type="button" className="abortButton" onClick={emergencyAbort}>
          <Stop weight="fill" />
          ABORT
        </button>
      </section>

      <footer className="agentFooter">
        <button type="button" onClick={connectDrive} className={driveConnected ? 'connected' : ''}>
          <CloudArrowUp /> Google Drive {driveConnected ? 'ready' : 'setup'}
        </button>
        <span>
          <HardDrives /> All-folders access requires the signed local companion
        </span>
        <span>
          <Wallet /> Purchases locked by owner code
        </span>
        <span>
          <EnvelopeSimple /> Email requires two confirmations
        </span>
      </footer>

      <section className="transcript" aria-live="polite" aria-label="Latest agent messages">
        {messages.slice(-2).map((message, index) => (
          <p className={message.role} key={`${message.role}-${index}`}>
            {message.content}
          </p>
        ))}
      </section>

      {gate !== 'none' ? (
        <div className="gateBackdrop" role="presentation">
          <section
            className="gateDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gate-title"
          >
            <ShieldCheck size={42} weight="duotone" />
            <h2 id="gate-title">
              {gate.startsWith('spend')
                ? 'Purchase locked'
                : `Email confirmation ${gate === 'email-first' ? '1 of 2' : '2 of 2'}`}
            </h2>
            <p>{pendingCommand}</p>
            {gate === 'spend-code' ? (
              <input
                aria-label="Owner purchase code"
                type="password"
                inputMode="numeric"
                value={ownerCode}
                onChange={(event) => setOwnerCode(event.target.value)}
                placeholder="Enter owner code"
                autoFocus
              />
            ) : null}
            <div>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => {
                  setGate('none');
                  setOwnerCode('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primaryButton"
                onClick={advanceGate}
                disabled={gate === 'spend-code' && ownerCode !== '3000'}
              >
                {gate === 'spend-code'
                  ? 'Verify code'
                  : gate === 'spend-confirm'
                    ? 'Confirm purchase'
                    : 'Confirm email'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {policyOpen ? (
        <div className="gateBackdrop" role="presentation">
          <section
            className="policyDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-title"
          >
            <button
              type="button"
              className="dialogClose"
              onClick={() => setPolicyOpen(false)}
              aria-label="Close policy"
            >
              <X />
            </button>
            <span className="requestLabel">
              <ShieldCheck /> Owner-written universal policy
            </span>
            <h2 id="policy-title">One policy. Every system.</h2>
            <p>
              These rules apply everywhere. The agent may improve its implementation, but it cannot
              silently weaken or replace this owner policy.
            </p>
            <ol>
              {UNIVERSAL_POLICY.map((rule) => (
                <li key={rule}>
                  <Check weight="bold" />
                  {rule}
                </li>
              ))}
            </ol>
            <button type="button" className="primaryButton" onClick={() => setPolicyOpen(false)}>
              Policy confirmed
            </button>
          </section>
        </div>
      ) : null}

      {aborted ? (
        <button type="button" className="resumeButton" onClick={() => setAborted(false)}>
          Resume agent
        </button>
      ) : null}
    </main>
  );
}
