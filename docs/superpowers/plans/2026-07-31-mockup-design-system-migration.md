# Mockup Design-System Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Bootstrap + `react-bootstrap-icons` with the mockup's own design system (custom CSS variables/classes + `@tabler/icons-react`) across every screen, and restructure the Sessions screen into the mockup's card grid — retiring the legacy step-editing UI and standalone edit windows it makes obsolete.

**Architecture:** No new shared UI component layer. Every screen keeps writing its own JSX with classNames directly (matching both the current codebase's pattern and the mockup's own plain-HTML-classes approach). A single new `src/theme.css` (ported verbatim from `mockups/style.css`) supplies every class name used. Icons swap 1:1 from `react-bootstrap-icons` to `@tabler/icons-react`.

**Tech Stack:** React 19, react-i18next, `@tabler/icons-react` (new dependency), CSS custom properties (no preprocessor).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-31-mockup-design-system-migration.md`.
- No business-logic changes: entities, use cases, IPC channels, and data shapes stay exactly as they are today. Only presentation (CSS classes, icon components, and — for Task 9 only — the Sessions screen's markup structure) changes.
- `src/theme.css` (Task 1) is the single source of every class name below — do not invent new class names not defined there.
- Icon mapping (`react-bootstrap-icons` → `@tabler/icons-react`), used verbatim across every task:
  | react-bootstrap-icons | @tabler/icons-react |
  |---|---|
  | `Broadcast` | `IconBroadcast` |
  | `List` | `IconList` |
  | `MusicNoteBeamed` | `IconMusic` |
  | `Tv` | `IconDeviceTv` |
  | `ChevronUp` | `IconChevronUp` |
  | `ChevronDown` | `IconChevronDown` |
  | `ChevronLeft` | `IconChevronLeft` |
  | `ChevronBarLeft` | `IconPlayerTrackPrev` |
  | `ChevronBarRight` | `IconPlayerTrackNext` |
  | `Play` | `IconPlayerPlay` |
  | `Pause` | `IconPlayerPause` |
  | `Plus` | `IconPlus` |
  | `Dash` | `IconMinus` |
  | `Pen` | `IconEdit` |
  | `Trash` | `IconTrash` |
  | `Recycle` | `IconRecycle` |
  | `SquareFill` | `IconPlayerStop` |
  | `Image` | `IconPhoto` |
  | `CameraReelsFill` | `IconMovie` |
  | `ClockFill` | `IconClock` |
  | `ShieldFill` | `IconShield` |

  All `@tabler/icons-react` components accept a `size` prop (default 24px); do not pass one unless a task says to — keep default sizing to match current icon sizes.
- After every task's classNames/icons swap, run that file's existing test suite. Most tests target by role/text/`aria-label` and need no changes. The only known exception is spelled out in Task 6. If any other test breaks on a className assertion, update the assertion to the new class name from `theme.css` — do not weaken the assertion (e.g. don't switch to `getByText` if the test's purpose is to check active/inactive state).
- Never touch `SessionWindow.js` / `src/component/Session/Session.js` (the audience-facing live-projection window) — it is a separate concern the mockup does not model.

---

### Task 1: Design-system foundations

**Files:**
- Create: `src/theme.css`
- Modify: `src/App.js`
- Modify: `package.json`

**Interfaces:**
- Produces: every class name in `src/theme.css` (verbatim list in Global Constraints intro), available globally once imported. Produces `@tabler/icons-react` as an installed dependency, importable as `import {IconX} from '@tabler/icons-react'`.

- [ ] **Step 1: Create `src/theme.css`**

Copy `mockups/style.css` verbatim (all 379 lines — variables, `.card`, `.btn`/`.btn-icon`/`.btn-sm`/`.btn-accent`/`.btn-accent-solid`/`.is-active`, `.step-list`/`.step-row`/`.step-name`/`.step-type-label`, `.accordion-item`/`.accordion-header`/`.accordion-body`, `.tabs`, `.pill`, `.dot`, `.color-chip`, `.grid`/`.grid-cards`, `.workflow-card`, `.top-bar`, `.field-label`, `.file-row`/`.file-thumb`, `.preview-box`, `.time-display`, `.player-row`, `.audio-row`, `.two-col`, `.nav-item`/`.nav-category`/`.nav-tag`/`.sidebar`/`.brand`, `.screen-title`/`.screen-sub`, native `input`/`select`/`textarea` styling) into `src/theme.css` unchanged.

- [ ] **Step 2: Wire the stylesheet into the app, remove Bootstrap's CSS**

In `src/App.js`, replace:
```js
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
```
with:
```js
import './App.css';
import './theme.css';
```

- [ ] **Step 3: Add `@tabler/icons-react`**

Run: `npm install @tabler/icons-react`

Verify `package.json`'s `dependencies` now includes `"@tabler/icons-react"`. Do **not** remove `"react-bootstrap-icons"` yet — Task 11 removes it once every consumer has migrated.

- [ ] **Step 4: Run the full test suite as a baseline**

Run: `npm test -- --watchAll=false`
Expected: same pass/fail counts as before this task (this task only adds a stylesheet and a dependency; nothing consumes them yet).

- [ ] **Step 5: Commit**

```bash
git add src/theme.css src/App.js package.json package-lock.json
git commit -m "Add mockup design-system foundations (theme.css, @tabler/icons-react)"
```

---

### Task 2: Sidebar

**Files:**
- Modify: `src/component/Sidebar/Sidebar.js`

**Interfaces:**
- Consumes: `src/theme.css` classes `.sidebar`, `.brand`, `.nav-item`, `.nav-item.active`, `.nav-category`, `.nav-subitem`, `.nav-tag` (Task 1). Icons `IconBroadcast`, `IconDeviceTv`, `IconMusic`, `IconList` (Global Constraints table).

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- Sidebar --watchAll=false`
Expected: current pass count (note it before changing anything).

- [ ] **Step 2: Replace the file content**

Replace `src/component/Sidebar/Sidebar.js` in full:

```js
import 'react';
import {useTranslation} from 'react-i18next';
import {IconBroadcast, IconList, IconMusic, IconDeviceTv} from '@tabler/icons-react';

function Sidebar({screen, onNavigate, sessionRunning, musicPlaying}) {
    const {t} = useTranslation();

    return (
        <nav className="sidebar">
            <div className="brand">Kaeros</div>
            <button
                type="button"
                className={`nav-item ${screen === 'regie' ? 'active' : ''}`}
                onClick={() => onNavigate('regie')}
            >
                <IconBroadcast/>
                <span style={{flex: 1, textAlign: 'left'}}>{t('nav.regie')}</span>
                {sessionRunning && <span className="nav-tag" title={t('nav.tag.session')}><IconDeviceTv size={14}/></span>}
                {musicPlaying && <span className="nav-tag" title={t('nav.tag.music')}><IconMusic size={14}/></span>}
            </button>
            <div className="nav-category">{t('nav.library')}</div>
            <button
                type="button"
                className={`nav-item nav-subitem ${screen === 'musique' ? 'active' : ''}`}
                onClick={() => onNavigate('musique')}
            >
                <IconMusic/>
                <span>{t('nav.musique')}</span>
            </button>
            <button
                type="button"
                className={`nav-item nav-subitem ${(screen === 'sessions' || screen === 'creation') ? 'active' : ''}`}
                onClick={() => onNavigate('sessions')}
            >
                <IconList/>
                <span>{t('nav.sessions')}</span>
            </button>
        </nav>
    );
}

export default Sidebar;
```

- [ ] **Step 3: Run tests, fix any className assertions**

Run: `npm test -- Sidebar --watchAll=false`
Expected: same pass count as the Step 1 baseline. `Sidebar.test.js` targets by role/text (established in the `session-creation-screen` plan's Task 3), so no assertion changes are expected. If a test asserts a specific class like `btn-light` or `active` via `toHaveClass`, update it to `nav-item`/`active` per the markup above.

- [ ] **Step 4: Commit**

```bash
git add src/component/Sidebar/Sidebar.js
git commit -m "Restyle Sidebar with mockup design system and Tabler icons"
```

---

### Task 3: AudioController + Dashboard "Audio en cours" wrapper

**Files:**
- Modify: `src/component/Controller/AudioController.js`
- Modify: `src/component/Dashboard/Dashboard.js`

**Interfaces:**
- Consumes: `.audio-row`, `.dot`, `.btn`, `.btn-icon`, `.card` from `theme.css`. Icon `IconPlayerStop`.
- Produces: no change to `AudioController`'s exported behavior (still listens for `audio-play`/`audio-end`, still calls `trackPlay`/`trackEnd`).

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- AudioController Dashboard --watchAll=false`

- [ ] **Step 2: Restyle `AudioControllerItem`**

In `src/component/Controller/AudioController.js`, replace the icon import and `AudioControllerItem`:

```js
import 'react';
import {useEffect} from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {IconPlayerStop} from '@tabler/icons-react';
import useAudios from '../Hook/useAudios';

function AudioControllerItem({audio, onStop}) {
    return <div className="audio-row" style={{flexDirection: 'column', alignItems: 'stretch'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            <span className="dot" style={{background: audio.color || 'var(--accent)'}}/>
            <span style={{flex: 1}}>{audio.name}</span>
            <button className="btn btn-icon" aria-label="stop" onClick={() => onStop(audio)}>
                <IconPlayerStop/>
            </button>
        </div>
        <AudioPlayer
            autoPlay
            src={'file://' + audio.src}
            onEnded={() => onStop(audio)}
        />
    </div>
}
```

Leave `AudioController` (the exported function below `AudioControllerItem`) unchanged — only the inner item component's markup changes.

- [ ] **Step 3: Restyle the Dashboard's "Audio en cours" wrapper**

In `src/component/Dashboard/Dashboard.js`, the wrapping card currently reads:
```js
<div className="card" style={{padding: '1em', margin: '1em', display: audios.length ? undefined : 'none'}}>
    <p style={{fontWeight: 500, margin: '0 0 .75em'}}>{t('regie.audios.title')}</p>
    <AudioController/>
</div>
```
`.card` already exists in `theme.css` with the same semantics — no change needed here beyond confirming it still renders correctly once `theme.css` is loaded (Task 1). No edit required for this file in this task.

- [ ] **Step 4: Run tests**

Run: `npm test -- AudioController Dashboard --watchAll=false`
Expected: same pass count as Step 1 baseline (tests target text/role, not the removed inline styles).

- [ ] **Step 5: Commit**

```bash
git add src/component/Controller/AudioController.js
git commit -m "Restyle AudioController with mockup audio-row/dot classes and Tabler stop icon"
```

---

### Task 4: RegieScreen + RegieTrackPicker

**Files:**
- Modify: `src/component/Screen/RegieScreen.js`
- Modify: `src/component/Track/RegieTrackPicker.js`

**Interfaces:**
- Consumes: `.card`, `.tabs`, `.btn`/`.btn-sm`/`.is-active`, `.grid`/`.grid-cards`, `.workflow-card`, `.color-chip`, `.pill` from `theme.css`. Icon `IconChevronUp`/`IconChevronDown`.

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- RegieScreen RegieTrackPicker --watchAll=false`

- [ ] **Step 2: Restyle `RegieScreen`**

Replace `src/component/Screen/RegieScreen.js` in full:

```js
import 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IconChevronDown, IconChevronUp} from '@tabler/icons-react';
import useWorkflows from '../Hook/useWorkflows';
import useSession from '../Hook/useSession';
import useAudios from '../Hook/useAudios';
import useTracks from '../Hook/useTracks';
import SessionController from '../Controller/SessionController';
import RegieLiveController from './RegieLiveController';
import RegieTrackPicker from '../Track/RegieTrackPicker';

function RegieSessionCard({workflow}) {
    const {t} = useTranslation();

    function start() {
        window.electronAPI.sessionPlay(workflow);
    }

    return (
        <div className="workflow-card">
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
                <div className="color-chip" style={{background: workflow.color}}/>
                <p style={{fontSize: 13, fontWeight: 500, margin: 0, flex: 1}}>{workflow.name}</p>
            </div>
            <button className="btn btn-accent" style={{width: '100%'}} onClick={start}>{t('workflow.play')}</button>
        </div>
    );
}

function RegieScreen() {
    const {t} = useTranslation();
    const workflows = useWorkflows();
    const session = useSession();
    const audios = useAudios();
    const tracks = useTracks();
    const [collapsed, setCollapsed] = useState(false);

    function toggleCollapsed() {
        setCollapsed((current) => !current);
    }

    function startTrack(track) {
        document.dispatchEvent(new CustomEvent('audio-play', {detail: track}));
    }

    return (
        <div className="content">
            <p className="screen-title">{t('regie.title')}</p>

            <div className="card" style={{marginBottom: 16}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <p style={{fontSize: 12, color: 'var(--text-secondary)', margin: 0}}>{t('regie.session.label')}</p>
                    <button
                        type="button"
                        className="btn btn-icon"
                        aria-label={collapsed ? t('regie.session.expand') : t('regie.session.collapse')}
                        onClick={toggleCollapsed}
                    >
                        {collapsed ? <IconChevronDown/> : <IconChevronUp/>}
                    </button>
                </div>
                {!collapsed && (
                    <div style={{marginTop: 12}}>
                        {session ? (
                            <div className="two-col">
                                <div>
                                    <SessionController/>
                                </div>
                                <div className="card">
                                    <RegieLiveController/>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="screen-sub" style={{margin: '0 0 12px'}}>{t('regie.empty.title')}</p>
                                <div className="grid grid-cards">
                                    {workflows.map((workflow) => <RegieSessionCard key={workflow.id} workflow={workflow}/>)}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="card">
                <p style={{fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px'}}>{t('regie.music.title')}</p>
                <RegieTrackPicker tracks={tracks} playingIds={audios.map((audio) => audio.id)} onStart={startTrack}/>
            </div>
        </div>
    );
}

export default RegieScreen;
```

- [ ] **Step 3: Restyle `RegieTrackPicker`**

Replace `src/component/Track/RegieTrackPicker.js` in full:

```js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TAGS = ['Musique', 'Bruitage', 'Disco'];

function RegieTrackPicker({ tracks, playingIds, onStart }) {
    const { t } = useTranslation();
    const [activeTag, setActiveTag] = useState('all');

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tag === activeTag);

    return (
        <div>
            <div className="tabs" role="group" aria-label="tag-filter">
                <button
                    type="button"
                    className={`btn btn-sm ${activeTag === 'all' ? 'is-active' : ''}`}
                    onClick={() => setActiveTag('all')}
                >{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={`btn btn-sm ${activeTag === tag ? 'is-active' : ''}`}
                        onClick={() => setActiveTag(tag)}
                    >{t(`track.tag.${tag}`)}</button>
                ))}
            </div>
            <div className="step-list">
                {filtered.map((track) => {
                    const playing = playingIds.includes(track.id);
                    return (
                        <div key={track.id} className="step-row">
                            <span className="dot" style={{background: track.color}}/>
                            <span className="step-name">{track.name}</span>
                            <span className="pill">{t(`track.tag.${track.tag}`)}</span>
                            <button
                                type="button"
                                className="btn btn-sm"
                                disabled={playing}
                                onClick={() => onStart(track)}
                            >{playing ? t('track.playing') : t('track.start')}</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RegieTrackPicker;
```

- [ ] **Step 4: Run tests, fix any className assertions**

Run: `npm test -- RegieScreen RegieTrackPicker --watchAll=false`
Expected: same pass count as Step 1 baseline — tests target role/text (`getByRole('button', {name: ...})`, `getByText`), not `btn-primary`/`btn-secondary`.

- [ ] **Step 5: Commit**

```bash
git add src/component/Screen/RegieScreen.js src/component/Track/RegieTrackPicker.js
git commit -m "Restyle RegieScreen and RegieTrackPicker with mockup design system"
```

---

### Task 5: MusiqueScreen

**Files:**
- Modify: `src/component/Screen/MusiqueScreen.js`

**Interfaces:**
- Consumes: `.tabs`, `.btn`/`.is-active`, `.step-list`/`.step-row`, `.pill`, `.dot`, `.field-label`, `.file-row`/`.file-thumb` from `theme.css`. No icon needed for the file button (mockup uses `ti-upload`, add `IconUpload` for parity).

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- MusiqueScreen --watchAll=false`

- [ ] **Step 2: Replace the file content**

Replace `src/component/Screen/MusiqueScreen.js` in full:

```js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import useTracks from '../Hook/useTracks';
import { getFilename, hasSource } from '../../lib/filename';

const TAGS = ['Musique', 'Bruitage', 'Disco'];
const TAG_COLORS = {
    Musique: '#4C6EFF',
    Bruitage: '#F76707',
    Disco: '#AE3EC9',
};
const EMPTY_FORM = { name: '', tag: 'Musique' };

function MusiqueScreen() {
    const { t } = useTranslation();
    const tracks = useTracks();
    const [activeTag, setActiveTag] = useState('all');
    const [value, setValue] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tag === activeTag);

    function handleFile(e) {
        const file = e.target.files[0];
        setValue({ ...value, file });
        if (errors.src) setErrors({ ...errors, src: undefined });
    }

    function validate(value) {
        const errors = {};
        if (!value.name || !value.name.trim()) errors.name = t('musique.form.error.name');
        if (!value.tag || !TAGS.includes(value.tag)) errors.tag = t('musique.form.error.tag');
        if (!hasSource(value)) errors.src = t('musique.form.error.src');
        return errors;
    }

    function onSubmit(e) {
        e.preventDefault();
        const validationErrors = validate(value);
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        window.electronAPI.trackSave({
            ...value,
            color: value.color || TAG_COLORS[value.tag],
        });
        setValue(EMPTY_FORM);
    }

    function edit(track) {
        setValue(track);
        setErrors({});
    }

    function remove(track) {
        window.electronAPI.trackRemove(track.id);
    }

    return (
        <div className="content">
            <p className="screen-title">{t('musique.title')}</p>

            <form onSubmit={onSubmit} className="card" style={{ marginBottom: 16 }}>
                <p className="screen-sub" style={{marginBottom: 12}}>{t('musique.form.title')}</p>
                <label htmlFor="track-name" className="field-label">{t('musique.form.name')}</label>
                <input
                    type="text"
                    id="track-name"
                    style={{ width: '100%', marginBottom: 10 }}
                    className={errors.name ? 'is-invalid' : ''}
                    value={value.name}
                    onChange={(e) => {
                        setValue({ ...value, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}

                <label htmlFor="track-tag" className="field-label">{t('musique.form.tag')}</label>
                <select
                    id="track-tag"
                    style={{ width: 200, marginBottom: 12 }}
                    className={errors.tag ? 'is-invalid' : ''}
                    value={value.tag}
                    onChange={(e) => {
                        setValue({ ...value, tag: e.target.value });
                        if (errors.tag) setErrors({ ...errors, tag: undefined });
                    }}
                >
                    {TAGS.map((tag) => <option key={tag} value={tag}>{t(`track.tag.${tag}`)}</option>)}
                </select>
                {errors.tag && <div className="invalid-feedback">{errors.tag}</div>}

                <div className="file-row">
                    <div className="file-thumb"><IconUpload size={18}/></div>
                    <input
                        type="file"
                        className={errors.src ? 'is-invalid' : undefined}
                        style={{ display: 'none' }}
                        id="track-src"
                        onChange={handleFile}
                    />
                    <label className="btn btn-sm" htmlFor="track-src"><IconUpload size={14}/>{getFilename(value, t('musique.form.placeholder'))}</label>
                </div>
                {errors.src && <div className="invalid-feedback">{errors.src}</div>}

                <button type="submit" className="btn btn-accent-solid" style={{ marginTop: 8 }}>{t('musique.form.submit')}</button>
            </form>

            <div className="tabs" role="group" aria-label="tag-filter">
                <button type="button" className={`btn btn-sm ${activeTag === 'all' ? 'is-active' : ''}`} onClick={() => setActiveTag('all')}>{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button key={tag} type="button" className={`btn btn-sm ${activeTag === tag ? 'is-active' : ''}`} onClick={() => setActiveTag(tag)}>{t(`track.tag.${tag}`)}</button>
                ))}
            </div>

            {filtered.length === 0 && <p className="screen-sub">{t('musique.empty')}</p>}

            <div className="step-list">
                {filtered.map((track) => (
                    <div key={track.id} className="step-row">
                        <span className="dot" style={{ background: track.color }}/>
                        <span className="step-name">{track.name}</span>
                        <span className="pill">{t(`track.tag.${track.tag}`)}</span>
                        <button type="button" className="btn btn-sm" onClick={() => edit(track)}>{t('musique.edit')}</button>
                        <button type="button" className="btn btn-sm" onClick={() => remove(track)}>{t('musique.remove')}</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MusiqueScreen;
```

Note: the `<label>`/`<input type="file">` pair keeps the same ids and `htmlFor` wiring as before — only classNames and wrapper markup changed, so `getFilename`/`hasSource` behavior is untouched.

- [ ] **Step 3: Run tests, fix any className/role assertions**

Run: `npm test -- MusiqueScreen --watchAll=false`
Expected: same pass count as Step 1 baseline. If a test queries `getByRole('group', {name: 'tag-filter'})` relying on Bootstrap's `btn-group` semantics, it still passes — `role="group"` is preserved on `.tabs` above.

- [ ] **Step 4: Commit**

```bash
git add src/component/Screen/MusiqueScreen.js
git commit -m "Restyle MusiqueScreen with mockup design system"
```

---

### Task 6: SessionController + StepController + BattleRoyalStepController

**Files:**
- Modify: `src/component/Controller/SessionController.js`
- Modify: `src/component/Controller/StepController.js`
- Modify: `src/component/Controller/BattleRoyalStepController.js`

**Interfaces:**
- Consumes: `.step-list`, `.step-row`, `.step-row.current`, `.step-row.done`, `.step-name`, `.btn`/`.btn-icon`, `.player-row`, `.player-row.disabled` from `theme.css`. Icons `IconPlayerTrackPrev`/`IconPlayerTrackNext`/`IconPlayerPlay`/`IconPlayerPause`/`IconPlus`/`IconMinus`/`IconTrash`/`IconRecycle`.
- No behavior change: `session.play/pause/next/previous/plus/minus/toStep`, `player.increment/decrement/disable/enable/canX()` all called exactly as today.

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- SessionController StepController BattleRoyalStepController --watchAll=false`

- [ ] **Step 2: Restyle `StepController`**

Replace `src/component/Controller/StepController.js` in full:

```js
import 'react';
import BattleRoyalStepController from "./BattleRoyalStepController";

function StepController({session, step, index}) {
    if (step.type === 'battle-royal') {
        return <BattleRoyalStepController session={session} step={step} index={index}/>
    }

    const isCurrentStep = session.index === index;
    const isDone = session.index > index;
    return <div
        className={`step-row ${isCurrentStep ? 'current' : ''} ${isDone ? 'done' : ''}`}
        style={{cursor: isCurrentStep ? 'default' : 'pointer'}}
        onClick={isCurrentStep ? undefined : () => session.toStep(index)}
    >
        <span className="step-name">{step.name}</span>
    </div>
}

export default StepController;
```

- [ ] **Step 3: Restyle `BattleRoyalStepController`**

Replace `src/component/Controller/BattleRoyalStepController.js` in full:

```js
import 'react';
import {IconMinus, IconPlus, IconRecycle, IconTrash} from '@tabler/icons-react';
import useSession from '../Hook/useSession';

function BattleRoyalStepController({session, step, index}) {
    const isCurrentStep = session.index === index;
    const isDone = session.index > index;
    if (!isCurrentStep) {
        return <div
            className={`step-row ${isDone ? 'done' : ''}`}
            style={{cursor: 'pointer'}}
            onClick={() => session.toStep(index)}
        >
            <span className="step-name">{step.name}</span>
        </div>
    }
    const track = session.track;

    return <div className="step-row current" style={{flexDirection: 'column', alignItems: 'stretch'}}>
        <span className="step-name">{step.name}</span>
        <div className="step-list" style={{marginTop: 8}}>
            {track.players.map(player => (
                <div key={player.id} className={`player-row ${!player.enabled ? 'disabled' : ''}`}>
                    <span style={{flex: 1, fontSize: 14}}>{player.name}</span>
                    <span style={{fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: 'center'}}>{player.score}</span>
                    <button type="button" className="btn btn-icon" onClick={player.decrement} disabled={!player.canDecrement()} aria-label="decrement">
                        <IconMinus/>
                    </button>
                    <button type="button" className="btn btn-icon" onClick={player.increment} disabled={!player.canIncrement()} aria-label="increment">
                        <IconPlus/>
                    </button>
                    {player.canDisable() &&
                        <button type="button" className="btn btn-icon" onClick={player.disable} aria-label="disable"><IconTrash/></button>}
                    {player.canEnable() &&
                        <button type="button" className="btn btn-icon" onClick={player.enable} aria-label="enable"><IconRecycle/></button>}
                </div>
            ))}
        </div>
    </div>
}

export default BattleRoyalStepController;
```

- [ ] **Step 4: Restyle `SessionController`**

In `src/component/Controller/SessionController.js`: replace the icon import, replace the four transport buttons' inline white-on-dark styles with `.btn.btn-icon`, and replace the closing `<ul className="list-group" ...>` wrapper with `.step-list`. Full replacement:

```js
import 'react';
import {useEffect, Fragment} from 'react';
import {IconPlayerTrackPrev, IconPlayerTrackNext, IconMinus, IconPlayerPause, IconPlayerPlay, IconPlus} from '@tabler/icons-react';
import {useTranslation} from 'react-i18next';
import useSession from '../Hook/useSession';
import StepController from "./StepController";

function SessionController({display}) {
    display = display === undefined ? true : display
    const {t} = useTranslation();
    const session = useSession()
    const track = session?.track

    useEffect(() => {
        function handleKeyboard(event) {
            switch (event.key) {
                case ' ':
                    session.play()
                    break;
                case 'ArrowRight':
                    session.next()
                    break;
                case 'ArrowLeft':
                    session.previous()
                    break;
                case 'ArrowUp':
                    session.plus()
                    break;
                case 'ArrowDown':
                    session.minus()
                    break;
            }
        }

        document.addEventListener('keydown', handleKeyboard)
        return () => {
            document.removeEventListener('keydown', handleKeyboard)
        }
    }, [session]);

    if (!session || !display) {
        return null
    }

    return (
        <Fragment>
            <p style={{fontWeight: 500, fontSize: 15, margin: '0 0 12px'}}>{t('session.name')}</p>
            <div className="top-bar">
                {session.canMinus() && <button type="button" className="btn btn-icon" aria-label="minus" onClick={session.minus}><IconMinus/></button>}
                {session.hasPrevious() && <button type="button" className="btn btn-icon" aria-label="previous" onClick={session.previous}><IconPlayerTrackPrev/></button>}
                {track.canPlay() && <button type="button" className="btn btn-icon btn-accent" aria-label="play" onClick={session.play}><IconPlayerPlay/></button>}
                {track.canPause() && <button type="button" className="btn btn-icon btn-accent" aria-label="pause" onClick={session.pause}><IconPlayerPause/></button>}
                {session.hasNext() && <button type="button" className="btn btn-icon" aria-label="next" onClick={session.next}><IconPlayerTrackNext/></button>}
                {session.canPlus() && <button type="button" className="btn btn-icon" aria-label="plus" onClick={session.plus}><IconPlus/></button>}
            </div>
            <div className="step-list">
                {session.steps.map((step, index) => <StepController
                    key={step.id}
                    session={session}
                    step={step}
                    index={index}
                />)}
            </div>
        </Fragment>
    );
}

export default SessionController;
```

- [ ] **Step 5: Run tests, fix any className/structure assertions**

Run: `npm test -- SessionController StepController BattleRoyalStepController --watchAll=false`

These tests were written against `list-group-item`/`list-group-item-primary`/`list-group-item-secondary` classes and `<li>`/`<ul>` roles (`listitem`/`list`) — since the markup changes from `<ul><li>` to `<div>`s, any test using `getByRole('listitem')` or asserting `list-group-item-primary`/`list-group-item-secondary` classes will fail and must be updated:
- Replace `toHaveClass('list-group-item-primary')` → `toHaveClass('current')`.
- Replace `toHaveClass('list-group-item-secondary')` → `toHaveClass('done')`.
- Replace `getAllByRole('listitem')` → `container.querySelectorAll('.step-row')` (or `getAllByText(...)` if the test only needs step names).
- Button assertions by icon-derived accessible name (e.g. `getByRole('button', {name: 'Plus'})` from `react-bootstrap-icons`' default `aria-label`) must switch to the explicit `aria-label`s added above (`'minus'`, `'previous'`, `'play'`, `'pause'`, `'next'`, `'plus'`, `'decrement'`, `'increment'`, `'disable'`, `'enable'`) — do not invent new label text; use exactly these strings.

- [ ] **Step 6: Commit**

```bash
git add src/component/Controller/SessionController.js src/component/Controller/StepController.js src/component/Controller/BattleRoyalStepController.js
git commit -m "Restyle Régie live controls (SessionController/StepController/BattleRoyalStepController) with mockup step-list/player-row classes"
```

---

### Task 7: RegieLiveController

**Files:**
- Modify: `src/component/Screen/RegieLiveController.js`
- Modify: `src/component/Screen/__tests__/RegieLiveController.test.js`

**Interfaces:**
- Consumes: `.tabs`, `.btn`/`.btn-sm`/`.is-active`, `.preview-box`, `.time-display` from `theme.css`. Icons `IconMinus`/`IconPlus`.

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- RegieLiveController --watchAll=false`
Note the 3 assertions at lines 19, 130, 164 that check `toHaveClass('btn-primary')` on the active tab button.

- [ ] **Step 2: Restyle `RegieLiveController`**

In `src/component/Screen/RegieLiveController.js`:
- Replace the icon import `import {Dash, Plus} from 'react-bootstrap-icons';` with `import {IconMinus, IconPlus} from '@tabler/icons-react';` and replace the two `<Dash/>`/`<Plus/>` usages with `<IconMinus/>`/`<IconPlus/>`.
- Replace `PREVIEW_BOX_STYLE` (the inline dashed-border style object) — delete it, and change every `style={PREVIEW_BOX_STYLE}` to `className="preview-box"`.
- Replace the `time` panel's fixed `fontSize: '2em', fontWeight: 600` paragraph style with `className="time-display"` (drop the inline `style`).
- Replace the tabs button className from ``btn btn-sm ${activeType === type ? 'btn-primary' : 'btn-secondary'}`` to ``btn btn-sm ${activeType === type ? 'is-active' : ''}``.
- Replace the outer tabs wrapper's inline `style={{display: 'flex', gap: '.5em', marginBottom: '1em'}}` with `className="tabs"` (drop the `id="regie-tabs"` inline style, keep the `id` attribute if a test relies on it — check Step 1's baseline test file first; none of the current assertions query by that id, so it can be dropped).

Resulting tabs block:
```js
<div className="tabs">
    {TYPES.map((type) => (
        <button
            key={type}
            type="button"
            className={`btn btn-sm ${activeType === type ? 'is-active' : ''}`}
            onClick={() => setActiveType(type)}
        >{t(`regie.tabs.${type}`)}</button>
    ))}
</div>
```

- [ ] **Step 3: Update the 3 known test assertions**

In `src/component/Screen/__tests__/RegieLiveController.test.js`, replace all three occurrences of `'btn-primary'` with `'is-active'` (lines 19, 130, 164 as read before this task — re-locate by searching for `btn-primary` since line numbers shift if the file changed since):

```js
expect(screen.getByRole('button', {name: 'Image'})).toHaveClass('is-active');
```
and the `document.querySelector` at (previously) line 130:
```js
const incrementAlice = document.querySelector('#regie-controller .is-active');
```
Wait — that querySelector targets the battle-royal increment button inside `#regie-controller`, not the tabs; re-read the surrounding test before editing to confirm which element it targets (it may need `.btn` instead of `.is-active` if it was never an active-tab check — inspect the assertion's intent, not just the string, before replacing).

- [ ] **Step 4: Run tests**

Run: `npm test -- RegieLiveController --watchAll=false`
Expected: same pass count as Step 1 baseline.

- [ ] **Step 5: Commit**

```bash
git add src/component/Screen/RegieLiveController.js src/component/Screen/__tests__/RegieLiveController.test.js
git commit -m "Restyle RegieLiveController with mockup tabs/preview-box/time-display classes"
```

---

### Task 8: SessionCreationScreen + step variants (ImageStep/DubbingVideoStep/TimeStep/BattleRoyalStep)

**Files:**
- Modify: `src/component/Screen/SessionCreationScreen.js`
- Modify: `src/component/Step/ImageStep.js`
- Modify: `src/component/Step/DubbingVideoStep.js`
- Modify: `src/component/Step/TimeStep.js`
- Modify: `src/component/Step/BattleRoyalStep.js`

**Interfaces:**
- Consumes: `.accordion-item`/`.accordion-header`/`.accordion-body`, `.btn`/`.btn-icon`, `.field-label`, `.file-row`/`.file-thumb` from `theme.css`. Icons `IconChevronUp`/`IconChevronDown`/`IconEdit`/`IconTrash`/`IconPhoto`/`IconMovie`/`IconClock`/`IconShield`/`IconUpload`.
- No change to validation logic (`validate` exports), IPC payloads, or hydration behavior.

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- SessionCreationScreen ImageStep DubbingVideoStep TimeStep BattleRoyalStep --watchAll=false`

- [ ] **Step 2: Restyle the step accordion header in `SessionCreationScreen`**

In `src/component/Screen/SessionCreationScreen.js`:
- Replace the icon import line with:
```js
import {IconChevronUp, IconChevronDown, IconEdit, IconTrash, IconPhoto, IconMovie, IconClock, IconShield} from '@tabler/icons-react';
```
- Update `stepIcons` to the new components:
```js
const stepIcons = {
    image: IconPhoto,
    'dubbing-video': IconMovie,
    time: IconClock,
    'battle-royal': IconShield,
};
```
- Replace the accordion header's inner `<div style={{display: 'flex', ...}}>` with `className="accordion-header"` (drop the inline style object), and its four action buttons' className from `"btn btn-link"` to `"btn btn-icon"`, swapping `<ChevronUp/>`/`<ChevronDown/>`/`<Pen/>`/`<Trash/>` for `<IconChevronUp/>`/`<IconChevronDown/>`/`<IconEdit/>`/`<IconTrash/>`.
- Replace the name input's wrapping `<div style={{marginBottom: 20}}>` block's button className `"btn btn-primary"` with `"btn btn-accent-solid"`.
- Replace the bottom "Ajouter :" buttons' className `"btn btn-light"` with `"btn btn-sm"`.
- Leave every `id`, `htmlFor`, `aria-label`, and `t(...)` call unchanged — only classNames and icon components move.

- [ ] **Step 3: Restyle `ImageStep`**

Replace `src/component/Step/ImageStep.js` in full:

```js
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import { getFilename, hasSource } from '../../lib/filename';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    return errors;
}

function ImageStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleFile(e) {
        setValue({
            ...value,
            file: e.target.files[0]
        })
        if (errors.file) setErrors({...errors, file: undefined})
    }

    return <Fragment>
        <label htmlFor={`step-file-${value.id}`} className="field-label">{t('step.form.src.label')}</label>
        <div className="file-row">
            <div className="file-thumb"><IconUpload size={18}/></div>
            <input
                type="file"
                style={{ display: 'none' }}
                className={errors.file ? 'is-invalid' : undefined}
                id={`step-file-${value.id}`}
                onChange={handleFile}
            />
            <label className="btn btn-sm" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
        </div>
        {errors.file && <div className="invalid-feedback">{errors.file}</div>}
    </Fragment>
}

export default ImageStep;
```

- [ ] **Step 4: Restyle `DubbingVideoStep`**

Replace `src/component/Step/DubbingVideoStep.js` in full:

```js
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import { getFilename, hasSource } from '../../lib/filename';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    if (!value.time || !value.time.trim()) errors.time = t('step.form.error.time');
    return errors;
}

function DubbingVideoStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleFile(e) {
        setValue({
            ...value,
            file: e.target.files[0]
        })
        if (errors.file) setErrors({...errors, file: undefined})
    }

    function handleChange(e) {
        const name = e.target.getAttribute('name');
        setValue({
            ...value,
            [name]: e.target.value
        })
        if (errors[name]) setErrors({...errors, [name]: undefined})
    }

    return <Fragment>
        <label htmlFor={`step-file-${value.id}`} className="field-label">{t('step.form.src.label')}</label>
        <div className="file-row">
            <div className="file-thumb"><IconUpload size={18}/></div>
            <input
                type="file"
                style={{display: 'none'}}
                className={errors.file ? 'is-invalid' : undefined}
                id={`step-file-${value.id}`}
                onChange={handleFile}
            />
            <label className="btn btn-sm" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
        </div>
        {errors.file && <div className="invalid-feedback">{errors.file}</div>}

        <label htmlFor={`step-time-${value.id}`} className="field-label">{t('step.form.time')}</label>
        <input
            type="text"
            id={`step-time-${value.id}`}
            style={{width: 120, marginBottom: 10}}
            className={errors.time ? 'is-invalid' : ''}
            value={value.time ?? ''}
            name='time'
            onChange={handleChange}
        />
        {errors.time && <div className="invalid-feedback">{errors.time}</div>}

        <label htmlFor={`step-description-${value.id}`} className="field-label">{t('step.form.description')}</label>
        <textarea
            id={`step-description-${value.id}`}
            style={{width: '100%'}}
            value={value.description ?? ''}
            name='description'
            onChange={handleChange}
        />
    </Fragment>
}

export default DubbingVideoStep;
```

- [ ] **Step 5: Restyle `TimeStep`**

Replace `src/component/Step/TimeStep.js` in full:

```js
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

export function validate(value, t) {
    const errors = {};
    ['impro', 'minutes'].forEach((field) => {
        const n = Number(value[field]);
        if (value[field] === '' || value[field] === undefined || !Number.isInteger(n) || n < 1) {
            errors[field] = t('step.form.error.' + field);
        }
    });
    return errors;
}

function TimeStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleChange(e) {
        const name = e.target.getAttribute('name');
        setValue({
            ...value,
            [name]: e.target.value
        })
        if (errors[name]) setErrors({...errors, [name]: undefined})
    }

    return <Fragment>
        <label htmlFor={`step-impro-${value.id}`} className="field-label">{t('step.form.impro')}</label>
        <input
            type="number"
            min="1"
            id={`step-impro-${value.id}`}
            style={{width: 100, marginBottom: 10}}
            className={errors.impro ? 'is-invalid' : ''}
            value={value.impro ?? ''}
            name='impro'
            onChange={handleChange}
        />
        {errors.impro && <div className="invalid-feedback">{errors.impro}</div>}

        <label htmlFor={`step-minutes-${value.id}`} className="field-label">{t('step.form.minutes')}</label>
        <input
            type="number"
            min="1"
            id={`step-minutes-${value.id}`}
            style={{width: 100}}
            className={errors.minutes ? 'is-invalid' : ''}
            value={value.minutes ?? ''}
            name='minutes'
            onChange={handleChange}
        />
        {errors.minutes && <div className="invalid-feedback">{errors.minutes}</div>}
    </Fragment>
}

export default TimeStep;
```

- [ ] **Step 6: Restyle `BattleRoyalStep`**

Replace `src/component/Step/BattleRoyalStep.js` in full:

```js
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

export function validate(value, t) {
    const errors = {};
    const names = (value.players || '').split(';').map(x => x.trim()).filter(Boolean);
    if (names.length === 0) errors.players = t('step.form.error.players');
    return errors;
}

function BattleRoyalStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleChange(e) {
        const name = e.target.getAttribute('name');
        setValue({
            ...value,
            [name]: e.target.value
        })
        if (errors[name]) setErrors({...errors, [name]: undefined})
    }

    return <Fragment>
        <label htmlFor={`step-players-${value.id}`} className="field-label">{t('step.form.players.label')}</label>
        <input
            type="text"
            id={`step-players-${value.id}`}
            style={{width: '100%'}}
            className={errors.players ? 'is-invalid' : ''}
            value={value.players ?? ''}
            name='players'
            onChange={handleChange}
        />
        {errors.players && <div className="invalid-feedback">{errors.players}</div>}
        <small id={`step-players-${value.id}-help`} style={{fontSize: 12, color: 'var(--text-muted)'}}>
            {t('step.form.players.help')}
        </small>
    </Fragment>
}

export default BattleRoyalStep;
```

- [ ] **Step 7: Run tests, fix any className assertions**

Run: `npm test -- SessionCreationScreen ImageStep DubbingVideoStep TimeStep BattleRoyalStep --watchAll=false`
Expected: same pass count as Step 1 baseline (all four variant components' tests target by `htmlFor`/label text/role, established in the `session-creation-screen` plan). If a test asserts `form-group`/`form-control`/`custom-file-input` classes directly, drop that assertion's class check or update it to the new markup — do not remove the surrounding behavioral assertion (e.g. keep checking the error message text; only the class name changes).

- [ ] **Step 8: Commit**

```bash
git add src/component/Screen/SessionCreationScreen.js src/component/Step/ImageStep.js src/component/Step/DubbingVideoStep.js src/component/Step/TimeStep.js src/component/Step/BattleRoyalStep.js
git commit -m "Restyle SessionCreationScreen and step variants with mockup design system"
```

---

### Task 9: WorkflowDashboard — card-grid restructure

**Files:**
- Modify: `src/component/Dashboard/WorkflowDashboard.js`
- Modify: `src/component/Workflow/WorkflowItem.js`
- Modify: `src/component/Dashboard/__tests__/WorkflowDashboard.test.js`

**Interfaces:**
- Consumes: `.grid`/`.grid-cards`, `.workflow-card`, `.color-chip`, `.btn`/`.btn-sm` from `theme.css`. Icons `IconPlayerPlay`/`IconEdit`/`IconTrash`.
- Consumes (unchanged): `onCreateNew()`, `onEditWorkflow(workflow)` props (from Dashboard.js — no change to Dashboard.js needed), `window.electronAPI.workflowRemove(id)`, `window.electronAPI.sessionPlay(workflow)`.
- Produces: `WorkflowItem` now takes `{workflow, onPlay, onEdit, onRemove}` instead of `{workflow, onSelect}` — no other file imports `WorkflowItem` (verified: only `WorkflowDashboard.js`), so this signature change is self-contained.

This task removes the click-to-select master/detail flow entirely — no more intermediate "selected workflow" state, no more inline `StepDashboard`. Every workflow renders as a card with its three actions directly on it, matching `mockups/script.js`'s `workflowCard()`.

- [ ] **Step 1: Run existing tests as baseline**

Run: `npm test -- WorkflowDashboard --watchAll=false`

- [ ] **Step 2: Rewrite `WorkflowItem` as a card**

Replace `src/component/Workflow/WorkflowItem.js` in full:

```js
import { IconEdit, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

function WorkflowItem({ workflow, onPlay, onEdit, onRemove }) {
    const { t } = useTranslation();
    const updatedAt = moment(workflow.updatedAt);

    return <div className="workflow-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div className="color-chip" style={{ background: workflow.color }}/>
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0, flex: 1 }}>{workflow.name}</p>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px' }}>{updatedAt.fromNow()}</p>
        <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-sm" style={{ flex: 1 }} aria-label={t('workflow.play')} onClick={() => onPlay(workflow)}><IconPlayerPlay/></button>
            <button type="button" className="btn btn-sm" style={{ flex: 1 }} aria-label={t('workflow.edit')} onClick={() => onEdit(workflow)}><IconEdit/></button>
            <button type="button" className="btn btn-sm" style={{ flex: 1 }} aria-label={t('workflow.remove')} onClick={() => onRemove(workflow)}><IconTrash/></button>
        </div>
    </div>
}

export default WorkflowItem;
```

- [ ] **Step 3: Rewrite `WorkflowDashboard`**

Replace `src/component/Dashboard/WorkflowDashboard.js` in full:

```js
import { useTranslation } from 'react-i18next';
import useWorkflows from '../Hook/useWorkflows.js';
import WorkflowItem from '../Workflow/WorkflowItem.js';

function WorkflowDashboard({ onCreateNew, onEditWorkflow }) {
  const { t } = useTranslation();
  const workflows = useWorkflows()

  function play(workflow) {
    window.electronAPI.sessionPlay(workflow)
  }

  function edit(workflow) {
    onEditWorkflow(workflow)
  }

  function remove(workflow) {
    window.electronAPI.workflowRemove(workflow.id)
  }

  return (
    <div className="content">
      <div className="top-bar">
        <p className="screen-title">{t('workflow.name')}</p>
        <button type="button" className="btn btn-accent" onClick={onCreateNew}>{t('workflow.create')}</button>
      </div>
      <div className="grid grid-cards">
        {workflows.map((workflow) => (
          <WorkflowItem key={workflow.id} workflow={workflow} onPlay={play} onEdit={edit} onRemove={remove}/>
        ))}
      </div>
    </div>
  );
}

export default WorkflowDashboard;
```

Note: `StepDashboard` is no longer imported or rendered — Task 10 deletes it along with its own dependencies once this task confirms nothing else needs it.

- [ ] **Step 4: Rewrite `WorkflowDashboard.test.js`**

Replace `src/component/Dashboard/__tests__/WorkflowDashboard.test.js` in full:

```js
import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import WorkflowDashboard from '../WorkflowDashboard';

describe('WorkflowDashboard', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
        };
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('calls onCreateNew when the create button is clicked', () => {
        const onCreateNew = jest.fn();
        render(<WorkflowDashboard onCreateNew={onCreateNew} onEditWorkflow={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: /Créer une session/}));

        expect(onCreateNew).toHaveBeenCalledTimes(1);
    });

    it('renders one card per workflow with name and relative update time', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', updatedAt: new Date().toISOString()};
        seedWorkflows([workflow]);

        expect(screen.getByText('Remise des diplômes')).toBeInTheDocument();
    });

    it('calls onEditWorkflow with the workflow when its Modifier button is clicked', () => {
        const onEditWorkflow = jest.fn();
        render(<WorkflowDashboard onEditWorkflow={onEditWorkflow} onCreateNew={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: /Modifier/}));

        expect(onEditWorkflow).toHaveBeenCalledWith(workflow);
    });

    it('removes the workflow via IPC when its Supprimer button is clicked', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Gala annuel', color: '#D85A30'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: /Supprimer/}));

        expect(window.electronAPI.workflowRemove).toHaveBeenCalledWith('wf-1');
    });

    it('plays the workflow via IPC when its Démarrer button is clicked', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: /Démarrer/}));

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
    });
});
```

If any `t('workflow.play')`/`t('workflow.edit')`/`t('workflow.remove')` translation value differs from `Démarrer`/`Modifier`/`Supprimer`, check `src/i18n/translation.fr.json` first and adjust the `name:` regexes above to match the real strings rather than guessing.

- [ ] **Step 5: Run tests**

Run: `npm test -- WorkflowDashboard --watchAll=false`
Expected: 5 passing tests (all newly written above).

- [ ] **Step 6: Commit**

```bash
git add src/component/Dashboard/WorkflowDashboard.js src/component/Workflow/WorkflowItem.js src/component/Dashboard/__tests__/WorkflowDashboard.test.js
git commit -m "Restructure Sessions screen into mockup's card grid with inline play/edit/delete actions"
```

---

### Task 10: Retire the legacy step-editing UI and the standalone Workflow/Step edit windows

**Files:**
- Delete: `src/component/Dashboard/StepDashboard.js` (+ its test if one exists)
- Delete: `src/component/Step/StepItem.js` (+ its test if one exists)
- Delete: `src/component/Step/AddStep.js` (+ its test if one exists)
- Delete: `src/component/Workflow/Workflow.js` (+ its test if one exists)
- Delete: `src/component/Step/Step.js` (+ its test if one exists)
- Delete: `public/script/window/WorkflowWindow.js`
- Delete: `public/script/window/StepWindow.js`
- Delete: `public/script/preload/preload-workflow.js`
- Delete: `public/script/preload/preload-step.js`
- Modify: `public/script/window/MainWindow.js`
- Modify: `public/script/preload/preload-main.js`
- Modify: `src/App.js`

**Interfaces:**
- No new interfaces — this task only removes code that Task 9 made unreachable. It must run after Task 9 (the trigger for this dead code — `WorkflowDashboard`'s old `create()`/`edit()` calling `workflowOpen` — no longer exists once Task 9 lands, and `StepDashboard`/`StepItem`/`AddStep` were the only callers of `stepOpen`/`workflowOpen`).

**Why this is safe:** `grep -rn "workflowOpen\|stepOpen" src public --include="*.js"` (run before this task, after Task 9) will show matches only in the files listed above for deletion, plus `public/script/window/MainWindow.js` and `public/script/preload/preload-main.js` (the IPC wiring being trimmed below). If that grep turns up any other caller, stop and re-scope this task — do not delete blind.

- [ ] **Step 1: Verify there are no remaining callers**

Run: `grep -rn "workflowOpen\|stepOpen\|WorkflowWindow\|StepWindow" src public --include="*.js" | grep -v node_modules`

Expected matches, and only these:
- `src/component/Dashboard/StepDashboard.js` / `StepItem.js` / `AddStep.js` (being deleted this task)
- `public/script/window/MainWindow.js` (IPC registration, trimmed below)
- `public/script/window/StepWindow.js` / `WorkflowWindow.js` (being deleted this task)
- `public/script/preload/preload-main.js` (bridge methods, trimmed below)

If anything else appears, stop and report — do not proceed with deletion.

- [ ] **Step 2: Delete the dead component files**

```bash
git rm src/component/Dashboard/StepDashboard.js
git rm src/component/Step/StepItem.js
git rm src/component/Step/AddStep.js
git rm src/component/Workflow/Workflow.js
git rm src/component/Step/Step.js
find src/component/Dashboard/__tests__ src/component/Step/__tests__ src/component/Workflow/__tests__ -iname "StepDashboard*" -o -iname "StepItem*" -o -iname "AddStep*" -o -iname "Workflow.test.js" -o -iname "Step.test.js" 2>/dev/null
```

Run the `find` above first to discover exact test filenames (they may or may not exist under those exact names), then `git rm` whatever it lists.

- [ ] **Step 3: Delete the dead Electron window files**

```bash
git rm public/script/window/WorkflowWindow.js
git rm public/script/window/StepWindow.js
git rm public/script/preload/preload-workflow.js
git rm public/script/preload/preload-step.js
```

- [ ] **Step 4: Trim `MainWindow.js`**

In `public/script/window/MainWindow.js`, remove:
- The `const WorkflowWindow = require('./WorkflowWindow.js');` and `const StepWindow = require('./StepWindow.js')` lines.
- The `this.workflowOpen = this.workflowOpen.bind(this)` and `this.stepOpen = this.stepOpen.bind(this)` lines.
- The `ipcMain.removeListener('workflow-open', this.workflowOpen)` and `ipcMain.removeListener('step-open', this.stepOpen)` lines (in the `'closed'` handler).
- The `ipcMain.addListener('workflow-open', this.workflowOpen)` and `ipcMain.addListener('step-open', this.stepOpen)` lines (in `initHandle()`).
- The `workflowOpen(event, value) { ... }` and `stepOpen(event, {workflowId, value, afterIndex}) { ... }` method bodies in full.

Read the file first to confirm exact surrounding lines before deleting — the method bodies may reference `this.workflowWindow`/`this.stepWindow` fields that should also be removed if unused elsewhere in the class (check with `grep -n "workflowWindow\|stepWindow" public/script/window/MainWindow.js` after this edit — expect zero remaining matches).

- [ ] **Step 5: Trim `preload-main.js`**

In `public/script/preload/preload-main.js`, remove the `workflowOpen: (value) => ipcRenderer.send('workflow-open', value),` and `stepOpen: ({workflowId, value, afterIndex}) => ipcRenderer.send('step-open', {workflowId, value, afterIndex}),` lines from the `mode: 'main'` electronAPI bridge object. Leave `workflowSave`/`workflowRemove`/`stepSave`/`stepRemove`/`trackFetch`/etc. untouched.

- [ ] **Step 6: Trim `App.js`'s mode switch**

In `src/App.js`, remove the now-dead `'workflow'` and `'step'` cases and their imports:

```js
import React, { useEffect, useState } from 'react';
import './App.css';
import './theme.css';
import Dashboard from './component/Dashboard/Dashboard';
import Session from './component/Session/Session';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard />;
    case 'session':
      return <Session />;
    default:
      return 'loading...';
  }
}

export default App;
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test -- --watchAll=false`
Expected: no failures from missing modules (no remaining file imports anything just deleted — confirmed by Step 1's grep). Total test count drops by exactly the number of test files deleted in Step 2.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Retire the standalone Workflow/Step edit windows and legacy StepDashboard, superseded by SessionCreationScreen"
```

---

### Task 11: Remove `react-bootstrap-icons` and Bootstrap package dependency

**Files:**
- Modify: `package.json`
- Modify: `src/entity/BattleRoyalTrack.js`

**Interfaces:**
- None — this is a final cleanup, no behavior touched.

- [ ] **Step 1: Verify zero remaining usages**

Run: `grep -rl "react-bootstrap-icons" src --include="*.js" | grep -v __tests__`

Expected: only `src/entity/BattleRoyalTrack.js` (a dead, unused import — `Dash, Plus, Trash` are imported but never referenced anywhere in that file's body). If any other file appears, stop — a prior task's migration was incomplete; go back and finish it before proceeding.

- [ ] **Step 2: Remove the dead import**

In `src/entity/BattleRoyalTrack.js`, delete the line `import {Dash, Plus, Trash} from "react-bootstrap-icons";`.

- [ ] **Step 3: Remove the packages**

Run: `npm uninstall react-bootstrap-icons bootstrap`

Verify `package.json`'s `dependencies` no longer lists either package.

- [ ] **Step 4: Run the full test suite**

Run: `npm test -- --watchAll=false`
Expected: no failures (nothing imports either package anymore).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/entity/BattleRoyalTrack.js
git commit -m "Remove Bootstrap and react-bootstrap-icons now that the mockup design system fully replaces them"
```

---

### Task 12: Manual verification against the real Electron app

**Files:** none (verification only).

- [ ] **Step 1: Start the app**

Run: `npm start` (or the project's existing Electron dev entrypoint — check `package.json`'s `scripts` for the exact command used in prior sessions).

- [ ] **Step 2: Visually check every migrated screen**

Using the project's existing Playwright `_electron` driver pattern (built ad hoc during the `session-creation-screen` plan's Task 8 — no persistent project skill exists yet for this; recreate a small one-shot driver script the same way, or drive manually), walk through and screenshot:
- Sidebar (both nav items, hover/active states, nav-tag badges when a session/music is running).
- Régie empty state (session cards grid) and Régie live state (two-column session controller + live controller, tabs, time/battle-royal panels).
- Musique screen (tag filter, add form, track list).
- Sessions screen (card grid — color chip, relative update time, play/edit/delete buttons).
- Création/édition de session (accordion, add-by-type buttons, all four step-type editors).

Confirm: no unstyled (raw browser default) buttons/inputs anywhere (a sign a class name typo'd or `theme.css` didn't load), no missing icons (blank squares), and the Sessions screen no longer shows any click-to-select intermediate step.

- [ ] **Step 3: Exercise the Sessions screen's new inline actions end-to-end**

Create a session, verify it appears as a card; click its Modifier button and confirm it opens `SessionCreationScreen` pre-filled; go back, click Supprimer and confirm the card disappears; create another and click Démarrer and confirm Régie switches to the live view for it.

- [ ] **Step 4: Report findings**

If everything renders as expected, no code changes needed — this task is verification-only. If a visual defect is found, fix it in the relevant task's file (do not create a new task) and re-run Step 2 for that screen.
