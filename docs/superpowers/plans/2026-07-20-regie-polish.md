# Régie Screen Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `RegieScreen.js` from its v1 minimal shape (empty-state session picker OR a bare `<SessionController/>`+`<AudioController/>` stack) up to mockup parity: a collapsible "Session" card, a two-column live layout (step list + a tag/type tab bar with a per-type controller/preview panel), an "Audio en cours" card, and a "Démarrer une musique" card powered by the already-built `RegieTrackPicker`.

**Architecture:** `RegieScreen.js` keeps its existing `useWorkflows()`/`useSession()`-driven empty-state/live-state switch, now wrapped in a collapsible card, and gains two new sibling cards below it ("Audio en cours" wrapping the relocated `<AudioController/>`, "Démarrer une musique" wrapping `<RegieTrackPicker/>` fed by `useTracks()`/`useAudios()`). The live-state branch renders the existing, unmodified `<SessionController/>` in a left column next to a brand-new `RegieLiveController` component in a right-column card; `RegieLiveController` calls `useSession()` independently (this codebase's established multi-call pattern) and owns its own local "which type tab is active" state, rendering a decorative-only panel for `image`/`dubbing-video` and a real, IPC-wired panel for `time`/`battle-royal` — but only when that tab's type matches the actual current step, since only `session.track` (never other entries in `session.steps`) carries live, mutable, IPC-synced state.

**Tech Stack:** React 19, react-i18next, react-bootstrap-icons, Jest + React Testing Library (jsdom), existing `useWorkflows`/`useSession` hooks, `useAudios`/`useTracks` hooks and `RegieTrackPicker` component built by the two sibling plans below, existing `window.electronAPI` IPC bridge (no changes to it in this plan).

## Global Constraints

- **This plan's premise is that the two sibling plans below have already been fully executed.** At the time this document was written, neither `docs/superpowers/plans/2026-07-20-nav-shell-regie-v1.md` nor `docs/superpowers/plans/2026-07-20-music-tag-library.md` had been executed yet — `src/component/Screen/`, `src/component/Track/`, `src/component/Sidebar/`, and `src/component/Hook/useAudios.js`/`useTracks.js` did not exist on disk when this plan was authored (verified: `ls src/component/Screen` failed). **Before starting Task 1, re-read fresh from the real, current repo** (not just the plan docs, which may have drifted from what actually got built): `src/component/Screen/RegieScreen.js`, `src/component/Hook/useAudios.js`, `src/component/Hook/useTracks.js`, `src/component/Track/RegieTrackPicker.js`, `src/component/Controller/AudioController.js`, `src/component/Controller/SessionController.js`, `src/component/Controller/BattleRoyalStepController.js`, `src/entity/Session.js`, `src/entity/TimeTrack.js`, `src/entity/BattleRoyalTrack.js`, `src/entity/Player.js`, `src/i18n/translation.fr.json`. If anything below doesn't match the real file, adapt the diff to the real file and note the deviation in that task's commit message — the real code on disk always wins over this document.
- **`session.steps` entries are static step config, not live state — only `session.track` (the current step) is live and IPC-synced.** Verified by reading the backend entities: `Step`/`TimeStep`/`BattleRoyalStep` (`public/script/application/entity/step/*.js`) carry only `{id, name, type, ...static config}` (e.g. `impro`/`minutes` for time, `players` as plain name **strings** for battle-royal) — never `count`/`time`/`paused`/`score`/`enabled`. Those live fields only ever exist on `session.track` (constructed via `TrackFactory.fromStep(steps[session.index])` in `SessionWindow.js`, mutated in place by `trackChange`). Consequence: **the `time` and `battle-royal` tabs in `RegieLiveController` can only be real/interactive when `session.track.type` equals that tab's type** (i.e. the tab matches the actually-current step) — there is no live data source for a same-type step sitting elsewhere in `session.steps`. When the active tab's type doesn't match `session.track.type`, both tabs render the same short fallback message (`regie.tabs.inactive`) instead of fabricating non-functional controls. This is the resolution to the ambiguity around "which battle-royal step" the tab should show — it is not "any battle-royal step in the list", it is strictly "the current step, if it happens to be that type".
- **No "Terminer la session" button.** The mockup (`mockups/index.html:75`) shows one, but there is no existing `window.electronAPI` method or IPC channel to end a session from the renderer today (verified: `grep -rn "session-end\|sessionEnd\|session-close"` across `public/` and `src/` only matches `sessionClose`, which is `MainWindow`'s internal handler for when the separate Session `BrowserWindow` is closed — nothing calls it from the main window's UI). Adding one would require touching `public/script/window/MainWindow.js` and `public/script/preload/preload-main.js`, which contradicts this plan's inherited scope (a frontend-polish plan, no IPC channel changes — same boundary the two sibling plans already enforce on themselves). This button is deliberately omitted; do not invent a new IPC channel to support it.
- **Collapsing the "Session" card unmounts its content (conditional render), not a CSS `display:none` toggle** — unlike the mockup's plain-DOM-and-CSS approach. This is a deliberate deviation: React Testing Library's `getByText`/`queryByText` do not filter by CSS visibility (only `getByRole` does, via its `hidden` option), so a `display:none`-only toggle would leave collapsed content still findable by text queries, making the collapse untestable/incorrect. Conditional rendering (`{!collapsed && <div>...</div>}`) is the correct, idiomatic React equivalent and is what this plan implements.
- **`SessionController.js` is not modified at all.** Per the sibling nav-shell plan's own constraint (carried forward here), it stays exactly as today. The left column of the live two-column layout is `<SessionController/>` rendered whole (transport bar + its own embedded step `<ul>`); `RegieLiveController` is a fully independent new component that calls `useSession()` itself, consistent with this codebase's established pattern of multiple independent hook calls across sibling components (e.g. `Dashboard.js` and `SessionController.js` both calling `useSession()` in the nav-shell plan).
- **Known, accepted duplication:** when the current step is `battle-royal`, the interactive scoreboard already renders inline in the left step list today (`SessionController` → `StepController` → `BattleRoyalStepController`, pre-existing, unchanged behavior) *and* now also renders in the right-hand "Battle Royal" tab built by this plan (same component, same props, same live `session`/`track` instance). Both are wired to the identical mutable state, so interacting with either updates the same thing — this is visual duplication, not a functional conflict, and matches this plan's explicit instruction to reuse `BattleRoyalStepController` for the tab regardless of what the left column already shows.
- `image`/`dubbing-video` tabs are permanently decorative (a static preview box; the `dubbing-video` tab additionally shows a **disabled**, non-interactive `<input type="range"/>` and static time labels) — this codebase has no real thumbnail/video-scrubbing control anywhere today, and building one is out of scope for this plan (legitimate, explicitly-scoped simplification, not a corner cut).
- Follow the existing flat-key JSON convention in `src/i18n/translation.fr.json` (nested objects, French strings) for every new key, merged additively under the existing top-level `regie` object (which already has `regie.title`/`regie.empty.title` from the nav-shell plan).
- Every component test that renders translated text imports `'../../../lib/i18n'` first, matching the existing convention (`AudioController.test.js`, `BattleRoyalStepController.test.js` does **not** because it renders no translated text — follow whichever applies).
- This codebase's real test convention (verified in `SessionController.test.js`, `BattleRoyalStepController.test.js`, `useWorkflows.test.js`): drive real hooks via `document.dispatchEvent(new CustomEvent(...))` or by seeding `window.session` directly (for `useSession()`, which seeds from `window.session` on mount — see `useSession.js`), and mock `window.electronAPI` methods with `jest.fn()`. `jest.mock()` is only ever used to stub **child components**, never custom hooks. All test code in this plan follows the same convention.
- Icon-only buttons in this plan's new code get an explicit `aria-label` (the collapse/expand toggle, the impro prev/next buttons) so tests can query them by accessible name — this mirrors the mockup's own use of `aria-label` on equivalent buttons (`mockups/index.html:57`, `:72-74`).
- Test command: `yarn test --watchAll=false <path-or-pattern>`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/component/Screen/RegieLiveController.js` | Create | Renders the 4 type tabs (`image`/`dubbing-video`/`time`/`battle-royal`) plus the per-type controller/preview panel for whichever tab is active; calls `useSession()` itself. |
| `src/component/Screen/__tests__/RegieLiveController.test.js` | Create | Tab switching + default tab, decorative image/dubbing-video panels, real time countdown + impro navigation, real battle-royal scoreboard reuse, `inactive`-type fallback for both real tabs. |
| `src/component/Screen/RegieScreen.js` | Modify | Add collapsible "Session" card wrapper; wire the two-column live layout (`SessionController` + `RegieLiveController`); relocate `AudioController` into an "Audio en cours" card; add a "Démarrer une musique" card wiring `RegieTrackPicker`. |
| `src/component/Screen/__tests__/RegieScreen.test.js` | Modify | Extend with collapse/expand assertions, "Audio en cours" card assertions, "Démarrer une musique" card + `audio-play` dispatch assertions — every pre-existing assertion stays green throughout. |
| `src/i18n/translation.fr.json` | Modify | Add `regie.session.{label,collapse,expand}`, `regie.tabs.{image,dubbing-video,time,battle-royal,inactive}`, `regie.controller.{imagePreview,dubbingPreview,impro,improPrevious,improNext}`, `regie.audios.title`, `regie.music.title`. |

---

### Task 1: Collapsible "Session" card wrapper in `RegieScreen.js`

**Files:**
- Modify: `src/component/Screen/RegieScreen.js` (full rewrite)
- Modify: `src/component/Screen/__tests__/RegieScreen.test.js` (full rewrite, keeps every pre-existing assertion)
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `useWorkflows()`, `useSession()`, `<SessionController/>`, `<AudioController/>` (all existing/pre-built by the nav-shell plan, unchanged signatures).
- Produces: `<RegieScreen/>` (no props, unchanged) now with a `collapsed` local `useState` and a chevron toggle button — no new interface consumed by anything else yet.

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — merge into the existing "regie" object
"regie": {
    "title": "Régie",
    "empty": {
        "title": "Aucune session en cours. Choisis une session à démarrer."
    },
    "session": {
        "label": "Session",
        "collapse": "Réduire la session",
        "expand": "Afficher la session"
    }
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Screen/__tests__/RegieScreen.test.js — full file
import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import RegieScreen from '../RegieScreen';

describe('RegieScreen', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            sessionPlay: jest.fn(),
            trackPlay: jest.fn(),
            trackEnd: jest.fn(),
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

    it('collapses and expands the session card content while keeping the header visible', () => {
        render(<RegieScreen/>);
        seedWorkflows([{id: 'wf-1', name: 'Remise des diplômes'}]);

        expect(screen.getByText('Session')).toBeTruthy();
        expect(screen.getByText('Remise des diplômes')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: 'Réduire la session'}));

        expect(screen.getByText('Session')).toBeTruthy();
        expect(screen.queryByText('Remise des diplômes')).toBeNull();

        fireEvent.click(screen.getByRole('button', {name: 'Afficher la session'}));

        expect(screen.getByText('Remise des diplômes')).toBeTruthy();
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: FAIL on the new "collapses and expands" test with "Unable to find role='button' and name 'Réduire la session'" — the current `RegieScreen.js` has no collapse toggle yet.
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/RegieScreen.js — full file
import 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ChevronDown, ChevronUp} from 'react-bootstrap-icons';
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
    const [collapsed, setCollapsed] = useState(false);

    function toggleCollapsed() {
        setCollapsed((current) => !current);
    }

    return (
        <div style={{padding: '1em'}}>
            <h1>{t('regie.title')}</h1>

            <div className="card" style={{padding: '1em', marginBottom: '1em'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <p style={{fontWeight: 500, margin: 0}}>{t('regie.session.label')}</p>
                    <button
                        type="button"
                        className="btn btn-light"
                        aria-label={collapsed ? t('regie.session.expand') : t('regie.session.collapse')}
                        onClick={toggleCollapsed}
                    >
                        {collapsed ? <ChevronDown/> : <ChevronUp/>}
                    </button>
                </div>
                {!collapsed && (
                    <div style={{marginTop: '1em'}}>
                        {session ? (
                            <>
                                <SessionController/>
                                <AudioController/>
                            </>
                        ) : (
                            <>
                                <p>{t('regie.empty.title')}</p>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1em'}}>
                                    {workflows.map((workflow) => <RegieSessionCard key={workflow.id} workflow={workflow}/>)}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegieScreen;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: PASS (4 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/RegieScreen.js src/component/Screen/__tests__/RegieScreen.test.js src/i18n/translation.fr.json
git commit -m "Add collapsible Session card wrapper to RegieScreen"
```

---

### Task 2: `RegieLiveController.js` — tabs + decorative image/dubbing-video panels

**Files:**
- Create: `src/component/Screen/RegieLiveController.js`
- Test: `src/component/Screen/__tests__/RegieLiveController.test.js`
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `useSession()` (existing, `src/component/Hook/useSession.js`).
- Produces: `<RegieLiveController/>` (no props) — not yet wired into `RegieScreen.js` (Task 5's job). Renders `null` if there is no session.

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — merge into the existing "regie" object
"regie": {
    "tabs": {
        "image": "Image",
        "dubbing-video": "Vidéo de doublage",
        "time": "Time",
        "battle-royal": "Battle Royal"
    },
    "controller": {
        "imagePreview": "Aperçu image plein écran",
        "dubbingPreview": "Lecture vidéo (muet)"
    }
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Screen/__tests__/RegieLiveController.test.js
import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import RegieLiveController from '../RegieLiveController';

describe('RegieLiveController', () => {
    afterEach(() => {
        delete window.session;
    });

    it('renders nothing when there is no active session', () => {
        const {container} = render(<RegieLiveController/>);
        expect(container).toBeEmptyDOMElement();
    });

    it('defaults the active tab to the current track type and shows the decorative image panel', () => {
        window.session = {track: {type: 'image', src: '/tmp/logo.png'}, steps: [{id: 's1', name: 'Logo', type: 'image'}], index: 0};
        render(<RegieLiveController/>);

        expect(screen.getByRole('button', {name: 'Image'})).toHaveClass('btn-primary');
        expect(screen.getByText('Aperçu image plein écran')).toBeTruthy();
    });

    it('renders all four tabs', () => {
        window.session = {track: {type: 'time', count: 1, impro: 3}, steps: [], index: 0};
        render(<RegieLiveController/>);

        expect(screen.getByRole('button', {name: 'Image'})).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Vidéo de doublage'})).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Time'})).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Battle Royal'})).toBeTruthy();
    });

    it('switches to the decorative, non-interactive dubbing-video panel when its tab is clicked', () => {
        window.session = {track: {type: 'image', src: '/tmp/logo.png'}, steps: [{id: 's1', name: 'Logo', type: 'image'}], index: 0};
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Vidéo de doublage'}));

        expect(screen.getByText('Lecture vidéo (muet)')).toBeTruthy();
        expect(screen.getByRole('slider')).toBeDisabled();
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieLiveController.test.js`
Expected: FAIL with "Cannot find module '../RegieLiveController'"
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/RegieLiveController.js
import 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import useSession from '../Hook/useSession';

const TYPES = ['image', 'dubbing-video', 'time', 'battle-royal'];
const PREVIEW_BOX_STYLE = {border: '1px dashed #ccc', padding: '2em', textAlign: 'center', marginBottom: '1em'};

function RegieLiveController() {
    const {t} = useTranslation();
    const session = useSession();
    const [activeType, setActiveType] = useState(session ? session.track.type : null);

    if (!session) {
        return null;
    }

    function renderPanel() {
        if (activeType === 'image') {
            return <div style={PREVIEW_BOX_STYLE}>{t('regie.controller.imagePreview')}</div>;
        }
        if (activeType === 'dubbing-video') {
            return (
                <>
                    <div style={PREVIEW_BOX_STYLE}>{t('regie.controller.dubbingPreview')}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '.5em'}}>
                        <span>00:00</span>
                        <input type="range" min="0" max="100" defaultValue="0" disabled/>
                        <span>00:00</span>
                    </div>
                </>
            );
        }
        return null;
    }

    return (
        <div>
            <div className="tabs" id="regie-tabs" style={{display: 'flex', gap: '.5em', marginBottom: '1em'}}>
                {TYPES.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`btn btn-sm ${activeType === type ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveType(type)}
                    >{t(`regie.tabs.${type}`)}</button>
                ))}
            </div>
            <div id="regie-controller">
                {renderPanel()}
            </div>
        </div>
    );
}

export default RegieLiveController;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieLiveController.test.js`
Expected: PASS (4 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/RegieLiveController.js src/component/Screen/__tests__/RegieLiveController.test.js src/i18n/translation.fr.json
git commit -m "Add RegieLiveController with type tabs and decorative image/dubbing-video panels"
```

---

### Task 3: `RegieLiveController.js` — real `time` tab (countdown + impro navigation)

**Files:**
- Modify: `src/component/Screen/RegieLiveController.js`
- Modify: `src/component/Screen/__tests__/RegieLiveController.test.js`
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `session.plus()`/`session.minus()`/`session.canPlus()`/`session.canMinus()` (existing, `src/entity/Session.js`, bound methods — reused verbatim, no new session methods invented), `session.track` fields `count`/`impro`/`time` (existing, `src/entity/TimeTrack.js`).
- Produces: no new exported interface — extends `RegieLiveController`'s internal `renderPanel()`.

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — merge into the existing "regie" object
"regie": {
    "tabs": {
        "inactive": "Cette étape n'est pas l'étape en cours."
    },
    "controller": {
        "impro": "Impro {{current}} / {{total}}",
        "improPrevious": "Impro précédente",
        "improNext": "Impro suivante"
    }
}
```
Note: the interpolation variables are named `current`/`total`, not `count` — i18next treats a `count` option as a pluralization trigger (looking for `key_one`/`key_other` suffixes), which would misfire here since this key has no plural forms defined.
- [ ] **Step 2: Write the failing tests**
```js
// src/component/Screen/__tests__/RegieLiveController.test.js — add this describe block
describe('RegieLiveController - time tab', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('shows the current impro count and a MM:SS countdown derived from the real TimeTrack', () => {
        window.session = {
            track: {type: 'time', impro: 3, minutes: 2, count: 2, time: 95, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByText('Impro 2 / 3')).toBeTruthy();
        expect(screen.getByText('01:35')).toBeTruthy();
    });

    it('calls session.plus()/session.minus() (real trackChange IPC) from the impro navigation buttons', () => {
        window.session = {
            track: {type: 'time', impro: 3, minutes: 2, count: 2, time: 95, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Impro suivante'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({count: 3});

        fireEvent.click(screen.getByRole('button', {name: 'Impro précédente'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({count: 1});
    });

    it('disables navigation at the impro boundaries', () => {
        window.session = {
            track: {type: 'time', impro: 3, minutes: 2, count: 3, time: 10, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByRole('button', {name: 'Impro suivante'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Impro précédente'})).not.toBeDisabled();
    });

    it('shows the inactive fallback on the time tab when the current step is not a time step', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}, {id: 's2', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        expect(screen.getByText("Cette étape n'est pas l'étape en cours.")).toBeTruthy();
    });
});
```
Add the matching import at the top of the test file (`fireEvent` is already imported; no new imports needed).
- [ ] **Step 3: Run tests to verify they fail**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieLiveController.test.js`
Expected: FAIL — clicking "Time" currently renders nothing (`renderPanel()` returns `null` for `activeType === 'time'`), so none of the new assertions find anything.
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/RegieLiveController.js — add this import
import {Dash, Plus} from 'react-bootstrap-icons';
```
```js
// src/component/Screen/RegieLiveController.js — add this helper above the component
function formatCountdown(seconds) {
    const total = Math.max(0, seconds || 0);
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}
```
```js
// src/component/Screen/RegieLiveController.js — inside renderPanel(), insert before the final "return null;"
if (activeType === 'time') {
    if (session.track.type !== 'time') {
        return <p>{t('regie.tabs.inactive')}</p>;
    }
    const track = session.track;
    return (
        <div style={{textAlign: 'center'}}>
            <p>{t('regie.controller.impro', {current: track.count, total: track.impro})}</p>
            <p style={{fontSize: '2em', fontWeight: 600}}>{formatCountdown(track.time)}</p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '1em'}}>
                <button
                    type="button"
                    className="btn btn-light"
                    aria-label={t('regie.controller.improPrevious')}
                    onClick={session.minus}
                    disabled={!session.canMinus()}
                ><Dash/></button>
                <button
                    type="button"
                    className="btn btn-light"
                    aria-label={t('regie.controller.improNext')}
                    onClick={session.plus}
                    disabled={!session.canPlus()}
                ><Plus/></button>
            </div>
        </div>
    );
}
```
- [ ] **Step 5: Run tests to verify they pass**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieLiveController.test.js`
Expected: PASS (8 tests: the 4 from Task 2 + 4 new)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/RegieLiveController.js src/component/Screen/__tests__/RegieLiveController.test.js src/i18n/translation.fr.json
git commit -m "Wire the real time tab in RegieLiveController to session.plus()/minus()"
```

---

### Task 4: `RegieLiveController.js` — real `battle-royal` tab (reuse `BattleRoyalStepController`)

**Files:**
- Modify: `src/component/Screen/RegieLiveController.js`
- Modify: `src/component/Screen/__tests__/RegieLiveController.test.js`

**Interfaces:**
- Consumes: `<BattleRoyalStepController session={session} step={step} index={index}/>` (existing, `src/component/Controller/BattleRoyalStepController.js`, unmodified).
- Produces: no new exported interface — completes `RegieLiveController`'s `renderPanel()`.

- [ ] **Step 1: Write the failing tests**
```js
// src/component/Screen/__tests__/RegieLiveController.test.js — add this describe block, and add
// `import BattleRoyalStepController from '../../Controller/BattleRoyalStepController';` is NOT needed —
// this test only renders <RegieLiveController/>, it never imports BattleRoyalStepController directly.
describe('RegieLiveController - battle-royal tab', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('reuses BattleRoyalStepController for the live scoreboard when the current step is battle-royal', () => {
        window.session = {
            track: {
                type: 'battle-royal',
                players: [
                    {id: 'p1', name: 'Alice', score: 2, enabled: true},
                    {id: 'p2', name: 'Bob', score: 0, enabled: true},
                ],
            },
            steps: [{id: 's1', name: 'Quiz final', type: 'battle-royal'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByText(/Alice/)).toBeTruthy();
        expect(screen.getByText(/Bob/)).toBeTruthy();

        const incrementAlice = document.querySelector('#regie-controller .btn-primary');
        fireEvent.click(incrementAlice);

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: true},
            ],
        });
    });

    it('shows the inactive fallback on the battle-royal tab when the current step is not battle-royal', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}, {id: 's2', name: 'Quiz final', type: 'battle-royal'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Battle Royal'}));

        expect(screen.getByText("Cette étape n'est pas l'étape en cours.")).toBeTruthy();
    });
});
```
The `#regie-controller` scoped query (rather than a bare `.btn-primary` lookup) is deliberate: the active tab button itself also gets the `btn-primary` class (see Task 2), and it lives inside `#regie-tabs`, not `#regie-controller` — without scoping, `document.querySelector('.btn-primary')` could match the active tab button instead of the intended increment button.
- [ ] **Step 2: Run tests to verify they fail**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieLiveController.test.js`
Expected: FAIL — clicking "Battle Royal" currently renders nothing.
- [ ] **Step 3: Write minimal implementation**
```js
// src/component/Screen/RegieLiveController.js — add this import
import BattleRoyalStepController from '../Controller/BattleRoyalStepController';
```
```js
// src/component/Screen/RegieLiveController.js — inside renderPanel(), insert before the final "return null;"
if (activeType === 'battle-royal') {
    if (session.track.type !== 'battle-royal') {
        return <p>{t('regie.tabs.inactive')}</p>;
    }
    return <BattleRoyalStepController session={session} step={session.steps[session.index]} index={session.index}/>;
}
```
- [ ] **Step 4: Run tests to verify they pass**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieLiveController.test.js`
Expected: PASS (10 tests: the 8 from Tasks 2-3 + 2 new)
- [ ] **Step 5: Commit**
```bash
git add src/component/Screen/RegieLiveController.js src/component/Screen/__tests__/RegieLiveController.test.js
git commit -m "Wire the real battle-royal tab in RegieLiveController via BattleRoyalStepController"
```

---

### Task 5: Wire `RegieLiveController` into `RegieScreen.js`'s live-state branch

**Files:**
- Modify: `src/component/Screen/RegieScreen.js`
- Modify: `src/component/Screen/__tests__/RegieScreen.test.js`

**Interfaces:**
- Consumes: `<RegieLiveController/>` (Tasks 2-4, no props).
- Produces: no new exported interface — `RegieScreen`'s live branch is now a two-column layout.

- [ ] **Step 1: Write the failing test**
```js
// src/component/Screen/__tests__/RegieScreen.test.js — add this test
it('renders RegieLiveController alongside the step list once a session is running', () => {
    window.session = {
        track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5},
        steps: [{id: 's1', name: 'Step 1', type: 'time'}],
        index: 0,
    };
    render(<RegieScreen/>);

    expect(screen.getByText('Step 1')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Battle Royal'})).toBeTruthy();
    expect(screen.getByText('Impro 1 / 5')).toBeTruthy();
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: FAIL with "Unable to find role='button' and name 'Battle Royal'" — `RegieLiveController` isn't rendered by `RegieScreen` yet.
- [ ] **Step 3: Write minimal implementation**
```js
// src/component/Screen/RegieScreen.js — add this import
import RegieLiveController from './RegieLiveController';
```
```js
// src/component/Screen/RegieScreen.js — replace the session-branch JSX
{session ? (
    <div style={{display: 'flex', gap: '1em'}}>
        <div style={{flex: 1}}>
            <SessionController/>
        </div>
        <div className="card" style={{flex: 1, padding: '1em'}}>
            <RegieLiveController/>
        </div>
    </div>
) : (
```
The `<AudioController/>` line that previously sat right after `<SessionController/>` is removed here — Task 6 gives it its own dedicated card outside the collapsible "Session" content entirely (matching the mockup, where "Audio en cours" is a sibling card, not nested inside "Session").
- [ ] **Step 4: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: PASS (5 tests)
- [ ] **Step 5: Commit**
```bash
git add src/component/Screen/RegieScreen.js src/component/Screen/__tests__/RegieScreen.test.js
git commit -m "Wire RegieLiveController into RegieScreen's two-column live layout"
```

---

### Task 6: "Audio en cours" card

**Files:**
- Modify: `src/component/Screen/RegieScreen.js`
- Modify: `src/component/Screen/__tests__/RegieScreen.test.js`
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `<AudioController/>` (existing, no props, already imported).
- Produces: no new exported interface.

- [ ] **Step 1: Add the new translation key**
```json
// src/i18n/translation.fr.json — merge into the existing "regie" object
"regie": {
    "audios": {
        "title": "Audio en cours"
    }
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Screen/__tests__/RegieScreen.test.js — add this test
it('shows the "Audio en cours" card wrapping the audio controller', () => {
    render(<RegieScreen/>);
    seedWorkflows([]);

    expect(screen.getByText('Audio en cours')).toBeTruthy();

    act(() => {
        document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'}}));
    });

    expect(screen.getByText('Track One')).toBeTruthy();
    expect(window.electronAPI.trackPlay).toHaveBeenCalledWith('a1');
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: FAIL with "Unable to find element with text: Audio en cours" — `AudioController` still renders directly under the session content with no titled card.
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/RegieScreen.js — add, right after the closing </div> of the Session card
<div className="card" style={{padding: '1em', marginBottom: '1em'}}>
    <p style={{fontWeight: 500, margin: '0 0 .75em'}}>{t('regie.audios.title')}</p>
    <AudioController/>
</div>
```
- [ ] **Step 5: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: PASS (6 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/RegieScreen.js src/component/Screen/__tests__/RegieScreen.test.js src/i18n/translation.fr.json
git commit -m "Add dedicated Audio en cours card to RegieScreen"
```

---

### Task 7: "Démarrer une musique" card (wires `RegieTrackPicker`)

**Files:**
- Modify: `src/component/Screen/RegieScreen.js`
- Modify: `src/component/Screen/__tests__/RegieScreen.test.js`
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `useTracks()` (existing, `src/component/Hook/useTracks.js`, requires `window.electronAPI.trackFetch()`), `useAudios()` (existing, `src/component/Hook/useAudios.js`, no IPC calls), `<RegieTrackPicker tracks={Array<{id,name,src,tag,color}>} playingIds={Array<string>} onStart={(track) => void}/>` (existing, `src/component/Track/RegieTrackPicker.js`, unmodified).
- Produces: no new exported interface — completes `RegieScreen.js`.

- [ ] **Step 1: Add the new translation key**
```json
// src/i18n/translation.fr.json — merge into the existing "regie" object
"regie": {
    "music": {
        "title": "Démarrer une musique"
    }
}
```
- [ ] **Step 2: Write the failing tests**
```js
// src/component/Screen/__tests__/RegieScreen.test.js — update the beforeEach's electronAPI mock to add trackFetch
beforeEach(() => {
    window.electronAPI = {
        workflowFetch: jest.fn(),
        sessionPlay: jest.fn(),
        trackFetch: jest.fn(),
        trackPlay: jest.fn(),
        trackEnd: jest.fn(),
        trackChange: jest.fn(),
        sessionNext: jest.fn(),
        sessionPrevious: jest.fn(),
        sessionToStep: jest.fn(),
    };
    delete window.session;
});
```
```js
// src/component/Screen/__tests__/RegieScreen.test.js — add these tests
function seedTracks(tracks) {
    act(() => {
        document.dispatchEvent(new CustomEvent('track-onchange', {detail: tracks}));
    });
}

it('shows the "Démarrer une musique" card with tracks from useTracks', () => {
    render(<RegieScreen/>);
    seedWorkflows([]);
    seedTracks([{id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'}]);

    expect(screen.getByText('Démarrer une musique')).toBeTruthy();
    expect(screen.getByText('Générique')).toBeTruthy();
});

it('starts a track from the "Démarrer une musique" card and shows it as playing in "Audio en cours"', () => {
    render(<RegieScreen/>);
    seedWorkflows([]);
    seedTracks([{id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'}]);

    fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

    expect(window.electronAPI.trackPlay).toHaveBeenCalledWith('t1');
    expect(screen.getAllByText('Générique').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', {name: 'En cours'})).toBeDisabled();
});
```
- [ ] **Step 3: Run tests to verify they fail**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: FAIL with "Unable to find element with text: Démarrer une musique" — the card doesn't exist yet, and (separately) `useTracks()` isn't called by `RegieScreen` yet so `track-onchange` events have nothing to update.
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/RegieScreen.js — add these imports
import useAudios from '../Hook/useAudios';
import useTracks from '../Hook/useTracks';
import RegieTrackPicker from '../Track/RegieTrackPicker';
```
```js
// src/component/Screen/RegieScreen.js — inside RegieScreen(), add alongside the other hook calls
const audios = useAudios();
const tracks = useTracks();

function startTrack(track) {
    document.dispatchEvent(new CustomEvent('audio-play', {detail: track}));
}
```
```js
// src/component/Screen/RegieScreen.js — add, right after the "Audio en cours" card's closing </div>
<div className="card" style={{padding: '1em'}}>
    <p style={{fontWeight: 500, margin: '0 0 .75em'}}>{t('regie.music.title')}</p>
    <RegieTrackPicker tracks={tracks} playingIds={audios.map((audio) => audio.id)} onStart={startTrack}/>
</div>
```
- [ ] **Step 5: Run tests to verify they pass**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/RegieScreen.test.js`
Expected: PASS (8 tests)
- [ ] **Step 6: Run the full test suite to confirm nothing else regressed**
Run: `yarn test --watchAll=false`
Expected: PASS (every existing suite plus every suite touched/added by this plan)
- [ ] **Step 7: Commit**
```bash
git add src/component/Screen/RegieScreen.js src/component/Screen/__tests__/RegieScreen.test.js src/i18n/translation.fr.json
git commit -m "Add Démarrer une musique card wiring RegieTrackPicker into RegieScreen"
```

---

### Task 8: Manual verification against the real Electron app

This task has no automated test — none of the RTL suites in Tasks 1-7 exercise the real `window.electronAPI` IPC bridge, real file playback, or a real multi-step session, so a manual pass is required before considering this plan done.

**Files:** none (verification only).

**Interfaces:** none produced; exercises the full stack assembled by Tasks 1-7.

- [ ] **Step 1: Start the app**
Run: `yarn start`. Wait for the Electron window to open on the Régie screen.
- [ ] **Step 2: Verify the collapsible Session card**
With no session running, click the chevron next to "Session" — the empty-state picker should hide while the "Session" label stays visible; click again to re-expand.
- [ ] **Step 3: Verify the live two-column layout**
Start a session with at least one step of each type (`image`, `dubbing-video`, `time`, `battle-royal`) via **Sessions** → create/edit a workflow with those 4 steps if none exists yet, then start it from Régie. Confirm the left column shows the existing transport bar + step list (unchanged), and the right column shows the 4 tabs.
- [ ] **Step 4: Verify tab behavior**
Click "Image" and "Vidéo de doublage": confirm only the static/decorative content shows (no crash, range input clearly disabled/non-interactive). Navigate the session (via the left column's transport or keyboard arrows) until the current step is the `time` step, then click "Time": confirm the impro count and MM:SS countdown match the real state, and that clicking "Impro suivante"/"Impro précédente" moves the real impro forward/back — cross-check that the keyboard shortcuts (Arrow Up/Down, already wired in `SessionController`) move the same counter in sync. While the current step is something else, click "Time" and confirm the "Cette étape n'est pas l'étape en cours." fallback shows instead. Repeat the same current/not-current check for "Battle Royal", confirming score buttons in the tab update the same scoreboard already visible inline in the left step list.
- [ ] **Step 5: Verify "Audio en cours" and "Démarrer une musique"**
In **Musique**, ensure at least one track exists (add one if needed). Back in Régie, confirm the "Démarrer une musique" card lists it with tag tabs; click "Démarrer" and confirm it now shows "En cours" (disabled) in that card and appears with a working stop button under "Audio en cours"; click stop and confirm both update back to their idle state. Confirm devtools (Cmd+Option+I) shows no new console errors throughout.
- [ ] **Step 6: Record the result**
If every check in Steps 2-5 passes with no console errors, this plan is complete. If anything fails, stop and fix it (with a matching automated test added retroactively to the relevant task) before considering the migration finished.
