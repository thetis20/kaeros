# Session Creation Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate-OS-window Workflow+Step creation/edit flow with a single in-page accordion screen (`SessionCreationScreen`) reachable only from the `'sessions'` screen, where a session's name and its ordered list of steps (add/reorder/edit/delete) are all edited locally and saved together with one "Enregistrer" click.

**Architecture:** `WorkflowDashboard` stops calling `window.electronAPI.workflowOpen(...)` and instead calls two new callback props (`onCreateNew`/`onEditWorkflow`) that `Dashboard.js` wires to a `screen === 'creation'` transition. `SessionCreationScreen` owns all editing state locally (`name`, `color`, `steps`) and only talks to the backend on save, reusing the existing per-step-type field components (`ImageStep`/`DubbingVideoStep`/`TimeStep`/`BattleRoyalStep`) unmodified for its inline accordion editors. Two new IPC channels (`workflow-save`, `step-save-main`) are added to `preload-main.js`/`MainWindow.js` so the save button can persist the whole session in one pass, reusing the existing `stepRemove`/`createWorkflowUseCase`/`updateWorkflowUseCase`/`createStepUseCase`/`updateStepUseCase` use cases.

**Tech Stack:** React 19, react-i18next, react-bootstrap-icons, uuid, Jest + React Testing Library (jsdom), existing `useWorkflows`/`useSteps` hooks, existing Electron IPC bridge (`ipcMain`/`ipcRenderer`/`contextBridge`).

## Global Constraints

- This plan depends on `nav-shell-regie-v1` (`docs/superpowers/plans/2026-07-20-nav-shell-regie-v1.md`) having been executed first. As of this writing that plan has **not** been executed yet (only its plan document exists; `Sidebar.js`, `Dashboard.js`'s Régie/Musique/Sessions routing, `RegieScreen.js`, `MusiqueScreen.js` are not on disk). Tasks 3 and 7 below are written as diffs against that plan's **target** `Sidebar.js` (its Task 2, final code) and target `Dashboard.js` (its Task 5, final code), not against whatever is on disk right now — re-read those two files fresh before starting Tasks 3/7 to confirm they match.
- Do not modify `RegieScreen.js`, `MusiqueScreen.js`, or build any music-library UI — out of scope (separate plans `music-tag-library`/`regie-polish`).
- Do not modify `ImageStep.js`, `DubbingVideoStep.js`, `TimeStep.js`, `BattleRoyalStep.js` or their exported `validate()` functions — reused exactly as they are.
- Do not modify `Step.js`, `Workflow.js`, `StepItem.js`, `AddStep.js`, `WorkflowItem.js`, `StepDashboard.js`. The old standalone-window forms keep working unchanged for anything not routed through the new `'creation'` screen — in particular, `StepDashboard`'s own `AddStep`/`StepItem` (rendered when a workflow is selected inside `WorkflowDashboard`'s list view, not the `'creation'` screen) still open the real standalone `StepWindow` exactly as today.
- New IPC channel `workflow-save` is distinct from the old standalone Workflow window's bare `save` channel (`preload-workflow.js`) — no collision. New IPC channel `step-save-main` is deliberately **not** named `step-save`, to avoid colliding with `StepWindow`'s own `ipcMain.addListener('step-save', ...)` (registered on the shared `ipcMain` singleton for as long as a standalone Step window is open) — two listeners on the same channel name would both fire and double-process.
- `react-scripts test`'s Jest config only scans `src/` (CRA default, not overridable via the `"jest"` key in `package.json`). Changes under `public/script/**` (Task 1) have no automated test in this repo and are verified manually via Electron devtools, exactly like `nav-shell-regie-v1`'s Task 6.
- The backend `Workflow` entity/`ValidWorkflowUseCase` require a non-empty, non-white `color` string, but the mockup's creation screen has no color field. A new session gets a random color from the palette already used elsewhere in this codebase's demo/mockup data (`['#378ADD', '#D85A30', '#1D9E75', '#7F77DD', '#D4537E', '#BA7517']`); an edited session keeps its existing `color` untouched.
- The existing `UpdateStepUseCase`/`StepStoreRepository.update` replaces a step in place by id — it cannot reposition an already-persisted step. Reordering persisted steps therefore cannot be expressed as a series of per-step updates. Save instead deletes every currently-persisted step for the workflow (existing `stepRemove` IPC, looped) then recreates the full local list in final order (new `stepSave` IPC, sequential `afterIndex`). Documented, accepted consequence: a step's `createdAt` resets on every save of its parent session — nothing in this screen displays a step's creation date (the old `StepItem`'s "updated x ago" display belongs to the untouched `StepDashboard` sub-flow, not this screen).
- `BattleRoyalStep.js` (reused unmodified) stores `players` as a single semicolon-separated **string** while editing, not an array (the backend stores/returns an array — conversion happens the same way `Step.js`/`useStep.js` already do it: join with `'; '` when loading for editing, split on `';'` and trim when saving). The mockup's per-player add/remove input rows are decorative in the same sense as its drag-and-drop grip icon — not implemented, in favor of the real reused component's single text field.
- Test command: `npm test -- --watchAll=false <path>`.
- New translation keys go under one new top-level `sessionCreation` object in `src/i18n/translation.fr.json`; reuse `workflow.form.name`, `playlist.form.name`, `step.form.*` wherever they already fit instead of duplicating strings.
- Every component test imports `'../../../lib/i18n'` first (existing convention, e.g. `Workflow.test.js`); hook-only tests skip it. Tests mock `window.electronAPI` methods with `jest.fn()` and drive real hooks via `document.dispatchEvent(new CustomEvent(...))` — `jest.mock()` is only used for child components, never for hooks (existing convention, verified in `Workflow.test.js`/`useWorkflows.test.js`).
- All existing test files in this repo live in a sibling `__tests__/` folder (e.g. `src/component/Step/__tests__/BattleRoyalStep.test.js`) — new test files in this plan follow that convention, not a flat sibling-file convention.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `public/script/preload/preload-main.js` | Modify | Add `workflowSave`/`stepSave` methods to the `mode: 'main'` `electronAPI` bridge. |
| `public/script/window/MainWindow.js` | Modify | Add `workflow-save`/`step-save-main` IPC listeners and their `workflowSave`/`stepSave` handlers. |
| `src/component/Dashboard/WorkflowDashboard.js` | Modify | Add `onCreateNew`/`onEditWorkflow` props; `create()`/`edit()` call them instead of `window.electronAPI.workflowOpen(...)`. |
| `src/component/Dashboard/__tests__/WorkflowDashboard.test.js` | Create | Covers the new create/edit navigation callbacks and the unchanged remove/play IPC calls (no such test file exists yet). |
| `src/component/Sidebar/Sidebar.js` | Modify | One-line active-class change so the Sessions button is active for `screen === 'sessions' \|\| screen === 'creation'`. |
| `src/component/Sidebar/__tests__/Sidebar.test.js` | Modify | Fix the pre-existing "unrecognized screen" test (now uses `'unknown'` instead of `'creation'`) and add a `'creation'` highlighting test. |
| `src/component/Screen/SessionCreationScreen.js` | Create | Accordion session-creation/edit screen: name field, ordered step list (add/delete/reorder/edit-toggle), per-type add buttons, top-level save. Built incrementally across Tasks 4-6. |
| `src/component/Screen/__tests__/SessionCreationScreen.test.js` | Create | Local step-list behavior (Task 4), edit-mode hydration (Task 5), save wiring (Task 6). |
| `src/component/Dashboard/Dashboard.js` | Modify | Add `editingWorkflowId` state and the `screen === 'creation'` render branch; wire `onCreateNew`/`onEditWorkflow`/`onDone`. |
| `src/component/Dashboard/__tests__/Dashboard.test.js` | Modify | Add creation-screen routing assertions (this file is created by `nav-shell-regie-v1`'s Task 5 — modify it here, don't recreate it). |
| `src/i18n/translation.fr.json` | Modify | Add the new top-level `sessionCreation` object. |

---

### Task 1: `workflow-save` and `step-save-main` IPC channels

**Files:**
- Modify: `public/script/preload/preload-main.js`
- Modify: `public/script/window/MainWindow.js`

**Interfaces:**
- Consumes: `createWorkflowUseCase`, `updateWorkflowUseCase`, `listWorkflowUseCase`, `createStepUseCase`, `updateStepUseCase`, `listStepByWorkflowUseCase` (all existing, exported from `public/script/infrastructure/useCase.js`), `Workflow` entity (`public/script/application/entity/Workflow.js`), `StepFactory` (`public/script/application/entity/step/StepFactory.js`).
- Produces: `window.electronAPI.workflowSave(value)` and `window.electronAPI.stepSave({workflowId, value, afterIndex})` — consumed by `SessionCreationScreen` in Task 6.

No automated test is possible for this task (per Global Constraints — `public/script/**` is outside Jest's `src/`-only roots). Verify manually in Steps 3-4.

- [ ] **Step 1: Add the two methods to `preload-main.js`**

```js
// public/script/preload/preload-main.js
const {contextBridge, ipcRenderer, webUtils} = require('electron')
const events = [
    'time-onchange',
    'dubbing-onchange',
    'playlist-onchange',
    'running-onchange',
    'folder-onchange',
    'audio-onchange',
    'workflow-onchange',
    'step-onchange',
    'session-onchange'
]


function _dispatchEvent(key, value) {
    document.dispatchEvent(new CustomEvent(key, {detail: value,}))
}

for (const event of events) {
    ipcRenderer.on(event, (_event, value) => _dispatchEvent(event, value))
}

contextBridge.exposeInMainWorld('electronAPI', {
    mode: 'main',
    dubbingFetch: () => ipcRenderer.send('dubbing-fetch'),
    dubbingOpenCreate: () => ipcRenderer.send('dubbing-open-create'),
    dubbingOpen: () => ipcRenderer.send('dubbing-open'),
    dubbingOnChange: (status) => ipcRenderer.send('dubbing-onchange', status),
    timeOpen: (time) => ipcRenderer.send('time-open', time),
    timeFetch: () => ipcRenderer.send('time-fetch'),
    timeOnChange: (status) => ipcRenderer.send('time-onchange', status),
    playlistOpen: (value) => ipcRenderer.send('playlist-open', value),
    playlistFetch: () => ipcRenderer.send('playlist-fetch'),
    playlistPlay: (playlist) => ipcRenderer.send('playlist-play', playlist),
    playlistRemove: (id) => ipcRenderer.send('playlist-remove', id),
    folderFetch: () => ipcRenderer.send('folder-fetch'),
    folderOpen: (value) => ipcRenderer.send('folder-open', value),
    folderRemove: (id) => ipcRenderer.send('folder-remove', id),
    audioFetch: (folderId) => ipcRenderer.send('audio-fetch', folderId),
    audioOpen: (folderId, audio) => ipcRenderer.send('audio-open', folderId, audio),
    audioRemove: (folderId, id) => ipcRenderer.send('audio-remove', folderId, id),
    audioPlay: (folderId, id) => ipcRenderer.send('audio-play', folderId, id),
    audioEnd: (folderId, id) => ipcRenderer.send('audio-end', folderId, id),
    workflowFetch: () => ipcRenderer.send('workflow-fetch'),
    workflowOpen: (value) => ipcRenderer.send('workflow-open', value),
    workflowRemove: (id) => ipcRenderer.send('workflow-remove', id),
    workflowSave: (value) => ipcRenderer.send('workflow-save', value),
    stepOpen: ({workflowId, value, afterIndex}) => ipcRenderer.send('step-open', {workflowId, value, afterIndex}),
    stepFetch: (workflowId) => ipcRenderer.send('step-fetch', workflowId),
    stepRemove: (workflowId, id) => ipcRenderer.send('step-remove', workflowId, id),
    stepSave: ({workflowId, value, afterIndex}) => {
        if (value.file !== undefined) {
            value.src = webUtils.getPathForFile(value.file)
            delete value.file
        }
        ipcRenderer.send('step-save-main', {workflowId, value, afterIndex})
    },
    sessionFetch: () => ipcRenderer.send('session-fetch'),
    sessionPlay: (workflow) => ipcRenderer.send('session-play', workflow),
    sessionNext: () => ipcRenderer.send('session-next'),
    sessionPrevious: () => ipcRenderer.send('session-previous'),
    sessionToStep: (index) => ipcRenderer.send('session-toStep', index),
    trackChange: (changes) => ipcRenderer.send('track-change', changes),
})
```

- [ ] **Step 2: Add the handlers to `MainWindow.js`**

Modify the top of the file:

```js
// public/script/window/MainWindow.js
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const {
    listFolderUseCase,
    deleteFolderUseCase,
    listAudioByFolderUseCase,
    updateAudioUseCase,
    deleteAudioUseCase,
    listWorkflowUseCase,
    createWorkflowUseCase,
    updateWorkflowUseCase,
    deleteWorkflowUseCase,
    listStepByWorkflowUseCase,
    createStepUseCase,
    updateStepUseCase,
    deleteStepUseCase,
    createSessionUseCase
} = require('../infrastructure/useCase.js');
const Workflow = require('../application/entity/Workflow.js');
const StepFactory = require('../application/entity/step/StepFactory.js');
const FolderWindow = require('./FolderWindow.js');
const AudioWindow = require('./AudioWindow.js');
const WorkflowWindow = require('./WorkflowWindow.js');
const StepWindow = require('./StepWindow.js')
const SessionWindow = require('./SessionWindow.js')
```

In the constructor, add two more bindings alongside the existing ones:

```js
        this.workflowRemove = this.workflowRemove.bind(this)
        this.workflowSave = this.workflowSave.bind(this)
        this.stepFetch = this.stepFetch.bind(this)
        this.stepOpen = this.stepOpen.bind(this)
        this.stepRemove = this.stepRemove.bind(this)
        this.stepSave = this.stepSave.bind(this)
```

In the `'closed'` handler, add two more `removeListener` calls:

```js
            ipcMain.removeListener('workflow-remove', this.workflowRemove)
            ipcMain.removeListener('workflow-save', this.workflowSave)
            ipcMain.removeListener('step-fetch', this.stepFetch)
            ipcMain.removeListener('step-open', this.stepOpen)
            ipcMain.removeListener('step-remove', this.stepRemove)
            ipcMain.removeListener('step-save-main', this.stepSave)
```

In `initHandle()`, add two more `addListener` calls:

```js
        ipcMain.addListener('workflow-remove', this.workflowRemove)
        ipcMain.addListener('workflow-save', this.workflowSave)
        ipcMain.addListener('step-fetch', this.stepFetch)
        ipcMain.addListener('step-open', this.stepOpen)
        ipcMain.addListener('step-remove', this.stepRemove)
        ipcMain.addListener('step-save-main', this.stepSave)
```

Add the two new methods (next to `workflowRemove`/`stepRemove`):

```js
    async workflowSave(event, value) {
        let workflow = value;
        if (undefined === workflow.createdAt) {
            workflow = new Workflow(workflow.id, workflow.name, workflow.color);
            await createWorkflowUseCase.execute(workflow);
        } else {
            await updateWorkflowUseCase.execute(workflow);
        }
        this.window.webContents.send('workflow-onchange', await listWorkflowUseCase.execute());
    }

    async stepSave(event, {workflowId, value, afterIndex}) {
        let step = value;
        if (undefined === step.createdAt) {
            step = StepFactory.fromData(step);
            await createStepUseCase.execute(workflowId, step, afterIndex);
        } else {
            await updateStepUseCase.execute(workflowId, step.id, step);
        }
        this.window.webContents.send('step-onchange', await listStepByWorkflowUseCase.execute(workflowId));
    }
```

- [ ] **Step 3: Manually verify — no session/workflow exists yet (create path)**

Run: `npm start`

In the Electron window's devtools console (Cmd+Option+I):

```js
window.electronAPI.workflowSave({id: 'manual-wf-1', name: 'Test manuel', color: '#378ADD'})
```

Expected: no console error; a moment later `document` receives a `workflow-onchange` event (check via `document.addEventListener('workflow-onchange', e => console.log(e.detail))` run beforehand) containing an entry with `id: 'manual-wf-1'`.

Then:

```js
window.electronAPI.stepSave({workflowId: 'manual-wf-1', value: {id: 'manual-step-1', type: 'time', name: 'Étape test', impro: '1', minutes: '2'}, afterIndex: undefined})
```

Expected: no console error; a `step-onchange` event fires with one step, `id: 'manual-step-1'`.

- [ ] **Step 4: Manually verify — update path and channel isolation**

```js
window.electronAPI.workflowSave({id: 'manual-wf-1', name: 'Test manuel modifié', color: '#378ADD', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})
```

Expected: `workflow-onchange` fires again, the entry's `name` is now `'Test manuel modifié'` (same `id`, not duplicated).

Restart the app (`npm start` again) and confirm `manual-wf-1`/`manual-step-1` are still present after restart (persisted to disk by `electron-store`). Then clean up: `window.electronAPI.workflowRemove('manual-wf-1')`.

- [ ] **Step 5: Commit**

```bash
git add public/script/preload/preload-main.js public/script/window/MainWindow.js
git commit -m "Add workflow-save and step-save-main IPC channels for the in-page session creation screen"
```

---

### Task 2: `WorkflowDashboard` navigation callbacks

**Files:**
- Modify: `src/component/Dashboard/WorkflowDashboard.js`
- Create: `src/component/Dashboard/__tests__/WorkflowDashboard.test.js`

**Interfaces:**
- Consumes: nothing new from earlier tasks.
- Produces: `<WorkflowDashboard onCreateNew={() => void} onEditWorkflow={(workflow) => void}/>` — consumed by `Dashboard.js` in Task 7.

- [ ] **Step 1: Write the failing test**

```js
// src/component/Dashboard/__tests__/WorkflowDashboard.test.js
import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import WorkflowDashboard from '../WorkflowDashboard';

describe('WorkflowDashboard', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowOpen: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
            stepFetch: jest.fn(),
        };
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('calls onCreateNew instead of opening the standalone Workflow window', () => {
        const onCreateNew = jest.fn();
        render(<WorkflowDashboard onCreateNew={onCreateNew} onEditWorkflow={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: /Créer une session/}));

        expect(onCreateNew).toHaveBeenCalledTimes(1);
        expect(window.electronAPI.workflowOpen).not.toHaveBeenCalled();
    });

    it('calls onEditWorkflow with the selected workflow instead of opening the standalone Workflow window', () => {
        const onEditWorkflow = jest.fn();
        render(<WorkflowDashboard onEditWorkflow={onEditWorkflow} onCreateNew={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByText('Remise des diplômes'));
        fireEvent.click(screen.getByRole('button', {name: /Modifier/}));

        expect(onEditWorkflow).toHaveBeenCalledWith(workflow);
        expect(window.electronAPI.workflowOpen).not.toHaveBeenCalled();
    });

    it('still removes the selected workflow via the existing IPC call', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Gala annuel', color: '#D85A30'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByText('Gala annuel'));
        fireEvent.click(screen.getByRole('button', {name: /Supprimer/}));

        expect(window.electronAPI.workflowRemove).toHaveBeenCalledWith('wf-1');
    });

    it('still plays the selected workflow via the existing IPC call', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByText('Soirée'));
        fireEvent.click(screen.getByRole('button', {name: /Démarrer/}));

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/component/Dashboard/__tests__/WorkflowDashboard.test.js`
Expected: FAIL — `onCreateNew`/`onEditWorkflow` are never called, `window.electronAPI.workflowOpen` is called instead (current `create()`/`edit()` bodies).

- [ ] **Step 3: Write minimal implementation**

```js
// src/component/Dashboard/WorkflowDashboard.js
import { useState, Fragment } from 'react';
import { Pen, Play, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import useWorkflows from '../Hook/useWorkflows.js';
import WorkflowItem from '../Workflow/WorkflowItem.js';
import { ChevronLeft } from 'react-bootstrap-icons';
import AddStep from '../Step/AddStep.js';
import StepDashboard from './StepDashboard.js'

function WorkflowDashboard({ onCreateNew, onEditWorkflow }) {
  const { t } = useTranslation();
  const workflows = useWorkflows()
  const [selectedId, select] = useState(null)
  const selectedWorkflow = workflows.find(workflow => workflow.id === selectedId) || null

  function create() {
    onCreateNew()
  }

  function remove() {
    window.electronAPI.workflowRemove(selectedId)
  }

  function edit() {
    onEditWorkflow(selectedWorkflow)
  }

  function play() {
    window.electronAPI.sessionPlay(selectedWorkflow)
  }

  return (
    <div style={{ padding: '1em' }}>
      <h1>{t('workflow.name')}</h1>
      {selectedWorkflow === null
        ? <Fragment>
          <button className="btn btn-primary" onClick={create}>{t('workflow.create')}</button>
          <div style={{
            listStyle: 'none',
            padding: 0,
            gap: 30,
            display: 'flex',
            flexDirection: 'column',
            marginTop: 30
          }}>
            {workflows.map((workflow) => <WorkflowItem key={workflow.id} workflow={workflow} onSelect={select} />)}
          </div>
        </Fragment>
        : <Fragment>
          <WorkflowItem workflow={selectedWorkflow} />
          <div style={{ display: 'flex', margin: '1em 0', gap: '1em', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => select(null)}>
              <ChevronLeft style={{ marginRight: '.5em' }} />
              {t('workflow.back')}
            </button>
            <button className="btn btn-danger" onClick={remove}>
              <Trash style={{ marginRight: '.5em' }} />
              {t('workflow.remove')}
            </button>
            <button className="btn btn-primary" onClick={edit}>
              <Pen style={{ marginRight: '.5em' }} />
              {t('workflow.edit')}
            </button>
            <button className="btn btn-info" onClick={play}>
              <Play style={{ marginRight: '.5em' }} />
              {t('workflow.play')}
            </button>
          </div>
          <StepDashboard workflowId={selectedId} />
        </Fragment>}
    </div >
  );
}

export default WorkflowDashboard;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/component/Dashboard/__tests__/WorkflowDashboard.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/component/Dashboard/WorkflowDashboard.js src/component/Dashboard/__tests__/WorkflowDashboard.test.js
git commit -m "Route WorkflowDashboard create/edit through callbacks instead of the standalone Workflow window"
```

---

### Task 3: `Sidebar` treats `'creation'` as a Sessions sub-view

**Files:**
- Modify: `src/component/Sidebar/Sidebar.js` (created by `nav-shell-regie-v1` Task 2 — re-read it fresh before editing)
- Modify: `src/component/Sidebar/__tests__/Sidebar.test.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `<Sidebar screen={...}/>` now highlights the Sessions button for `screen === 'creation'` too — consumed by `Dashboard.js` in Task 7 (no signature change, same props as `nav-shell-regie-v1` Task 2).

- [ ] **Step 1: Write the failing test**

Two changes to the existing file. First, the pre-existing "unrecognized screen" test currently uses `screen="creation"` to prove graceful handling of a value none of the three buttons recognize — after this task, `'creation'` **is** recognized (it highlights Sessions), so that test must switch to a genuinely unrecognized value. Second, add a new test for the `'creation'` behavior itself.

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

    it('renders without throwing and highlights nothing for a genuinely unrecognized screen value', () => {
        render(<Sidebar screen="unknown" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.getByRole('button', {name: /Régie/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Sessions/})).not.toHaveClass('active');
    });

    it('treats "creation" as a Sessions sub-view for active-state highlighting', () => {
        render(<Sidebar screen="creation" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.getByRole('button', {name: /Sessions/})).toHaveClass('active');
        expect(screen.getByRole('button', {name: /Régie/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/component/Sidebar/__tests__/Sidebar.test.js`
Expected: FAIL on the new `'creation'` test — Sessions button has no `active` class (the other 4 tests already pass, unaffected by this change).

- [ ] **Step 3: Write minimal implementation**

Change exactly this one line in `src/component/Sidebar/Sidebar.js`:

```js
// before
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'sessions' ? 'active' : ''}`}
                onClick={() => onNavigate('sessions')}
            >
```

```js
// after
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${(screen === 'sessions' || screen === 'creation') ? 'active' : ''}`}
                onClick={() => onNavigate('sessions')}
            >
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/component/Sidebar/__tests__/Sidebar.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/component/Sidebar/Sidebar.js src/component/Sidebar/__tests__/Sidebar.test.js
git commit -m "Sidebar: highlight Sessions when the session-creation sub-screen is active"
```

---

### Task 4: `SessionCreationScreen` — local step-list editing

**Files:**
- Create: `src/component/Screen/SessionCreationScreen.js`
- Create: `src/component/Screen/__tests__/SessionCreationScreen.test.js`
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `ImageStep`/`validate` (`../Step/ImageStep`), `DubbingVideoStep`/`validate` (`../Step/DubbingVideoStep`), `TimeStep`/`validate` (`../Step/TimeStep`), `BattleRoyalStep`/`validate` (`../Step/BattleRoyalStep`) — all existing, unmodified, each taking `{value, setValue, errors, setErrors}`.
- Produces: `<SessionCreationScreen workflowId={string|null} onDone={() => void}/>` (props accepted from this task on, `workflowId` unused until Task 5, `onDone` unused until Task 6) — consumed by `Dashboard.js` in Task 7. Internal helpers `newStep(type, t)`, `stepIcons`, `variantComponents`, `variantValidators`, `STEP_TYPES` are relied on by Tasks 5-6 (same file).

- [ ] **Step 1: Add the new translation keys**

```json
// src/i18n/translation.fr.json — new top-level "sessionCreation" object
"sessionCreation": {
    "title": "Créer une session",
    "titleEdit": "Modifier une session",
    "subtitle": "Liste ordonnée d'étapes, insertion possible entre chaque étape.",
    "save": "Enregistrer",
    "add": "Ajouter :",
    "up": "Monter",
    "down": "Descendre",
    "editToggle": "Modifier l'étape",
    "delete": "Supprimer l'étape",
    "newStepName": {
        "image": "Nouvelle image",
        "dubbing-video": "Nouveau doublage",
        "time": "Nouveau time",
        "battle-royal": "Nouveau battle royal"
    }
}
```

- [ ] **Step 2: Write the failing test**

```js
// src/component/Screen/__tests__/SessionCreationScreen.test.js
import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import SessionCreationScreen from '../SessionCreationScreen';

describe('SessionCreationScreen - new session, local step list', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            stepFetch: jest.fn(),
            workflowSave: jest.fn(),
            stepSave: jest.fn(),
            stepRemove: jest.fn(),
        };
    });

    it('starts empty and lets the user type a name', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        const nameInput = screen.getByLabelText('Nom de la session');
        fireEvent.change(nameInput, {target: {value: 'Remise des diplômes'}});
        expect(nameInput.value).toBe('Remise des diplômes');
    });

    it('adds a step of each type to the end of the list', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getByRole('button', {name: 'Vidéo de doublage'}));

        expect(screen.getByText('Nouvelle image')).toBeTruthy();
        expect(screen.getByText('Nouveau doublage')).toBeTruthy();
    });

    it('moves a step up and down with the chevron buttons', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        const order = () => screen.getAllByText(/^(Nouvelle image|Nouveau time)$/).map(el => el.textContent);
        expect(order()).toEqual(['Nouvelle image', 'Nouveau time']);

        fireEvent.click(screen.getAllByRole('button', {name: 'Descendre'})[0]);
        expect(order()).toEqual(['Nouveau time', 'Nouvelle image']);

        fireEvent.click(screen.getAllByRole('button', {name: 'Monter'})[1]);
        expect(order()).toEqual(['Nouvelle image', 'Nouveau time']);
    });

    it('deletes a step from the list', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        expect(screen.getByText('Nouvelle image')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: "Supprimer l'étape"}));
        expect(screen.queryByText('Nouvelle image')).toBeNull();
    });

    it('toggles the inline editor open and closed, rendering the matching variant fieldset', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));
        expect(screen.queryByLabelText("Nombre d'impros")).toBeNull();

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.getByLabelText("Nombre d'impros")).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.queryByLabelText("Nombre d'impros")).toBeNull();
    });

    it('lets the user rename a step from the inline editor', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));

        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Logo établissement'}});
        expect(screen.getByText('Logo établissement')).toBeTruthy();
    });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: FAIL with "Cannot find module '../SessionCreationScreen'"

- [ ] **Step 4: Write minimal implementation**

```js
// src/component/Screen/SessionCreationScreen.js
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {v4 as uuidv4} from 'uuid';
import {ChevronUp, ChevronDown, Pen, Trash, Image, CameraReelsFill, ClockFill, ShieldFill} from 'react-bootstrap-icons';
import ImageStep, {validate as validateImage} from '../Step/ImageStep';
import DubbingVideoStep, {validate as validateDubbingVideo} from '../Step/DubbingVideoStep';
import TimeStep, {validate as validateTime} from '../Step/TimeStep';
import BattleRoyalStep, {validate as validateBattleRoyal} from '../Step/BattleRoyalStep';

const STEP_TYPES = ['image', 'dubbing-video', 'time', 'battle-royal'];

const stepIcons = {
    image: Image,
    'dubbing-video': CameraReelsFill,
    time: ClockFill,
    'battle-royal': ShieldFill,
};

const variantComponents = {
    image: ImageStep,
    'dubbing-video': DubbingVideoStep,
    time: TimeStep,
    'battle-royal': BattleRoyalStep,
};

const variantValidators = {
    image: validateImage,
    'dubbing-video': validateDubbingVideo,
    time: validateTime,
    'battle-royal': validateBattleRoyal,
};

// NOTE: the existing translation file spells the image option key "images" (plural) — see
// `step.form.type.option.images` in translation.fr.json, already relied on verbatim by Step.js's
// <option> list. Every other type key matches its internal type string exactly. This map absorbs
// that one irregularity instead of deriving the key from `step.type` with a template string.
const stepTypeLabelKeys = {
    image: 'step.form.type.option.images',
    'dubbing-video': 'step.form.type.option.dubbing-video',
    time: 'step.form.type.option.time',
    'battle-royal': 'step.form.type.option.battle-royal',
};

function newStep(type, t) {
    const base = {id: uuidv4(), type, name: t(`sessionCreation.newStepName.${type}`), open: false};
    if (type === 'dubbing-video') return {...base, time: '', description: ''};
    if (type === 'time') return {...base, impro: '1', minutes: '2'};
    if (type === 'battle-royal') return {...base, players: ''};
    return base;
}

function SessionCreationScreen({workflowId, onDone}) {
    const {t} = useTranslation();
    const [name, setName] = useState('');
    const [steps, setSteps] = useState([]);
    const [errorsByStepId, setErrorsByStepId] = useState({});

    function updateStep(index, nextValue) {
        setSteps(current => current.map((step, i) => i === index ? nextValue : step));
    }

    function addStep(type) {
        setSteps(current => [...current, newStep(type, t)]);
    }

    function removeStep(index) {
        const removedId = steps[index].id;
        setSteps(current => current.filter((_, i) => i !== index));
        setErrorsByStepId(current => {
            const next = {...current};
            delete next[removedId];
            return next;
        });
    }

    function moveUp(index) {
        if (index === 0) return;
        setSteps(current => {
            const next = [...current];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    }

    function moveDown(index) {
        setSteps(current => {
            if (index >= current.length - 1) return current;
            const next = [...current];
            [next[index + 1], next[index]] = [next[index], next[index + 1]];
            return next;
        });
    }

    function toggleOpen(index) {
        updateStep(index, {...steps[index], open: !steps[index].open});
    }

    return (
        <div style={{padding: '1em'}}>
            <h1>{t(workflowId === null ? 'sessionCreation.title' : 'sessionCreation.titleEdit')}</h1>
            <p>{t('sessionCreation.subtitle')}</p>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20}}>
                <input
                    type="text"
                    aria-label={t('playlist.form.name')}
                    style={{flex: 1, fontWeight: 500}}
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="btn btn-primary">
                    {t('sessionCreation.save')}
                </button>
            </div>
            <div style={{marginBottom: 16}}>
                {steps.map((step, index) => {
                    const Icon = stepIcons[step.type];
                    const Variant = variantComponents[step.type];
                    const errors = errorsByStepId[step.id] || {};
                    return (
                        <div key={step.id} className="accordion-item">
                            <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '.5em 0'}}>
                                <span>{index + 1}</span>
                                <Icon/>
                                <span style={{flex: 1}}>{step.name}</span>
                                <span>{t(stepTypeLabelKeys[step.type])}</span>
                                <button className="btn btn-link" aria-label={t('sessionCreation.up')} onClick={() => moveUp(index)} disabled={index === 0}><ChevronUp/></button>
                                <button className="btn btn-link" aria-label={t('sessionCreation.down')} onClick={() => moveDown(index)} disabled={index === steps.length - 1}><ChevronDown/></button>
                                <button className="btn btn-link" aria-label={t('sessionCreation.editToggle')} onClick={() => toggleOpen(index)}><Pen/></button>
                                <button className="btn btn-link" aria-label={t('sessionCreation.delete')} onClick={() => removeStep(index)}><Trash/></button>
                            </div>
                            {step.open && (
                                <div style={{padding: '0 0 1em 2em'}}>
                                    <div className="form-group" style={{marginBottom: 10}}>
                                        <label htmlFor={`creation-step-name-${step.id}`} className="form-label">{t('step.form.name')}</label>
                                        <input
                                            id={`creation-step-name-${step.id}`}
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={step.name}
                                            onChange={(e) => updateStep(index, {...step, name: e.target.value})}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                    <Variant
                                        value={step}
                                        setValue={(nextValue) => updateStep(index, nextValue)}
                                        errors={errors}
                                        setErrors={(nextErrors) => setErrorsByStepId(current => ({...current, [step.id]: nextErrors}))}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                <span>{t('sessionCreation.add')}</span>
                {STEP_TYPES.map(type => {
                    const Icon = stepIcons[type];
                    return (
                        <button key={type} className="btn btn-light" onClick={() => addStep(type)}>
                            <Icon style={{marginRight: '.5em'}}/>
                            {t(stepTypeLabelKeys[type])}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SessionCreationScreen;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add src/component/Screen/SessionCreationScreen.js src/component/Screen/__tests__/SessionCreationScreen.test.js src/i18n/translation.fr.json
git commit -m "Add SessionCreationScreen accordion: local add/delete/reorder/edit-toggle per step"
```

---

### Task 5: `SessionCreationScreen` — edit-mode hydration

**Files:**
- Modify: `src/component/Screen/SessionCreationScreen.js`
- Modify: `src/component/Screen/__tests__/SessionCreationScreen.test.js`

**Interfaces:**
- Consumes: `useWorkflows()` (existing, `../Hook/useWorkflows`, returns `Array<{id, name, color, createdAt, updatedAt}>`), `useSteps(workflowId)` (existing, `../Hook/useSteps`, returns `Array<Step>` for that workflow).
- Produces: when `workflowId !== null`, `name`/`steps` populate from the fetched workflow/steps exactly once each (tracked via refs, so later local edits are never clobbered by a stray re-fetch). `color` state and `hydrateStepForEditing`/`randomColor`/`colorPalette` helpers — relied on by Task 6 (same file).

- [ ] **Step 1: Write the failing test**

Add a new `describe` block to the existing test file (keep the Task 4 block above it unchanged) and add `act` to the import line:

```js
// src/component/Screen/__tests__/SessionCreationScreen.test.js — modify the import line
import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import SessionCreationScreen from '../SessionCreationScreen';
```

```js
// src/component/Screen/__tests__/SessionCreationScreen.test.js — append this describe block
describe('SessionCreationScreen - editing an existing workflow', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            stepFetch: jest.fn(),
            workflowSave: jest.fn(),
            stepSave: jest.fn(),
            stepRemove: jest.fn(),
        };
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    function seedSteps(steps) {
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: steps}));
        });
    }

    it('loads the workflow name and its steps for editing', () => {
        render(<SessionCreationScreen workflowId="wf-1" onDone={() => {}}/>);
        seedWorkflows([{id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01'}]);
        seedSteps([
            {id: 'step-1', type: 'image', name: 'Logo établissement', src: '/tmp/logo.png', createdAt: '2026-01-01'},
            {id: 'step-2', type: 'battle-royal', name: 'Quiz final', players: ['Alex', 'Sam'], createdAt: '2026-01-01'},
        ]);

        expect(screen.getByLabelText('Nom de la session').value).toBe('Remise des diplômes');
        expect(screen.getByText('Logo établissement')).toBeTruthy();
        expect(screen.getByText('Quiz final')).toBeTruthy();
    });

    it('joins a persisted array of players into a semicolon-separated string for editing', () => {
        render(<SessionCreationScreen workflowId="wf-1" onDone={() => {}}/>);
        seedWorkflows([{id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01'}]);
        seedSteps([{id: 'step-2', type: 'battle-royal', name: 'Quiz final', players: ['Alex', 'Sam'], createdAt: '2026-01-01'}]);

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.getByLabelText('Joueurs').value).toBe('Alex; Sam');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: FAIL — `name` stays empty and no steps render (the component ignores `workflowId` so far).

- [ ] **Step 3: Write minimal implementation**

Modify `src/component/Screen/SessionCreationScreen.js`:

```js
// imports — replace the first two lines
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {v4 as uuidv4} from 'uuid';
import {ChevronUp, ChevronDown, Pen, Trash, Image, CameraReelsFill, ClockFill, ShieldFill} from 'react-bootstrap-icons';
import useWorkflows from '../Hook/useWorkflows';
import useSteps from '../Hook/useSteps';
import ImageStep, {validate as validateImage} from '../Step/ImageStep';
import DubbingVideoStep, {validate as validateDubbingVideo} from '../Step/DubbingVideoStep';
import TimeStep, {validate as validateTime} from '../Step/TimeStep';
import BattleRoyalStep, {validate as validateBattleRoyal} from '../Step/BattleRoyalStep';
```

Add these module-level helpers next to `newStep` (after the `variantValidators` const, before `newStep`):

```js
const colorPalette = ['#378ADD', '#D85A30', '#1D9E75', '#7F77DD', '#D4537E', '#BA7517'];

function randomColor() {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function hydrateStepForEditing(step) {
    const hydrated = {...step, open: false};
    if (Array.isArray(hydrated.players)) {
        hydrated.players = hydrated.players.join('; ');
    }
    return hydrated;
}
```

Inside `SessionCreationScreen`, replace the state declarations and add the hydration effects:

```js
function SessionCreationScreen({workflowId, onDone}) {
    const {t} = useTranslation();
    const workflows = useWorkflows();
    const fetchedSteps = useSteps(workflowId);
    const [name, setName] = useState('');
    const [color, setColor] = useState(() => workflowId === null ? randomColor() : null);
    const [steps, setSteps] = useState([]);
    const [errorsByStepId, setErrorsByStepId] = useState({});
    const nameLoadedRef = useRef(false);
    const stepsLoadedRef = useRef(false);
    const existingWorkflowRef = useRef(null);

    useEffect(() => {
        if (workflowId === null) return;
        const workflow = workflows.find(w => w.id === workflowId);
        if (workflow && !nameLoadedRef.current) {
            existingWorkflowRef.current = workflow;
            setName(workflow.name);
            setColor(workflow.color);
            nameLoadedRef.current = true;
        }
    }, [workflowId, workflows]);

    useEffect(() => {
        if (workflowId === null) return;
        if (fetchedSteps.length > 0 && !stepsLoadedRef.current) {
            setSteps(fetchedSteps.map(hydrateStepForEditing));
            stepsLoadedRef.current = true;
        }
    }, [workflowId, fetchedSteps]);

    function updateStep(index, nextValue) {
```

(the rest of the function — `updateStep` through the closing JSX — is unchanged from Task 4)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/component/Screen/SessionCreationScreen.js src/component/Screen/__tests__/SessionCreationScreen.test.js
git commit -m "SessionCreationScreen: hydrate name/steps once from useWorkflows/useSteps when editing"
```

---

### Task 6: `SessionCreationScreen` — save wiring

**Files:**
- Modify: `src/component/Screen/SessionCreationScreen.js`
- Modify: `src/component/Screen/__tests__/SessionCreationScreen.test.js`

**Interfaces:**
- Consumes: `window.electronAPI.workflowSave(value)`, `window.electronAPI.stepSave({workflowId, value, afterIndex})` (Task 1), `window.electronAPI.stepRemove(workflowId, id)` (existing).
- Produces: clicking "Enregistrer" validates every step (reusing each type's `validate(step, t)`), and if valid, saves the workflow, deletes every originally-fetched step, recreates the final list in order, then calls `onDone()`. Nothing later in this plan consumes this screen further.

- [ ] **Step 1: Write the failing test**

Append this describe block to `src/component/Screen/__tests__/SessionCreationScreen.test.js`:

```js
describe('SessionCreationScreen - saving', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            stepFetch: jest.fn(),
            workflowSave: jest.fn(),
            stepSave: jest.fn(),
            stepRemove: jest.fn(),
        };
    });

    it('blocks save and shows a validation error when a step is invalid', () => {
        render(<SessionCreationScreen workflowId={null} onDone={jest.fn()}/>);
        fireEvent.change(screen.getByLabelText('Nom de la session'), {target: {value: 'Remise des diplômes'}});
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(window.electronAPI.workflowSave).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.getByText('Un fichier est obligatoire.')).toBeTruthy();
    });

    it('saves a brand-new session: creates the workflow (no createdAt) then each step in order, and calls onDone', () => {
        const onDone = jest.fn();
        render(<SessionCreationScreen workflowId={null} onDone={onDone}/>);
        fireEvent.change(screen.getByLabelText('Nom de la session'), {target: {value: 'Remise des diplômes'}});
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.workflowSave).toHaveBeenCalledWith(expect.objectContaining({name: 'Remise des diplômes'}));
        expect(window.electronAPI.workflowSave.mock.calls[0][0].createdAt).toBeUndefined();
        expect(window.electronAPI.stepRemove).not.toHaveBeenCalled();

        const savedWorkflowId = window.electronAPI.workflowSave.mock.calls[0][0].id;
        expect(window.electronAPI.stepSave).toHaveBeenCalledWith(expect.objectContaining({
            workflowId: savedWorkflowId,
            value: expect.objectContaining({type: 'time', name: 'Nouveau time', impro: '1', minutes: '2'}),
            afterIndex: undefined,
        }));
        expect(window.electronAPI.stepSave.mock.calls[0][0].value.createdAt).toBeUndefined();
        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('re-saving an edited session deletes all previously-persisted steps then recreates the final list in order', () => {
        const onDone = jest.fn();
        render(<SessionCreationScreen workflowId="wf-1" onDone={onDone}/>);
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: [{id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01'}]}));
        });
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: [
                {id: 'step-1', type: 'time', name: 'Impros', impro: '3', minutes: '2', createdAt: '2026-01-01'},
            ]}));
        });

        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getAllByRole('button', {name: 'Monter'})[1]);

        // two steps now exist (Image reordered to the front, then the persisted Time step) —
        // open the first row's editor (Image) by index, since both rows share the same aria-label
        fireEvent.click(screen.getAllByRole('button', {name: "Modifier l'étape"})[0]);
        const file = new File(['img'], 'logo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.workflowSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01',
        }));
        expect(window.electronAPI.stepRemove).toHaveBeenCalledWith('wf-1', 'step-1');
        expect(window.electronAPI.stepSave).toHaveBeenNthCalledWith(1, expect.objectContaining({
            workflowId: 'wf-1',
            value: expect.objectContaining({type: 'image', file}),
            afterIndex: undefined,
        }));
        expect(window.electronAPI.stepSave).toHaveBeenNthCalledWith(2, expect.objectContaining({
            workflowId: 'wf-1',
            value: expect.objectContaining({type: 'time', name: 'Impros'}),
            afterIndex: 0,
        }));
        expect(window.electronAPI.stepSave.mock.calls[1][0].value.createdAt).toBeUndefined();
        expect(onDone).toHaveBeenCalledTimes(1);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: FAIL — clicking "Enregistrer" calls nothing (no `onClick` wired yet), so `workflowSave`/`stepSave`/`onDone` are never called.

- [ ] **Step 3: Write minimal implementation**

Modify `src/component/Screen/SessionCreationScreen.js`: add `validateStep` and `handleSave` inside the component (after `toggleOpen`, before the `return`), and wire the save button's `onClick`.

```js
    function toggleOpen(index) {
        updateStep(index, {...steps[index], open: !steps[index].open});
    }

    function validateStep(step) {
        const errors = {};
        if (!step.name || !step.name.trim()) errors.name = t('step.form.error.name');
        const variantValidate = variantValidators[step.type];
        if (variantValidate) Object.assign(errors, variantValidate(step, t));
        return errors;
    }

    function handleSave() {
        const nextErrorsByStepId = {};
        let hasErrors = false;
        steps.forEach(step => {
            const errors = validateStep(step);
            if (Object.keys(errors).length) {
                nextErrorsByStepId[step.id] = errors;
                hasErrors = true;
            }
        });
        setErrorsByStepId(nextErrorsByStepId);
        if (hasErrors) return;

        const workflowIdToSave = workflowId === null ? uuidv4() : workflowId;
        const workflowPayload = workflowId === null
            ? {id: workflowIdToSave, name, color: color || randomColor()}
            : {...(existingWorkflowRef.current || {id: workflowId}), name, color};
        window.electronAPI.workflowSave(workflowPayload);

        fetchedSteps.forEach(existing => {
            window.electronAPI.stepRemove(workflowIdToSave, existing.id);
        });

        steps.forEach((step, index) => {
            const payload = {...step};
            delete payload.open;
            delete payload.createdAt;
            delete payload.updatedAt;
            if (payload.players !== undefined) {
                payload.players = payload.players.split(';').map(x => x.trim());
            }
            window.electronAPI.stepSave({
                workflowId: workflowIdToSave,
                value: payload,
                afterIndex: index === 0 ? undefined : index - 1,
            });
        });

        onDone();
    }
```

Wire the button:

```js
                <button className="btn btn-primary" onClick={handleSave}>
                    {t('sessionCreation.save')}
                </button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: PASS (11 tests)

- [ ] **Step 5: Run the whole screen's test file once more to confirm no cross-task regressions**

Run: `npm test -- --watchAll=false src/component/Screen/__tests__/SessionCreationScreen.test.js`
Expected: PASS (11 tests total across all three describe blocks)

- [ ] **Step 6: Commit**

```bash
git add src/component/Screen/SessionCreationScreen.js src/component/Screen/__tests__/SessionCreationScreen.test.js
git commit -m "SessionCreationScreen: wire Enregistrer to workflowSave/stepRemove/stepSave and onDone"
```

---

### Task 7: `Dashboard.js` wiring

**Files:**
- Modify: `src/component/Dashboard/Dashboard.js` (its `nav-shell-regie-v1`-produced form — re-read fresh before editing)
- Modify: `src/component/Dashboard/__tests__/Dashboard.test.js` (created by `nav-shell-regie-v1` Task 5)

**Interfaces:**
- Consumes: `<WorkflowDashboard onCreateNew onEditWorkflow/>` (Task 2), `<SessionCreationScreen workflowId onDone/>` (Tasks 4-6).
- Produces: `<Dashboard/>` (no props, unchanged) — top-level component, nothing later consumes it further.

- [ ] **Step 1: Write the failing test**

Modify `src/component/Dashboard/__tests__/Dashboard.test.js`: replace the plain `WorkflowDashboard` mock with one that exercises its new props, and add a mock + tests for `SessionCreationScreen`.

```js
// src/component/Dashboard/__tests__/Dashboard.test.js
import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Dashboard from '../Dashboard';

jest.mock('../../Screen/RegieScreen', () => function FakeRegieScreen() { return <div>regie-stub</div>; });
jest.mock('../../Screen/MusiqueScreen', () => function FakeMusiqueScreen() { return <div>musique-stub</div>; });
jest.mock('../WorkflowDashboard', () => function FakeWorkflowDashboard({onCreateNew, onEditWorkflow}) {
    return (
        <div>
            sessions-stub
            <button onClick={onCreateNew}>fake-create</button>
            <button onClick={() => onEditWorkflow({id: 'wf-9'})}>fake-edit</button>
        </div>
    );
});
jest.mock('../../Screen/SessionCreationScreen', () => function FakeSessionCreationScreen({workflowId, onDone}) {
    return (
        <div>
            creation-stub:{String(workflowId)}
            <button onClick={onDone}>fake-done</button>
        </div>
    );
});

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

    it('navigates to the creation screen with no workflow id when WorkflowDashboard asks to create a new session', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        fireEvent.click(screen.getByText('fake-create'));

        expect(screen.getByText('creation-stub:null')).toBeTruthy();
    });

    it('navigates to the creation screen with the workflow id when WorkflowDashboard asks to edit', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        fireEvent.click(screen.getByText('fake-edit'));

        expect(screen.getByText('creation-stub:wf-9')).toBeTruthy();
    });

    it('returns to the Sessions screen when the creation screen calls onDone', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        fireEvent.click(screen.getByText('fake-create'));
        fireEvent.click(screen.getByText('fake-done'));

        expect(screen.getByText('sessions-stub')).toBeTruthy();
        expect(screen.queryByText(/creation-stub/)).toBeNull();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false src/component/Dashboard/__tests__/Dashboard.test.js`
Expected: FAIL on the three new tests — `Dashboard.js` doesn't yet pass `onCreateNew`/`onEditWorkflow` to `WorkflowDashboard`, nor render `SessionCreationScreen`.

- [ ] **Step 3: Write minimal implementation**

```js
// src/component/Dashboard/Dashboard.js
import 'react';
import {useState} from 'react';
import Sidebar from '../Sidebar/Sidebar';
import RegieScreen from '../Screen/RegieScreen';
import MusiqueScreen from '../Screen/MusiqueScreen';
import WorkflowDashboard from './WorkflowDashboard';
import SessionCreationScreen from '../Screen/SessionCreationScreen';
import useSession from '../Hook/useSession';
import useAudios from '../Hook/useAudios';

function Dashboard() {
    const [screen, setScreen] = useState('regie');
    const [editingWorkflowId, setEditingWorkflowId] = useState(null);
    const session = useSession();
    const audios = useAudios();

    function createNew() {
        setEditingWorkflowId(null);
        setScreen('creation');
    }

    function editWorkflow(workflow) {
        setEditingWorkflowId(workflow.id);
        setScreen('creation');
    }

    function doneCreating() {
        setEditingWorkflowId(null);
        setScreen('sessions');
    }

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
                {screen === 'sessions' && <WorkflowDashboard onCreateNew={createNew} onEditWorkflow={editWorkflow}/>}
                {screen === 'creation' && <SessionCreationScreen workflowId={editingWorkflowId} onDone={doneCreating}/>}
            </main>
        </div>
    );
}

export default Dashboard;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false src/component/Dashboard/__tests__/Dashboard.test.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Run the full test suite to confirm nothing else regressed**

Run: `npm test -- --watchAll=false`
Expected: PASS (every existing suite plus every suite added/modified in Tasks 1-7)

- [ ] **Step 6: Commit**

```bash
git add src/component/Dashboard/Dashboard.js src/component/Dashboard/__tests__/Dashboard.test.js
git commit -m "Wire Dashboard's Sessions screen to the in-page SessionCreationScreen"
```

---

### Task 8: Manual verification against the real Electron app

None of the RTL suites in Tasks 1-7 exercise the real `window.electronAPI` IPC bridge, real file pickers, or persistence across an app restart — a manual pass is required before considering this plan done.

**Files:** none (verification only).

**Interfaces:** none produced; exercises the full stack assembled by Tasks 1-7.

- [ ] **Step 1: Start the app**

Run: `npm start`. Navigate to **Sessions** in the sidebar (bottom nav item under "Bibliothèque").

- [ ] **Step 2: Create a brand-new session end-to-end**

Click "Créer une session". Confirm the sidebar's Sessions item stays highlighted (per Task 3) and the screen shows an empty name field, an empty step list, and four "Ajouter :" buttons (Image, Vidéo de doublage, Time, Battle Royal).

Type a name. Click "Time" to add a step, click its edit (pen) icon, set Nombre d'impros=2 and Minutes=3. Click "Image", edit it, and pick a real image file from disk. Click "Enregistrer".

Confirm: you're returned to the Sessions list, the new session appears with the name you typed, selecting it and looking at its steps (via the existing detail view) shows both steps in the order you left them (Time, then Image).

- [ ] **Step 3: Edit an existing session and reorder its steps**

From the Sessions list, select the session you just created, click "Modifier" (pen icon in the detail view's action bar). Confirm the creation screen opens pre-filled with the existing name and both steps. Click the down-chevron on the first step (Time) to swap it below Image. Add a third step (Battle Royal), fill in at least one player name, and click "Enregistrer".

- [ ] **Step 4: Confirm persistence across a restart**

Quit and restart the app (`npm start` again). Navigate to Sessions, select the same session, and confirm all three steps are present in the exact order left in Step 3 (Image, Time, Battle Royal), and each one's fields (file, impro/minutes, players) still show the values entered.

- [ ] **Step 5: Confirm the old per-step edit/add sub-flow inside the Sessions list still works unchanged**

From the same session's detail view (not the creation screen — the plain list/detail view reached by selecting a workflow without clicking "Modifier"), use the existing "+" add-step button between two steps. Confirm it still opens the separate standalone Step window exactly as before this plan (unaffected — this sub-flow was explicitly out of scope).

- [ ] **Step 6: Record the result**

If every check in Steps 2-5 passes with no console errors, this plan is complete. If anything fails, stop and fix it (with a matching automated test added retroactively to the relevant task) before merging.
