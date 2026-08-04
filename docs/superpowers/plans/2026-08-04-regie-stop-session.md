# Bouton stop session (régie) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stop button in `RegieLiveController` that, after a confirmation dialog, closes the live session (broadcast window) and returns the régie screen to its "no session" state.

**Architecture:** A new `ConfirmDialog` component (generic, no external lib) gates a new `session.stop()` method on the `Session` entity, which calls a new `window.electronAPI.sessionStop()` bridge. That IPC message reaches `MainWindow`, which closes the existing `SessionWindow`, reusing the `sessionClose()` cleanup path that already exists and already broadcasts `session-onchange` with `undefined` back to the renderer.

**Tech Stack:** React (function components + hooks), react-i18next, @tabler/icons-react, Jest + @testing-library/react (renderer tests, `react-scripts test`), Jest node env for main process (`jest --config jest.config.main.js`), Electron IPC (`ipcRenderer.send` / `ipcMain.addListener`).

## Global Constraints

- No modal/dialog library exists in the project (verified: no `react-modal`, no `<Modal>`, no `window.confirm` usage) — `ConfirmDialog` is built from scratch with plain CSS.
- IPC convention already used for every session action (`session-play`, `session-next`, `session-previous`, `session-toStep`) is fire-and-forget: `ipcRenderer.send(...)` in the renderer/preload, `ipcMain.addListener(...)` in `MainWindow`. Use the same pattern for `session-stop` — do NOT use `ipcRenderer.invoke`/`ipcMain.handle`.
- All UI text goes through `react-i18next` (`useTranslation()` / `t('key')`). There is a single locale file: `src/i18n/translation.fr.json`. New keys live under the existing `regie.controller` object.
- Reuse existing CSS classes `btn`, `btn-icon`, `btn-accent` from `src/theme.css`. New dialog styles are added to the same file using existing CSS variables (`--surface-2`, `--text-primary`, `--text-secondary`, `--radius-lg`).
- Icon: `IconPlayerStop` from `@tabler/icons-react` (already a dependency, already imported elsewhere in `RegieLiveController.js`).
- No `status` field is added to the `Session`/`Workflow` entities — out of scope.
- No keyboard shortcut, no "hold to confirm" — a single confirm/cancel dialog is sufficient.

---

### Task 1: `Session.stop()` entity method

**Files:**
- Modify: `src/entity/Session.js`
- Test: `src/entity/__tests__/Session.test.js`

**Interfaces:**
- Consumes: `window.electronAPI.sessionStop()` (new bridge function, added in Task 3; the test mocks it directly so this task does not depend on Task 3 landing first).
- Produces: `session.stop()` — no args, no return value, calls `window.electronAPI.sessionStop()` unconditionally (no guard condition needed, mirrors `next()`'s bridge call shape but without the `hasNext()`-style guard since stopping is always allowed while a session exists).

- [ ] **Step 1: Write the failing test**

Add to `src/entity/__tests__/Session.test.js`, inside the existing `beforeEach` add `sessionStop: jest.fn(),` to the `window.electronAPI` mock object (alongside the existing `sessionNext`, `sessionPrevious`, `sessionToStep`), then add a new test:

```js
    it('stop() calls the Electron bridge', () => {
        const session = new Session({steps: [1, 2], index: 0});
        session.stop();
        expect(window.electronAPI.sessionStop).toHaveBeenCalledTimes(1);
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test --watchAll=false --testPathPattern=Session.test.js`
Expected: FAIL with `session.stop is not a function`

- [ ] **Step 3: Write minimal implementation**

In `src/entity/Session.js`, in the constructor (after the existing `this.pause = this.pause.bind(this);` on line 43), add:

```js
        this.stop = this.stop.bind(this);
```

Then add the method after `pause()` (after line 103, before the closing `}` of the class):

```js
    stop() {
        window.electronAPI.sessionStop();
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test --watchAll=false --testPathPattern=Session.test.js`
Expected: PASS, all tests in the file green.

- [ ] **Step 5: Commit**

```bash
git add src/entity/Session.js src/entity/__tests__/Session.test.js
git commit -m "Add Session.stop() bridge method"
```

---

### Task 2: `ConfirmDialog` component

**Files:**
- Create: `src/component/Screen/ConfirmDialog.js`
- Test: `src/component/Screen/__tests__/ConfirmDialog.test.js`
- Modify: `src/theme.css`

**Interfaces:**
- Produces: default export `ConfirmDialog({title, message, confirmLabel, cancelLabel, onConfirm, onCancel})` — a React function component. All props are required strings except `onConfirm`/`onCancel` which are required no-arg callbacks. Renders an overlay with a centered box containing `title` (as heading text), `message` (as paragraph text), a cancel button (text = `cancelLabel`, calls `onCancel`) and a confirm button (text = `confirmLabel`, calls `onConfirm`).

- [ ] **Step 1: Write the failing test**

Create `src/component/Screen/__tests__/ConfirmDialog.test.js`:

```js
import {render, screen, fireEvent} from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders the title and message', () => {
        render(
            <ConfirmDialog
                title="Arrêter la session ?"
                message="La diffusion sera coupée."
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        expect(screen.getByText('Arrêter la session ?')).toBeTruthy();
        expect(screen.getByText('La diffusion sera coupée.')).toBeTruthy();
    });

    it('calls onConfirm (not onCancel) when the confirm button is clicked', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        render(
            <ConfirmDialog
                title="t"
                message="m"
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: 'Arrêter'}));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel (not onConfirm) when the cancel button is clicked', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        render(
            <ConfirmDialog
                title="t"
                message="m"
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test --watchAll=false --testPathPattern=ConfirmDialog.test.js`
Expected: FAIL — cannot find module `../ConfirmDialog`

- [ ] **Step 3: Write minimal implementation**

Create `src/component/Screen/ConfirmDialog.js`:

```jsx
import 'react';

function ConfirmDialog({title, message, confirmLabel, cancelLabel, onConfirm, onCancel}) {
    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog-box" role="dialog" aria-modal="true">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" onClick={onCancel}>{cancelLabel}</button>
                    <button type="button" className="btn btn-accent" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
```

Append to `src/theme.css` (after the `.btn.is-active` block, line 167):

```css

.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 30, 28, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.confirm-dialog-box {
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  max-width: 360px;
}

.confirm-dialog-box h3 {
  margin: 0 0 8px;
  color: var(--text-primary);
}

.confirm-dialog-box p {
  margin: 0 0 16px;
  color: var(--text-secondary);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test --watchAll=false --testPathPattern=ConfirmDialog.test.js`
Expected: PASS, 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/component/Screen/ConfirmDialog.js src/component/Screen/__tests__/ConfirmDialog.test.js src/theme.css
git commit -m "Add generic ConfirmDialog component"
```

---

### Task 3: Main process — `session-stop` IPC wiring

**Files:**
- Modify: `public/script/preload/preload-main.js`
- Modify: `public/script/window/MainWindow.js`

**Interfaces:**
- Consumes: `this.sessionWindow` (existing instance field on `MainWindow`, a `SessionWindow` or `undefined`/`null`), `this.sessionWindow.window.close()` (existing `BrowserWindow` API already used identically in `closeSecondaryWindows()` at `MainWindow.js:217`), `this.sessionClose` (existing bound method).
- Produces: `window.electronAPI.sessionStop()` (renderer-facing bridge, no args, no return value) — this is what Task 1's `Session.stop()` calls in production. IPC channel name: `'session-stop'`.

No unit test precedent exists for `MainWindow`/`SessionWindow` (both wrap `electron.BrowserWindow` directly and have zero test files under `public/script/window/`) — this task is verified manually per the steps below, consistent with the rest of that layer.

- [ ] **Step 1: Add the renderer-facing bridge**

In `public/script/preload/preload-main.js`, add a new line right after `sessionToStep` (after line 63):

```js
    sessionStop: () => ipcRenderer.send('session-stop'),
```

- [ ] **Step 2: Bind the handler in the constructor**

In `public/script/window/MainWindow.js`, in the constructor, add right after `this.sessionClose = this.sessionClose.bind(this)` (line 39):

```js
        this.sessionStop = this.sessionStop.bind(this)
```

- [ ] **Step 3: Register/deregister the listener**

In `initHandle()`, add right after `ipcMain.addListener('session-play', this.sessionPlay)` (line 97):

```js
        ipcMain.addListener('session-stop', this.sessionStop)
```

In the `window.on('closed', ...)` cleanup block, add right after `ipcMain.removeListener('session-play', this.sessionPlay)` (line 77):

```js
            ipcMain.removeListener('session-stop', this.sessionStop)
```

- [ ] **Step 4: Implement the handler**

Add the method right after `sessionClose()` (after line 201, before `setRunning`):

```js
    sessionStop() {
        if (!this.sessionWindow) return;
        this.sessionWindow.window.close();
    }
```

This triggers `SessionWindow`'s existing `this.window.on('closed', ...)` listener (`SessionWindow.js:32-34`), which calls `close()` (`SessionWindow.js:84-91`), which calls `this.onClose()` — the `sessionClose` callback passed in at construction (`MainWindow.js:190`) — which already sets `this.sessionWindow = null` and sends `session-onchange` with `undefined` to the main window. No new cleanup logic needed.

- [ ] **Step 5: Manual verification**

Run: `yarn test:main`
Expected: PASS (no existing main-process test touches this code path, so this just confirms nothing else broke).

Then run the app (`yarn start` in one terminal, `yarn electron` or the project's usual Electron launch command in another — check `package.json` scripts if unsure), start a session, and confirm calling `window.electronAPI.sessionStop()` from the renderer devtools console closes the session window. (Task 4 wires this to a real button — this step is a sanity check on the IPC plumbing alone.)

- [ ] **Step 6: Commit**

```bash
git add public/script/preload/preload-main.js public/script/window/MainWindow.js
git commit -m "Wire session-stop IPC channel to close the session window"
```

---

### Task 4: Stop button in `RegieLiveController`

**Files:**
- Modify: `src/component/Screen/RegieLiveController.js`
- Modify: `src/i18n/translation.fr.json`
- Test: `src/component/Screen/__tests__/RegieLiveController.test.js`

**Interfaces:**
- Consumes: `ConfirmDialog` from Task 2 (`{title, message, confirmLabel, cancelLabel, onConfirm, onCancel}`), `session.stop()` from Task 1.
- Produces: nothing consumed by later tasks (this is the last task).

- [ ] **Step 1: Add i18n keys**

In `src/i18n/translation.fr.json`, inside the `regie.controller` object, add after `"loopOff": "Activer la boucle"` (line 216):

```json
      "loopOff": "Activer la boucle",
      "stop": "Arrêter la session",
      "stopConfirm": {
        "title": "Arrêter la session ?",
        "message": "La diffusion en cours sera coupée.",
        "confirm": "Arrêter",
        "cancel": "Annuler"
      }
```

(Note the trailing comma moves from `"loopOff"` to `"stopConfirm"` — keep valid JSON.)

- [ ] **Step 2: Write the failing tests**

Add to `src/component/Screen/__tests__/RegieLiveController.test.js`, a new `describe` block at the end of the file:

```js
describe('RegieLiveController - stop session', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn(), sessionStop: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('shows a confirmation dialog when the stop button is clicked, without stopping yet', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));

        expect(screen.getByText('Arrêter la session ?')).toBeTruthy();
        expect(window.electronAPI.sessionStop).not.toHaveBeenCalled();
    });

    it('calls session.stop() (real sessionStop IPC) when the confirm button is clicked', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));
        fireEvent.click(screen.getByRole('button', {name: 'Arrêter'}));

        expect(window.electronAPI.sessionStop).toHaveBeenCalledTimes(1);
    });

    it('closes the dialog without stopping when cancel is clicked', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));

        expect(window.electronAPI.sessionStop).not.toHaveBeenCalled();
        expect(screen.queryByText('Arrêter la session ?')).toBeNull();
    });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `yarn test --watchAll=false --testPathPattern=RegieLiveController.test.js`
Expected: FAIL — no button with accessible name `Arrêter la session` found.

- [ ] **Step 4: Write minimal implementation**

In `src/component/Screen/RegieLiveController.js`:

Update the imports (lines 1-6):

```jsx
import 'react';
import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {IconMinus, IconPlus, IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconRepeat, IconRepeatOff} from '@tabler/icons-react';
import useSession from '../Hook/useSession';
import BattleRoyalStepController from '../Controller/BattleRoyalStepController';
import ConfirmDialog from './ConfirmDialog';
```

Add local state right after `const session = useSession();` (line 19):

```jsx
    const [showStopConfirm, setShowStopConfirm] = useState(false);
```

Update the final `return` block (lines 110-116) to add the stop button and the conditional dialog:

```jsx
    return (
        <div>
            <div id="regie-controller">
                {renderPanel()}
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
                    <button
                        type="button"
                        className="btn btn-icon"
                        aria-label={t('regie.controller.stop')}
                        onClick={() => setShowStopConfirm(true)}
                    ><IconPlayerStop/></button>
                </div>
            </div>
            {showStopConfirm && (
                <ConfirmDialog
                    title={t('regie.controller.stopConfirm.title')}
                    message={t('regie.controller.stopConfirm.message')}
                    confirmLabel={t('regie.controller.stopConfirm.confirm')}
                    cancelLabel={t('regie.controller.stopConfirm.cancel')}
                    onConfirm={() => {
                        session.stop();
                        setShowStopConfirm(false);
                    }}
                    onCancel={() => setShowStopConfirm(false)}
                />
            )}
        </div>
    );
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn test --watchAll=false --testPathPattern=RegieLiveController.test.js`
Expected: PASS, all tests in the file green (existing + 3 new).

- [ ] **Step 6: Run the full renderer test suite**

Run: `yarn test --watchAll=false`
Expected: PASS, no regressions elsewhere.

- [ ] **Step 7: Commit**

```bash
git add src/component/Screen/RegieLiveController.js src/i18n/translation.fr.json src/component/Screen/__tests__/RegieLiveController.test.js
git commit -m "Add stop button with confirmation to RegieLiveController"
```
