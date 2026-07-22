# Nav Shell + Régie Screen v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current two-tab (`workflows`/`folders`) sidebar inside the `mode === 'main'` Electron window with a single-window nav shell (Régie / Bibliothèque > Musique / Bibliothèque > Sessions) whose default screen, Régie, shows either a "choose a session to start" empty state or the relocated live session/audio controllers.

**Architecture:** `Dashboard.js` keeps owning one piece of state (`screen`) and renders a new `Sidebar` component (pure nav, driven by props) plus one of three screen components (`RegieScreen`, `MusiqueScreen`, the existing `WorkflowDashboard`) in a `<main>`. `RegieScreen` composes two already-existing, unmodified controllers (`SessionController`, `AudioController`) for its live state, and a small local card grid for its empty state. A new `useAudios` hook extracts the audio-listening logic already inlined in `AudioController` so both `AudioController` and the `Sidebar` (for the "music playing" pastille) can read the same live list without duplicating DOM-event wiring.

**Tech Stack:** React 19, react-i18next, react-bootstrap-icons, Jest + React Testing Library (jsdom), existing `useWorkflows`/`useSession` hooks, existing `window.electronAPI` IPC bridge (no changes to it in this plan).

## Global Constraints

- Do not touch `public/script/window/*.js`, `public/script/preload/*.js`, or any IPC handler registration — no IPC channel is added, removed, or renamed in this plan.
- Do not remove or alter the Folder/Audio/Workflow/Step/Session separate-`BrowserWindow` code in `public/script/window/MainWindow.js` — those windows keep working exactly as today (e.g. `window.electronAPI.workflowOpen()` still opens the Workflow window).
- Do not modify `src/App.js` — the `mode` switch stays as-is; all work here is inside what renders for `mode === 'main'`.
- Do not modify `SessionController.js`, `StepController.js`, or `WorkflowItem.js` internals — only relocate/reuse them.
- `AudioController.js` gets exactly one change: swap its inline listener/state for the new `useAudios` hook. Its rendered output and IPC calls must stay identical (existing test file must pass unmodified).
- `Musique` screen is a placeholder only in this plan (title + one sentence, no CRUD) — the real music library is plan 2's job. `Sessions` screen is the existing `WorkflowDashboard` relocated unchanged — its accordion/creation polish is plan 4's job. Régie screen has no tabs, no collapse toggle, no "Audio en cours"/"Démarrer une musique" cards — that polish is plan 3's job.
- Use `react-bootstrap-icons` only for all new icons (this repo already depends on it everywhere; do not add a second icon library such as Tabler).
- Follow the existing flat-key JSON convention in `src/i18n/translation.fr.json` (nested objects, French strings) for any new translation key.
- Every component test imports `'../../../lib/i18n'` first when it renders translated text, matching the existing convention in `Workflow.test.js`/`Folder.test.js`/`AudioController.test.js`. Hook tests (no rendered text) skip this import, matching `useWorkflows.test.js`/`useSteps.test.js`.
- This codebase's actual test convention (verified in `AudioController.test.js`, `Workflow.test.js`, `useWorkflows.test.js`) is to drive real hooks via `document.dispatchEvent(new CustomEvent(...))` / `window.session` and to mock `window.electronAPI` methods with `jest.fn()` — `jest.mock()` is only ever used to stub **child components** (e.g. `InputColor`), never custom hooks. All test code in this plan follows that same convention.
- Test command: `npm test -- --watchAll=false <path-or-pattern>`.
- `FolderDashboard.js` and `StepDashboard.js` are left on disk untouched; `Dashboard.js` simply stops importing `FolderDashboard` (a later plan decides its fate).
- Accepted, temporary consequence of the above: `FolderDashboard` > `AudioDashboard` was the only existing UI path that ever dispatched the `audio-play` DOM event (there is no separate playback window — `mode: 'audio'`/`Audio.js` is only the create/edit form). Removing the "folders" nav tab means there is no UI left to actually start audio playback until plan 2 rebuilds the music library screen; `AudioController`/`Sidebar` still correctly *display* a playing audio if one is started (verified manually via devtools in Task 6), but nothing in this plan can *start* one through the UI. This is intentional scope reduction, not a regression to fix here.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/component/Hook/useAudios.js` | Create | Pure DOM-event-to-state bridge for currently-playing audios (`audio-play`/`audio-end`), no IPC side effects — mirrors `useSession.js`'s pattern. |
| `src/component/Hook/__tests__/useAudios.test.js` | Create | Unit tests for the hook in isolation. |
| `src/component/Controller/AudioController.js` | Modify | Replace inline `useState`/`useEffect` listener with `const audios = useAudios()`; keep `onStop`/IPC calls as local wrappers. |
| `src/component/Sidebar/Sidebar.js` | Create | Pure nav shell: Régie / Bibliothèque category / Musique / Sessions, driven entirely by props (`screen`, `onNavigate`, `sessionRunning`, `musicPlaying`). |
| `src/component/Sidebar/__tests__/Sidebar.test.js` | Create | Active-state highlighting, navigation clicks, pastille visibility, graceful handling of an unrecognized `screen` value. |
| `src/component/Screen/RegieScreen.js` | Create | Régie screen: empty-state card grid (from `useWorkflows()`) when `useSession()` is `null`, else `<SessionController/>` + `<AudioController/>` stacked. |
| `src/component/Screen/__tests__/RegieScreen.test.js` | Create | Empty-state rendering, "Démarrer" wiring to `sessionPlay`, switch to live state once a session exists. |
| `src/component/Screen/MusiqueScreen.js` | Create | Placeholder screen (title + one sentence), no logic. |
| `src/component/Screen/__tests__/MusiqueScreen.test.js` | Create | Renders without crashing, shows title + placeholder text. |
| `src/component/Dashboard/Dashboard.js` | Modify | Replace `status`/`running` state with a single `screen` state; render `Sidebar` + the matching screen component. |
| `src/component/Dashboard/__tests__/Dashboard.test.js` | Create | Routing: default screen, clicking each nav item swaps the rendered (stubbed) screen. |
| `src/i18n/translation.fr.json` | Modify | Add `nav.regie`, `nav.library`, `nav.musique`, `nav.sessions`, `nav.tag.session`, `nav.tag.music`, `regie.title`, `regie.empty.title`, `musique.title`, `musique.placeholder`. Existing keys (`nav.workflows`, `nav.folders`, `workflow.play`, `session.name`, etc.) are untouched and reused where they already fit. |

---

### Task 1: `useAudios` hook + `AudioController` refactor

**Files:**
- Create: `src/component/Hook/useAudios.js`
- Test: `src/component/Hook/__tests__/useAudios.test.js`
- Modify: `src/component/Controller/AudioController.js:42-76`
- Test (must still pass unmodified): `src/component/Controller/__tests__/AudioController.test.js`

**Interfaces:**
- Produces: `useAudios(): Array<{id, folderId, name, src, ...}>` — a hook, importable as `import useAudios from '../Hook/useAudios';` (or `'./useAudios'` from within `Hook/`), consumed later by `AudioController.js` (this task) and by `Dashboard.js` (Task 5).
- Consumes: nothing from earlier tasks (this is the first task).

- [ ] **Step 1: Write the failing test**
```js
// src/component/Hook/__tests__/useAudios.test.js
import {act, renderHook} from '@testing-library/react';
import useAudios from '../useAudios';

describe('useAudios', () => {
    it('starts empty', () => {
        const {result} = renderHook(() => useAudios());
        expect(result.current).toEqual([]);
    });

    it('adds a playing audio when audio-play fires', () => {
        const {result} = renderHook(() => useAudios());
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });
        expect(result.current).toEqual([{id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}]);
    });

    it('replaces an already-playing audio sharing the same id instead of duplicating it', () => {
        const {result} = renderHook(() => useAudios());
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'}}));
        });
        expect(result.current).toEqual([{id: 'a1', folderId: 'f1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'}]);
    });

    it('removes an audio when audio-end fires for it', () => {
        const {result} = renderHook(() => useAudios());
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-end', {detail: {id: 'a1', folderId: 'f1'}}));
        });
        expect(result.current).toEqual([]);
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useAudios());
        unmount();
        expect(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        }).not.toThrow();
    });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test -- --watchAll=false src/component/Hook/__tests__/useAudios.test.js`
Expected: FAIL with "Cannot find module '../useAudios'"
- [ ] **Step 3: Write minimal implementation**
```js
// src/component/Hook/useAudios.js
import { useEffect, useState } from 'react';

function useAudios() {
    const [audios, setAudios] = useState([]);

    useEffect(() => {
        function handlePlay(event) {
            const audio = event.detail;
            setAudios(current => [...current.filter(a => a.id !== audio.id), audio]);
        }
        function handleEnd(event) {
            const audio = event.detail;
            setAudios(current => current.filter(a => a.id !== audio.id));
        }
        document.addEventListener('audio-play', handlePlay);
        document.addEventListener('audio-end', handleEnd);
        return () => {
            document.removeEventListener('audio-play', handlePlay);
            document.removeEventListener('audio-end', handleEnd);
        };
    }, []);

    return audios;
}

export default useAudios;
```
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test -- --watchAll=false src/component/Hook/__tests__/useAudios.test.js`
Expected: PASS (5 tests)
- [ ] **Step 5: Refactor `AudioController` to use the hook (still TDD — existing test is the safety net)**
Run first to confirm the pre-refactor baseline is green: `npm test -- --watchAll=false src/component/Controller/__tests__/AudioController.test.js`
Expected: PASS (5 existing tests, before any change to `AudioController.js`)
Then replace the body of `src/component/Controller/AudioController.js`:
```js
// src/component/Controller/AudioController.js
import 'react';
import {useEffect} from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {SquareFill} from "react-bootstrap-icons";
import useAudios from '../Hook/useAudios';

function AudioControllerItem({audio, onStop}) {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
        }}>
            {audio.name}
            <button onClick={() => onStop(audio)} style={{
                marginLeft: '1em',
                background: 'none',
                color: 'white',
                border: '1px solid white',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1em'
            }}>stop <SquareFill/></button>
        </div>
        <AudioPlayer
            autoPlay
            src={'file://' + audio.src}
            onEnded={() => onStop(audio)}
        />
    </div>
}

function AudioController() {
    const audios = useAudios();

    function onStop(audio) {
        document.dispatchEvent(new CustomEvent('audio-end', {detail: audio}));
    }

    useEffect(() => {
        function notifyPlay(event) {
            window.electronAPI.audioPlay(event.detail.folderId, event.detail.id);
        }
        function notifyEnd(event) {
            window.electronAPI.audioEnd(event.detail.folderId, event.detail.id);
        }
        document.addEventListener('audio-play', notifyPlay);
        document.addEventListener('audio-end', notifyEnd);
        return () => {
            document.removeEventListener('audio-play', notifyPlay);
            document.removeEventListener('audio-end', notifyEnd);
        };
    }, []);

    return <>
        {audios.map((audio) => <AudioControllerItem key={audio.id} audio={audio} onStop={onStop}/>)}
    </>;
}

export default AudioController;
```
Why `onStop` dispatches an `audio-end` `CustomEvent` instead of calling `window.electronAPI.audioEnd` directly: the original code did two separate things on stop — synchronously drop the item from local render state, and notify the main process. Now that `useAudios` owns the list and only updates it in reaction to real `audio-play`/`audio-end` DOM events, `onStop` must go through that same event (not mutate state itself, since it no longer holds any) — this is exactly the same event `AudioDashboard.js`'s `switchAudio` already dispatches when toggling an audio off from the folder-browsing screen (see `src/component/Dashboard/AudioDashboard.js:49-65`), so both stop paths now converge on one mechanism. The dedicated `useEffect` above is the single place that turns *any* `audio-play`/`audio-end` DOM event — regardless of whether it came from this component's own stop button, the `<AudioPlayer>`'s `onEnded` callback, or `AudioDashboard`'s toggle — into the matching IPC call, preserving the exact `window.electronAPI.audioPlay('f1', 'a1')` / `audioEnd('f1', 'a1')` assertions the existing test file already makes.
- [ ] **Step 6: Run both test suites to verify the refactor is safe**
Run: `npm test -- --watchAll=false src/component/Controller/__tests__/AudioController.test.js src/component/Hook/__tests__/useAudios.test.js`
Expected: PASS (5 + 5 tests, all unmodified assertions from the original `AudioController.test.js` still hold)
- [ ] **Step 7: Commit**
```bash
git add src/component/Hook/useAudios.js src/component/Hook/__tests__/useAudios.test.js src/component/Controller/AudioController.js
git commit -m "Extract useAudios hook from AudioController for reuse in the new Sidebar"
```

---

### Task 2: `Sidebar` component

**Files:**
- Create: `src/component/Sidebar/Sidebar.js`
- Test: `src/component/Sidebar/__tests__/Sidebar.test.js`
- Modify: `src/i18n/translation.fr.json` (add `nav.regie`, `nav.library`, `nav.musique`, `nav.sessions`, `nav.tag.session`, `nav.tag.music`)

**Interfaces:**
- Consumes: nothing from earlier tasks (icons come from `react-bootstrap-icons`, already a project dependency; `useTranslation` from `react-i18next`, already used project-wide).
- Produces: `<Sidebar screen={'regie'|'musique'|'sessions'|string} onNavigate={(screen: string) => void} sessionRunning={boolean} musicPlaying={boolean} />`, a component with exactly three nav buttons whose accessible names contain "Régie", "Musique", "Sessions" respectively — relied on by Task 5 (`Dashboard.js`).

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — merge into the existing "nav" object
"nav": {
    "playlists": "Sessions",
    "folders": "Musique",
    "workflows": "Sessions",
    "regie": "Régie",
    "library": "Bibliothèque",
    "musique": "Musique",
    "sessions": "Sessions",
    "tag": {
        "session": "Session en cours",
        "music": "Musique en cours"
    }
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Sidebar/__tests__/Sidebar.test.js
import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
    it('highlights the active screen and calls onNavigate when clicking another item', () => {
        const onNavigate = jest.fn();
        render(<Sidebar screen="regie" onNavigate={onNavigate} sessionRunning={false} musicPlaying={false}/>);

        expect(screen.getByRole('button', {name: /Régie/})).toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');

        fireEvent.click(screen.getByRole('button', {name: /Musique/}));
        expect(onNavigate).toHaveBeenCalledWith('musique');

        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        expect(onNavigate).toHaveBeenCalledWith('sessions');
    });

    it('shows the session pastille only when a session is running', () => {
        const {rerender} = render(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.queryByTitle('Session en cours')).toBeNull();

        rerender(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={true} musicPlaying={false}/>);
        expect(screen.getByTitle('Session en cours')).toBeTruthy();
    });

    it('shows the music pastille only when music is playing', () => {
        const {rerender} = render(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.queryByTitle('Musique en cours')).toBeNull();

        rerender(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={true}/>);
        expect(screen.getByTitle('Musique en cours')).toBeTruthy();
    });

    it('renders without throwing and highlights nothing for an unrecognized screen value', () => {
        render(<Sidebar screen="creation" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.getByRole('button', {name: /Régie/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Sessions/})).not.toHaveClass('active');
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `npm test -- --watchAll=false src/component/Sidebar/__tests__/Sidebar.test.js`
Expected: FAIL with "Cannot find module '../Sidebar'"
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Sidebar/Sidebar.js
import 'react';
import {useTranslation} from 'react-i18next';
import {Broadcast, List, MusicNoteBeamed, Tv} from 'react-bootstrap-icons';

function Sidebar({screen, onNavigate, sessionRunning, musicPlaying}) {
    const {t} = useTranslation();

    return (
        <nav className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark height-full" style={{width: '280px'}}>
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'regie' ? 'active' : ''}`}
                onClick={() => onNavigate('regie')}
            >
                <Broadcast/>
                <span style={{flex: 1, textAlign: 'left'}}>{t('nav.regie')}</span>
                {sessionRunning && <span title={t('nav.tag.session')}><Tv/></span>}
                {musicPlaying && <span title={t('nav.tag.music')}><MusicNoteBeamed/></span>}
            </button>
            <div style={{margin: '1em 0 .5em', paddingLeft: '.5em', fontSize: '.75em', textTransform: 'uppercase', opacity: 0.7}}>
                {t('nav.library')}
            </div>
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'musique' ? 'active' : ''}`}
                onClick={() => onNavigate('musique')}
            >
                <MusicNoteBeamed/>
                <span>{t('nav.musique')}</span>
            </button>
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'sessions' ? 'active' : ''}`}
                onClick={() => onNavigate('sessions')}
            >
                <List/>
                <span>{t('nav.sessions')}</span>
            </button>
        </nav>
    );
}

export default Sidebar;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `npm test -- --watchAll=false src/component/Sidebar/__tests__/Sidebar.test.js`
Expected: PASS (4 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Sidebar/Sidebar.js src/component/Sidebar/__tests__/Sidebar.test.js src/i18n/translation.fr.json
git commit -m "Add Sidebar nav shell (Régie / Bibliothèque > Musique, Sessions)"
```

---

### Task 3: `RegieScreen` component

**Files:**
- Create: `src/component/Screen/RegieScreen.js`
- Test: `src/component/Screen/__tests__/RegieScreen.test.js`
- Modify: `src/i18n/translation.fr.json` (add `regie.title`, `regie.empty.title`)

**Interfaces:**
- Consumes: `useWorkflows()` (existing, `src/component/Hook/useWorkflows.js`, returns `Array<{id, name, color, createdAt, updatedAt}>`), `useSession()` (existing, `src/component/Hook/useSession.js`, returns `Session|null`), `<SessionController/>` (existing, `src/component/Controller/SessionController.js`, no required props), `<AudioController/>` (existing/Task 1, `src/component/Controller/AudioController.js`, no props), `window.electronAPI.sessionPlay(workflow)` (existing IPC call).
- Produces: `<RegieScreen/>` (no props) — relied on by Task 5 (`Dashboard.js`).

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — new top-level "regie" object
"regie": {
    "title": "Régie",
    "empty": {
        "title": "Aucune session en cours. Choisis une session à démarrer."
    }
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Screen/__tests__/RegieScreen.test.js
import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import RegieScreen from '../RegieScreen';

describe('RegieScreen', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            sessionPlay: jest.fn(),
            audioPlay: jest.fn(),
            audioEnd: jest.fn(),
            trackChange: jest.fn(),
            sessionNext: jest.fn(),
            sessionPrevious: jest.fn(),
            sessionToStep: jest.fn(),
        };
        delete window.session;
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('shows the empty state with one card per workflow when no session is running', () => {
        render(<RegieScreen/>);
        seedWorkflows([
            {id: 'wf-1', name: 'Remise des diplômes'},
            {id: 'wf-2', name: 'Gala annuel'},
        ]);

        expect(screen.getByText('Remise des diplômes')).toBeTruthy();
        expect(screen.getByText('Gala annuel')).toBeTruthy();
        expect(screen.getByText('Aucune session en cours. Choisis une session à démarrer.')).toBeTruthy();
        expect(screen.getAllByRole('button', {name: 'Démarrer'})).toHaveLength(2);
    });

    it('starts the session for the workflow whose card was clicked', () => {
        render(<RegieScreen/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
    });

    it('renders the live session controller instead of the empty state once a session is running', () => {
        window.session = {
            track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5},
            steps: [{id: 's1', name: 'Step 1'}],
            index: 0,
        };
        render(<RegieScreen/>);

        expect(screen.queryByText('Aucune session en cours. Choisis une session à démarrer.')).toBeNull();
        expect(screen.getByText('Step 1')).toBeTruthy();
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `npm test -- --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: FAIL with "Cannot find module '../RegieScreen'"
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/RegieScreen.js
import 'react';
import {useTranslation} from 'react-i18next';
import useWorkflows from '../Hook/useWorkflows';
import useSession from '../Hook/useSession';
import SessionController from '../Controller/SessionController';
import AudioController from '../Controller/AudioController';

function RegieSessionCard({workflow}) {
    const {t} = useTranslation();

    function start() {
        window.electronAPI.sessionPlay(workflow);
    }

    return (
        <div className="card" style={{padding: '1em'}}>
            <p style={{fontWeight: 500, margin: '0 0 .75em'}}>{workflow.name}</p>
            <button className="btn btn-primary" style={{width: '100%'}} onClick={start}>{t('workflow.play')}</button>
        </div>
    );
}

function RegieScreen() {
    const {t} = useTranslation();
    const workflows = useWorkflows();
    const session = useSession();

    if (session) {
        return (
            <div style={{padding: '1em'}}>
                <h1>{t('regie.title')}</h1>
                <SessionController/>
                <AudioController/>
            </div>
        );
    }

    return (
        <div style={{padding: '1em'}}>
            <h1>{t('regie.title')}</h1>
            <p>{t('regie.empty.title')}</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1em'}}>
                {workflows.map((workflow) => <RegieSessionCard key={workflow.id} workflow={workflow}/>)}
            </div>
        </div>
    );
}

export default RegieScreen;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `npm test -- --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: PASS (3 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/RegieScreen.js src/component/Screen/__tests__/RegieScreen.test.js src/i18n/translation.fr.json
git commit -m "Add RegieScreen with empty-state session picker and live controller relocation"
```

---

### Task 4: `MusiqueScreen` placeholder

**Files:**
- Create: `src/component/Screen/MusiqueScreen.js`
- Test: `src/component/Screen/__tests__/MusiqueScreen.test.js`
- Modify: `src/i18n/translation.fr.json` (add `musique.title`, `musique.placeholder`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `<MusiqueScreen/>` (no props) — relied on by Task 5 (`Dashboard.js`).

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — new top-level "musique" object
"musique": {
    "title": "Musique",
    "placeholder": "Bientôt disponible : gestion de la bibliothèque musicale."
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Screen/__tests__/MusiqueScreen.test.js
import '../../../lib/i18n';
import {render, screen} from '@testing-library/react';
import MusiqueScreen from '../MusiqueScreen';

describe('MusiqueScreen', () => {
    it('renders the placeholder title and text without crashing', () => {
        render(<MusiqueScreen/>);

        expect(screen.getByRole('heading', {name: 'Musique'})).toBeTruthy();
        expect(screen.getByText('Bientôt disponible : gestion de la bibliothèque musicale.')).toBeTruthy();
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `npm test -- --watchAll=false src/component/Screen/__tests__/MusiqueScreen.test.js`
Expected: FAIL with "Cannot find module '../MusiqueScreen'"
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/MusiqueScreen.js
import 'react';
import {useTranslation} from 'react-i18next';

function MusiqueScreen() {
    const {t} = useTranslation();

    return (
        <div style={{padding: '1em'}}>
            <h1>{t('musique.title')}</h1>
            <p>{t('musique.placeholder')}</p>
        </div>
    );
}

export default MusiqueScreen;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `npm test -- --watchAll=false src/component/Screen/__tests__/MusiqueScreen.test.js`
Expected: PASS (1 test)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/MusiqueScreen.js src/component/Screen/__tests__/MusiqueScreen.test.js src/i18n/translation.fr.json
git commit -m "Add MusiqueScreen placeholder"
```

---

### Task 5: Rewire `Dashboard.js`

**Files:**
- Modify: `src/component/Dashboard/Dashboard.js:1-58` (full rewrite)
- Test: `src/component/Dashboard/__tests__/Dashboard.test.js`

**Interfaces:**
- Consumes: `<Sidebar screen onNavigate sessionRunning musicPlaying/>` (Task 2), `<RegieScreen/>` (Task 3), `<MusiqueScreen/>` (Task 4), `useAudios()` (Task 1), `useSession()` (existing), `<WorkflowDashboard/>` (existing, `src/component/Dashboard/WorkflowDashboard.js`, no props).
- Produces: `<Dashboard/>` (no props) — this is the top-level component rendered by `src/App.js` for `mode === 'main'`; nothing later in this plan consumes it further.

- [ ] **Step 1: Write the failing test**
```js
// src/component/Dashboard/__tests__/Dashboard.test.js
import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Dashboard from '../Dashboard';

jest.mock('../../Screen/RegieScreen', () => function FakeRegieScreen() { return <div>regie-stub</div>; });
jest.mock('../../Screen/MusiqueScreen', () => function FakeMusiqueScreen() { return <div>musique-stub</div>; });
jest.mock('../WorkflowDashboard', () => function FakeWorkflowDashboard() { return <div>sessions-stub</div>; });

describe('Dashboard', () => {
    beforeEach(() => {
        window.electronAPI = {workflowFetch: jest.fn()};
        delete window.session;
    });

    it('shows the Régie screen by default', () => {
        render(<Dashboard/>);
        expect(screen.getByText('regie-stub')).toBeTruthy();
    });

    it('switches to the Musique screen when its nav item is clicked', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Musique/}));

        expect(screen.getByText('musique-stub')).toBeTruthy();
        expect(screen.queryByText('regie-stub')).toBeNull();
    });

    it('switches to the Sessions screen when its nav item is clicked', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));

        expect(screen.getByText('sessions-stub')).toBeTruthy();
        expect(screen.queryByText('regie-stub')).toBeNull();
    });

    it('switches back to Régie from another screen', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Musique/}));
        fireEvent.click(screen.getByRole('button', {name: /Régie/}));

        expect(screen.getByText('regie-stub')).toBeTruthy();
    });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test -- --watchAll=false src/component/Dashboard/__tests__/Dashboard.test.js`
Expected: FAIL — `Dashboard.js` does not yet render `Sidebar`/`RegieScreen`/`MusiqueScreen`, so `regie-stub` is never found (`Unable to find an element with text: regie-stub`).
- [ ] **Step 3: Write minimal implementation**
```js
// src/component/Dashboard/Dashboard.js
import 'react';
import {useState} from 'react';
import Sidebar from '../Sidebar/Sidebar';
import RegieScreen from '../Screen/RegieScreen';
import MusiqueScreen from '../Screen/MusiqueScreen';
import WorkflowDashboard from './WorkflowDashboard';
import useSession from '../Hook/useSession';
import useAudios from '../Hook/useAudios';

function Dashboard() {
    const [screen, setScreen] = useState('regie');
    const session = useSession();
    const audios = useAudios();

    return (
        <div className="d-flex height-full" style={{height: '100vh'}}>
            <Sidebar
                screen={screen}
                onNavigate={setScreen}
                sessionRunning={session !== null}
                musicPlaying={audios.length > 0}
            />
            <main style={{maxHeight: '100%', overflowY: 'auto', flex: 1}}>
                {screen === 'regie' && <RegieScreen/>}
                {screen === 'musique' && <MusiqueScreen/>}
                {screen === 'sessions' && <WorkflowDashboard/>}
            </main>
        </div>
    );
}

export default Dashboard;
```
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test -- --watchAll=false src/component/Dashboard/__tests__/Dashboard.test.js`
Expected: PASS (4 tests)
- [ ] **Step 5: Run the full test suite to confirm nothing else regressed**
Run: `npm test -- --watchAll=false`
Expected: PASS (every existing suite plus all suites added in Tasks 1-5)
- [ ] **Step 6: Commit**
```bash
git add src/component/Dashboard/Dashboard.js src/component/Dashboard/__tests__/Dashboard.test.js
git commit -m "Rewire Dashboard to route between Régie, Musique and Sessions via the new Sidebar"
```

---

### Task 6: Manual verification against the real Electron app

This task has no automated test — none of the RTL suites in Tasks 1-5 exercise the real `window.electronAPI` IPC bridge or an actual running session, so a manual pass against the real app is required before considering this plan done.

**Files:** none (verification only).

**Interfaces:** none produced; exercises the full stack assembled by Tasks 1-5.

- [ ] **Step 1: Start the app**
Run: `npm start`
Wait for both the Vite/react-scripts dev server and the Electron window to open. The main window should load with the Régie screen active by default (highlighted in the sidebar).
- [ ] **Step 2: Verify the empty-state Régie screen**
If no session is running, confirm you see "Aucune session en cours. Choisis une session à démarrer." and one card per existing session (workflow), each with a "Démarrer" button. If you have no sessions yet, first click the **Sessions** nav item, use the existing "Créer une session" flow (unchanged Workflow window) to create one, then return to **Régie**.
- [ ] **Step 3: Verify starting a session end-to-end**
Click "Démarrer" on any card. Confirm: the Régie screen switches to the live view (transport bar + step list from `SessionController`), the sidebar's Régie button now shows the session pastille icon, and the browser/devtools console (Cmd+Option+I in the Electron window) has no new errors.
- [ ] **Step 4: Verify audio playback surfaces via `AudioController`**
Known gap in this plan: the only existing UI path that starts audio playback is `AudioDashboard` (`src/component/Dashboard/AudioDashboard.js`), which was reachable solely through the old main Dashboard's "folders" tab — a tab this plan removes in favor of the `MusiqueScreen` placeholder (rebuilding that browsing UI is explicitly plan 2's job, not this plan's). There is currently no other window that dispatches `audio-play`. So for this plan, verify the wiring itself rather than the full user journey: open devtools in the main Electron window (Cmd+Option+I), go to the Console tab, and run:
```js
document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'manual-test', folderId: 'f1', name: 'Manual Test Track', src: '/path/to/any/audio/file.mp3'}}))
```
Confirm "Manual Test Track" appears under the live Régie screen (via the relocated `AudioController`) with a working stop button, and that the sidebar's Régie button shows the music pastille icon while it is "playing", disappearing once you click stop (or run the equivalent `audio-end` dispatch). Confirm no console errors. Once plan 2 rebuilds the music-browsing UI, re-run this check through the real UI instead of the console.
- [ ] **Step 5: Verify the Musique and Sessions nav items**
Click **Musique**: confirm the placeholder title "Musique" and its one sentence render, no console errors. Click **Sessions**: confirm the existing `WorkflowDashboard` list/detail UI still works exactly as before (select, edit, remove, play — reusing the pre-existing Workflow/Step windows).
- [ ] **Step 6: Record the result**
If every check in Steps 2-5 passes with no console errors, this plan is complete. If anything fails, stop and fix it (with a matching automated test added retroactively to the relevant task) before moving on to plan 2.
