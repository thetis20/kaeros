# Music Tag Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the color-coded Folder→Audio music system with a flat, tag-based (`Musique`/`Bruitage`/`Disco`) track library — including a real, non-destructive migration of existing production data — exposed through a rebuilt `MusiqueScreen` and a standalone `RegieTrackPicker` for a later plan to consume.

**Architecture:** The backend keeps the existing DDD layering (`entity` → `port/repository` → `useCase` → `infrastructure`), replacing the two-collection Folder/Audio storage (`'folders'` + one `'audios_'+folderId'` key per folder) with a single flat `'tracks'` key holding the extended `Audio` entity (now carrying `tag` instead of `playing`). IPC moves from the six folder/audio channels (plus two secondary `BrowserWindow`s for the create/edit forms) to five flat `track-*` channels handled directly on `MainWindow`, mirroring the already-flat `workflow-*` pattern. The frontend gets one new hook (`useTracks`), one new standalone picker component (`RegieTrackPicker`, built for a later plan), and a full rewrite of the in-page `MusiqueScreen` (tag tabs + inline add/edit/delete), with the old `Folder`/`Audio` windows, components and backend use cases deleted only once the new system is proven working.

**Tech Stack:** Electron (main process, CommonJS, `electron-store` v11), React 19, react-i18next, react-bootstrap-icons, Jest + React Testing Library (jsdom) for `src/`, plain Jest (Node environment) for `public/script/`, `uuid` for id generation.

## Global Constraints

- **Re-read fresh before starting:** `src/component/Dashboard/Dashboard.js`, `src/component/Screen/MusiqueScreen.js`, `src/component/Controller/AudioController.js`, `src/component/Hook/useAudios.js`, `src/component/Sidebar/Sidebar.js`, `src/i18n/translation.fr.json` — these are produced by the sibling `2026-07-20-nav-shell-regie-v1.md` plan, which had **not** been executed at the time this plan was written. That plan may have been implemented with small deviations from its own written form. Treat the actual code on disk as ground truth over any excerpt quoted in this document; if a quoted excerpt doesn't match, adapt the diff to the real file and note the deviation in the task's commit message.
- **Never construct the real production `store.js` singleton in a test.** `public/script/infrastructure/repository/store.js` is instantiated with no explicit `cwd`, so on a machine without a real Electron `app` instance (i.e. under Jest) it falls back to `electron-store`'s own OS-default config path for this project — the exact same family of path the packaged app could use. Task 5 therefore extracts the `migrations` object into its own side-effect-free module (`public/script/infrastructure/repository/migrations.js`, a plain object, no `Store` construction) so tests can build throwaway `Store` instances with an explicit `cwd: os.tmpdir()` without ever requiring `store.js` itself. This is a deliberate structural deviation from a naive "just add a migration key to store.js and test it directly" approach — it exists specifically to protect the real user's production data, which the user has confirmed is real and must not be lost.
- **Migrated tracks default to tag `'Musique'`.** There is no reliable automatic mapping from an arbitrary user-chosen folder name/color to one of the three fixed tags (`Musique`/`Bruitage`/`Disco`); `'Musique'` is the most generic bucket, and users can bulk-retag afterward from `MusiqueScreen`. The migration is purely additive: `store.set('tracks', (store.get('tracks') || []).concat(tracks))` appends, and the old `'folders'`/`'audios_'+id` keys are never deleted by it — they remain on disk, untouched, as a recoverable backup, until Task 11 explicitly deletes the *code* that reads them (never the data itself; the migration is the only thing allowed to touch the `'tracks'` key from old data).
- **Backend test runner does not exist yet and `yarn test` cannot reach `public/script/`.** Verified empirically: `react-scripts`' Jest config hardcodes `roots: ['<rootDir>/src']`, and `roots` is not among the Jest options `react-scripts` allows a project's `package.json` to override (confirmed: adding `roots` to `package.json`'s `jest` field makes `react-scripts test` hard-error and refuse to run). Task 1 therefore adds a dedicated `"test:main"` npm script that invokes the plain `jest` binary directly, bypassing `react-scripts` entirely: `jest --rootDir public/script --testEnvironment node --testMatch "**/__tests__/**/*.test.js"` — verified working end-to-end (including `electron-store` against a temp `cwd`) before this plan was written. Every backend (main-process) task in this plan runs tests via `yarn test:main <path>`; every frontend (`src/`) task runs tests via `yarn test --watchAll=false <path>`, per the existing convention.
- **`CreateTrackUseCase` mints the track's id itself** (via `uuid`'s `v4()`), unlike the old `Audio.js` form which pre-generated an id client-side (`useState({id: uuidv4(), ...})`). `MusiqueScreen`'s "add" form never sets an `id` on a brand-new track, so `MainWindow.trackSave` can use `value.id` presence as the sole create-vs-update signal (create when absent, update when present) — this is this plan's design, not a pre-existing convention, and is required to make the `if (value.id)` branch in `trackSave` meaningful.
- **`color` is not a field on the add-track form.** The form only collects name, tag and file (per this plan's design); `ValidTrackUseCase` does not validate `color` at all. `MusiqueScreen.js` derives `color` automatically from a fixed `tag → hex` palette (`Musique` → `#4C6EFF`, `Bruitage` → `#F76707`, `Disco` → `#AE3EC9`) at creation time only, so `RegieTrackPicker`'s colored dot always has something to render without needing a color picker. Editing an existing track preserves its already-stored `color` unchanged — the edit path never re-derives it.
- Follow the existing flat-key JSON convention in `src/i18n/translation.fr.json` (nested objects, French strings) for every new translation key, same as the sibling `nav-shell-regie-v1` plan.
- Every component test that renders translated text imports `'../../../lib/i18n'` first, matching the existing convention (`Workflow.test.js`, `Folder.test.js`, `AudioController.test.js`). Hook tests (no rendered text) skip this import, matching `useWorkflows.test.js`.
- This codebase's real test convention (verified in `AudioController.test.js`, `Workflow.test.js`, `useWorkflows.test.js`): drive real hooks via `document.dispatchEvent(new CustomEvent(...))`, mock `window.electronAPI` methods with `jest.fn()`. `jest.mock()` is only ever used to stub **child components** (e.g. `InputColor`), never custom hooks. Follow this for every new frontend test in this plan.
- Backend use-case tests use plain hand-written fake repository objects (no mocking library) — there are no pre-existing use-case tests under `public/script/application/useCase/**` to contradict this; it matches this codebase's minimal-dependency style everywhere else.
- Do not touch anything workflow/step/session-related in `MainWindow.js`, `preload-main.js`, or `useCase.js` beyond exactly what is specified in Tasks 4 and 9.
- Task 11 (retirement) runs only after Tasks 1-10 are green. It `grep -rn`s for every symbol/path about to be deleted **before** deleting (output pasted into the step), then deletes, then re-runs both full suites (`yarn test --watchAll=false` and `yarn test:main`).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `"test:main"` script to run backend tests via plain Jest. |
| `public/script/application/entity/Audio.js` | Modify | Add `tag`, drop `playing`; reused as the Track entity (no separate `Track` class). |
| `public/script/application/entity/__tests__/Audio.test.js` | Create | Constructor field-assignment tests. |
| `public/script/application/port/repository/TrackRepository.js` | Create | Abstract port: `create/update/delete/getAll`. |
| `public/script/infrastructure/repository/TrackStoreRepository.js` | Create | Flat `'tracks'` key implementation, mirrors `WorkflowStoreRepository.js`. |
| `public/script/infrastructure/repository/__tests__/TrackStoreRepository.test.js` | Create | Repository tests against a temp `electron-store` instance (module-mocked). |
| `public/script/application/useCase/track/ValidTrackUseCase.js` | Create | Validates `name` (non-empty string) and `tag` (one of 3 fixed values). |
| `public/script/application/useCase/track/ListTrackUseCase.js` | Create | Reconstructs `Audio` instances from raw store data. |
| `public/script/application/useCase/track/CreateTrackUseCase.js` | Create | Validates, mints an id, persists. |
| `public/script/application/useCase/track/UpdateTrackUseCase.js` | Create | Validates, stamps `updatedAt`, persists. |
| `public/script/application/useCase/track/DeleteTrackUseCase.js` | Create | Delegates to repository. |
| `public/script/application/useCase/track/__tests__/*.test.js` | Create | One test file per use case above, fake-repository based. |
| `public/script/infrastructure/useCase.js` | Modify | Add track singletons (Task 4); remove folder/audio singletons (Task 11). |
| `public/script/infrastructure/repository/migrations.js` | Create | Side-effect-free `migrations` object (moved `'0.0.1'` verbatim + new `'0.1.0'`). |
| `public/script/infrastructure/repository/store.js` | Modify | `require('./migrations.js')` instead of an inline object; shape/exports unchanged. |
| `public/script/infrastructure/repository/__tests__/migrations.test.js` | Create | Migration test against temp `Store` instances built from `migrations.js`. |
| `src/component/Hook/useTracks.js` | Create | `useTracks()` — fetch + `track-onchange` listener, mirrors `useWorkflows.js`. |
| `src/component/Hook/__tests__/useTracks.test.js` | Create | Hook tests mirroring `useWorkflows.test.js`. |
| `src/component/Track/RegieTrackPicker.js` | Create | Standalone picker: tag tabs, colored dot, start/"En cours" button. Consumed by a later plan. |
| `src/component/Track/__tests__/RegieTrackPicker.test.js` | Create | Tag filtering, disabled/"En cours" state, `onStart` call. |
| `src/component/Screen/MusiqueScreen.js` | Modify (full rewrite) | Tag tabs, add/edit form, track list with edit/delete. |
| `src/component/Screen/__tests__/MusiqueScreen.test.js` | Modify (full rewrite) | Replaces the plan-1 placeholder test. |
| `src/i18n/translation.fr.json` | Modify | Replace placeholder `musique.*`, add `musique.form.*`/`musique.edit`/`musique.remove`/`musique.empty` and a new top-level `track.*` (shared tag labels + start/playing strings). |
| `public/script/window/MainWindow.js` | Modify | Replace all folder/audio bindings/listeners/handlers with `track-*` equivalents; remove `FolderWindow`/`AudioWindow` usage. |
| `public/script/preload/preload-main.js` | Modify | Replace `folder-onchange`/`audio-onchange` with `track-onchange`; replace folder/audio API methods with `trackFetch/trackSave/trackRemove/trackPlay/trackEnd` (with `webUtils` file-to-path conversion). |
| `src/component/Controller/AudioController.js` | Modify (2 lines) | `notifyPlay`/`notifyEnd` call `trackPlay(id)`/`trackEnd(id)` instead of `audioPlay(folderId, id)`/`audioEnd(folderId, id)`. |
| `src/component/Folder/*`, `src/component/Audio/*` | Delete | Old create/edit forms, fully replaced by `MusiqueScreen`. |
| `src/component/Dashboard/FolderDashboard.js`, `AudioDashboard.js` | Delete | Old folder-browsing UI, fully replaced by `MusiqueScreen`. |
| `src/App.js` | Modify | Remove `mode: 'folder'`/`mode: 'audio'` cases + their imports. |
| `public/script/window/FolderWindow.js`, `AudioWindow.js` | Delete | Retired secondary windows. |
| `public/script/preload/preload-folder.js`, `preload-audio.js` | Delete | Retired preloads. |
| `public/script/application/useCase/folder/*`, `public/script/application/useCase/audio/*` | Delete | Retired use cases. |
| `public/script/infrastructure/repository/FolderStoreRepository.js`, `AudioStoreRepository.js` | Delete | Retired repositories. |
| `public/script/application/port/repository/FolderRepository.js`, `AudioRepository.js` | Delete | Retired ports. |
| `public/script/application/entity/Folder.js` | Delete | Retired entity (the `Audio` entity is kept and reused for tracks). |

---

### Task 1: `Audio` entity change (add `tag`, drop `playing`) + backend test runner

**Files:**
- Modify: `package.json`
- Modify: `public/script/application/entity/Audio.js`
- Test: `public/script/application/entity/__tests__/Audio.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks (first task).
- Produces: `new Audio(id, name, src, color, tag, createdAt, updatedAt)` → `{id, name, src, color, tag, createdAt, updatedAt}` (no `playing`), relied on by every later backend task in this plan. `yarn test:main <path>` as the standing backend test command, relied on by Tasks 2, 3, 5.

- [ ] **Step 1: Add the backend test script and write the failing test**
```json
// package.json — inside "scripts", right after "test"
"test": "react-scripts test",
"test:main": "jest --rootDir public/script --testEnvironment node --testMatch \"**/__tests__/**/*.test.js\"",
"eject": "react-scripts eject"
```
```js
// public/script/application/entity/__tests__/Audio.test.js
const Audio = require('../Audio');

describe('Audio entity', () => {
    it('assigns id, name, src, color, tag, createdAt and updatedAt from the constructor', () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const audio = new Audio('a1', 'Track One', '/tmp/track1.mp3', '#4C6EFF', 'Musique', createdAt, updatedAt);

        expect(audio.id).toBe('a1');
        expect(audio.name).toBe('Track One');
        expect(audio.src).toBe('/tmp/track1.mp3');
        expect(audio.color).toBe('#4C6EFF');
        expect(audio.tag).toBe('Musique');
        expect(audio.createdAt).toBe(createdAt);
        expect(audio.updatedAt).toBe(updatedAt);
        expect(audio.playing).toBeUndefined();
    });

    it('defaults createdAt/updatedAt to a Date when omitted', () => {
        const audio = new Audio('a1', 'Track One', '/tmp/track1.mp3', '#4C6EFF', 'Musique');

        expect(audio.createdAt).toBeInstanceOf(Date);
        expect(audio.updatedAt).toBeInstanceOf(Date);
    });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `yarn test:main public/script/application/entity/__tests__/Audio.test.js`
Expected: FAIL — `expect(audio.tag).toBe('Musique')` fails because the current constructor's 5th parameter is `playing`, not `tag` (so `audio.tag` is `undefined` and `audio.playing` is `'Musique'`, not `undefined`).
- [ ] **Step 3: Write minimal implementation**
```js
// public/script/application/entity/Audio.js
class Audio {
    constructor(id, name, src, color, tag, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.src = src;
        this.color = color;
        this.tag = tag;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}

module.exports = Audio
```
- [ ] **Step 4: Run test to verify it passes**
Run: `yarn test:main public/script/application/entity/__tests__/Audio.test.js`
Expected: PASS (2 tests)
- [ ] **Step 5: Commit**
```bash
git add package.json public/script/application/entity/Audio.js public/script/application/entity/__tests__/Audio.test.js
git commit -m "Add tag field to Audio entity and a jest-based backend test runner"
```

---

### Task 2: `TrackRepository` port + `TrackStoreRepository`

**Files:**
- Create: `public/script/application/port/repository/TrackRepository.js`
- Create: `public/script/infrastructure/repository/TrackStoreRepository.js`
- Test: `public/script/infrastructure/repository/__tests__/TrackStoreRepository.test.js`

**Interfaces:**
- Consumes: `Audio` entity (Task 1) for JSDoc typing only.
- Produces: `TrackStoreRepository` with `create(track)/update(id, track)/delete(id)/getAll()` on flat store key `'tracks'`, relied on by Task 3's use cases and Task 4's wiring.

- [ ] **Step 1: Write the failing test**
```js
// public/script/infrastructure/repository/__tests__/TrackStoreRepository.test.js
const os = require('os');
const fs = require('fs');
const Store = require('electron-store').default;

describe('TrackStoreRepository', () => {
    let tempStore;
    let TrackStoreRepository;
    let repository;

    beforeEach(() => {
        jest.resetModules();
        tempStore = new Store({
            name: 'test-tracks-' + Date.now() + '-' + Math.random().toString(36).slice(2),
            cwd: os.tmpdir(),
        });
        jest.doMock('../store.js', () => tempStore);
        TrackStoreRepository = require('../TrackStoreRepository');
        repository = new TrackStoreRepository();
    });

    afterEach(() => {
        if (fs.existsSync(tempStore.path)) fs.unlinkSync(tempStore.path);
        jest.dontMock('../store.js');
    });

    it('starts with an empty list', async () => {
        expect(await repository.getAll()).toEqual([]);
    });

    it('creates and lists a track', async () => {
        const track = {id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'};
        await repository.create(track);

        expect(await repository.getAll()).toEqual([track]);
    });

    it('updates a track by id without touching other tracks', async () => {
        await repository.create({id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'});
        await repository.create({id: 't2', name: 'Track Two', src: '/tmp/t2.mp3', color: '#F76707', tag: 'Bruitage'});

        await repository.update('t1', {id: 't1', name: 'Track One Edited', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Disco'});

        const all = await repository.getAll();
        expect(all).toHaveLength(2);
        expect(all.find(t => t.id === 't1')).toEqual({id: 't1', name: 'Track One Edited', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Disco'});
        expect(all.find(t => t.id === 't2').name).toBe('Track Two');
    });

    it('deletes a track by id', async () => {
        await repository.create({id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'});
        await repository.delete('t1');

        expect(await repository.getAll()).toEqual([]);
    });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `yarn test:main public/script/infrastructure/repository/__tests__/TrackStoreRepository.test.js`
Expected: FAIL with "Cannot find module '../TrackStoreRepository'"
- [ ] **Step 3: Write minimal implementation**
```js
// public/script/application/port/repository/TrackRepository.js
const Audio = require("../../entity/Audio");

class TrackRepository {

    /**
     * @param {Audio} track
     */
    async create(track) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id
     * @param {Audio} track
     */
    async update(id, track) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id
     */
    async delete(id) {
        throw new Error("Not implemented");
    }

    /**
     * @returns {Promise<Audio[]>}
     */
    async getAll() {
        throw new Error("Not implemented");
    }
}

module.exports = TrackRepository;
```
```js
// public/script/infrastructure/repository/TrackStoreRepository.js
const TrackRepository = require('../../application/port/repository/TrackRepository.js');
const store = require('./store.js');

class TrackStoreRepository extends TrackRepository {
    async create(track) { store.appendToArray('tracks', track) }
    async update(id, track) {
        let tracks = store.get('tracks')
        store.set('tracks', tracks.map(t => t.id === id ? track : t))
    }
    async delete(id) {
        let tracks = store.get('tracks')
        store.set('tracks', tracks.filter(t => t.id !== id))
    }
    async getAll() { return store.get('tracks') || [] }
}
module.exports = TrackStoreRepository;
```
- [ ] **Step 4: Run test to verify it passes**
Run: `yarn test:main public/script/infrastructure/repository/__tests__/TrackStoreRepository.test.js`
Expected: PASS (4 tests)
- [ ] **Step 5: Commit**
```bash
git add public/script/application/port/repository/TrackRepository.js public/script/infrastructure/repository/TrackStoreRepository.js public/script/infrastructure/repository/__tests__/TrackStoreRepository.test.js
git commit -m "Add flat TrackRepository/TrackStoreRepository storing tracks under a single 'tracks' key"
```

---

### Task 3: `ValidTrackUseCase` + `List/Create/Update/DeleteTrackUseCase`

**Files:**
- Create: `public/script/application/useCase/track/ValidTrackUseCase.js`
- Create: `public/script/application/useCase/track/ListTrackUseCase.js`
- Create: `public/script/application/useCase/track/CreateTrackUseCase.js`
- Create: `public/script/application/useCase/track/UpdateTrackUseCase.js`
- Create: `public/script/application/useCase/track/DeleteTrackUseCase.js`
- Test: `public/script/application/useCase/track/__tests__/ValidTrackUseCase.test.js`
- Test: `public/script/application/useCase/track/__tests__/ListTrackUseCase.test.js`
- Test: `public/script/application/useCase/track/__tests__/CreateTrackUseCase.test.js`
- Test: `public/script/application/useCase/track/__tests__/UpdateTrackUseCase.test.js`
- Test: `public/script/application/useCase/track/__tests__/DeleteTrackUseCase.test.js`

**Interfaces:**
- Consumes: `Audio` entity (Task 1); `TrackRepository` shape (Task 2, as a plain fake object in tests — no real repository dependency here).
- Produces: `ListTrackUseCase.execute(): Promise<Audio[]>`, `CreateTrackUseCase.execute(track): Promise<Audio>` (mints `id`), `UpdateTrackUseCase.execute(id, track): Promise<Audio>`, `DeleteTrackUseCase.execute(id): Promise<void>` — all relied on by Task 4's wiring and Task 9's `MainWindow.js`.

- [ ] **Step 1: Write the failing tests**
```js
// public/script/application/useCase/track/__tests__/ValidTrackUseCase.test.js
const ValidTrackUseCase = require('../ValidTrackUseCase');

describe('ValidTrackUseCase', () => {
    const validTrackUseCase = new ValidTrackUseCase();

    it('accepts a track with a non-empty name and a recognized tag', () => {
        const track = {name: 'Track One', tag: 'Musique'};
        expect(validTrackUseCase.execute(track)).toBe(track);
    });

    it.each(['Musique', 'Bruitage', 'Disco'])('accepts the %s tag', (tag) => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tag})).not.toThrow();
    });

    it('rejects a missing or empty name', () => {
        expect(() => validTrackUseCase.execute({name: '', tag: 'Musique'})).toThrow('Invalid track name');
        expect(() => validTrackUseCase.execute({tag: 'Musique'})).toThrow('Invalid track name');
    });

    it('rejects a tag outside Musique/Bruitage/Disco', () => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tag: 'Jazz'})).toThrow('Invalid track tag');
        expect(() => validTrackUseCase.execute({name: 'Track One'})).toThrow('Invalid track tag');
    });
});
```
```js
// public/script/application/useCase/track/__tests__/ListTrackUseCase.test.js
const ListTrackUseCase = require('../ListTrackUseCase');
const Audio = require('../../../entity/Audio');

describe('ListTrackUseCase', () => {
    it('reconstructs Audio entities from raw stored track data', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const fakeRepository = {
            getAll: async () => [{id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique', createdAt, updatedAt}],
        };
        const listTrackUseCase = new ListTrackUseCase(fakeRepository);

        const tracks = await listTrackUseCase.execute();

        expect(tracks).toHaveLength(1);
        expect(tracks[0]).toBeInstanceOf(Audio);
        expect(tracks[0]).toEqual(new Audio('t1', 'Track One', '/tmp/t1.mp3', '#4C6EFF', 'Musique', createdAt, updatedAt));
    });

    it('returns an empty array when there are no stored tracks', async () => {
        const fakeRepository = {getAll: async () => []};
        const listTrackUseCase = new ListTrackUseCase(fakeRepository);

        expect(await listTrackUseCase.execute()).toEqual([]);
    });
});
```
```js
// public/script/application/useCase/track/__tests__/CreateTrackUseCase.test.js
const CreateTrackUseCase = require('../CreateTrackUseCase');

describe('CreateTrackUseCase', () => {
    function fakeRepository() {
        const created = [];
        return {created, create: async (track) => { created.push(track); }};
    }

    it('generates a fresh id and persists a valid track', async () => {
        const repository = fakeRepository();
        const createTrackUseCase = new CreateTrackUseCase(repository);

        const result = await createTrackUseCase.execute({name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'});

        expect(result.id).toEqual(expect.any(String));
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.name).toBe('Track One');
        expect(result.tag).toBe('Musique');
        expect(repository.created).toEqual([result]);
    });

    it('throws and does not persist when the track is invalid', async () => {
        const repository = fakeRepository();
        const createTrackUseCase = new CreateTrackUseCase(repository);

        await expect(createTrackUseCase.execute({name: '', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'})).rejects.toThrow('Invalid track name');
        expect(repository.created).toEqual([]);
    });
});
```
```js
// public/script/application/useCase/track/__tests__/UpdateTrackUseCase.test.js
const UpdateTrackUseCase = require('../UpdateTrackUseCase');

describe('UpdateTrackUseCase', () => {
    function fakeRepository() {
        const updated = [];
        return {updated, update: async (id, track) => { updated.push({id, track}); }};
    }

    it('sets updatedAt and persists a valid track update', async () => {
        const repository = fakeRepository();
        const updateTrackUseCase = new UpdateTrackUseCase(repository);
        const track = {id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Bruitage', createdAt: new Date('2024-01-01')};

        await updateTrackUseCase.execute('t1', track);

        expect(repository.updated).toHaveLength(1);
        expect(repository.updated[0].id).toBe('t1');
        expect(repository.updated[0].track.updatedAt).toBeInstanceOf(Date);
    });

    it('throws and does not persist when the tag is invalid', async () => {
        const repository = fakeRepository();
        const updateTrackUseCase = new UpdateTrackUseCase(repository);

        await expect(updateTrackUseCase.execute('t1', {id: 't1', name: 'Track One', tag: 'Jazz'})).rejects.toThrow('Invalid track tag');
        expect(repository.updated).toEqual([]);
    });
});
```
```js
// public/script/application/useCase/track/__tests__/DeleteTrackUseCase.test.js
const DeleteTrackUseCase = require('../DeleteTrackUseCase');

describe('DeleteTrackUseCase', () => {
    it('delegates deletion to the repository', async () => {
        const deleted = [];
        const repository = {delete: async (id) => { deleted.push(id); }};
        const deleteTrackUseCase = new DeleteTrackUseCase(repository);

        await deleteTrackUseCase.execute('t1');

        expect(deleted).toEqual(['t1']);
    });
});
```
- [ ] **Step 2: Run tests to verify they fail**
Run: `yarn test:main public/script/application/useCase/track`
Expected: FAIL with "Cannot find module '../ValidTrackUseCase'" (and similarly for the other 4 modules)
- [ ] **Step 3: Write minimal implementations**
```js
// public/script/application/useCase/track/ValidTrackUseCase.js
class ValidTrackUseCase {

    /**
     * @param {Audio} track
     * @return {Audio}
     */
    execute(track) {
        if (!track.name || typeof track.name !== 'string') {
            throw new Error('Invalid track name');
        }

        const validTags = ['Musique', 'Bruitage', 'Disco'];
        if (!track.tag || !validTags.includes(track.tag)) {
            throw new Error('Invalid track tag');
        }

        return track
    }
}

module.exports = ValidTrackUseCase
```
```js
// public/script/application/useCase/track/ListTrackUseCase.js
const Audio = require("../../entity/Audio");

class ListTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.trackRepository = trackRepository;
    }

    /**
     * @returns {Promise<Audio[]>}
     */
    async execute() {
        const tracks = await this.trackRepository.getAll();
        return tracks.map(t => new Audio(t.id, t.name, t.src, t.color, t.tag, t.createdAt, t.updatedAt));
    }
}

module.exports = ListTrackUseCase;
```
```js
// public/script/application/useCase/track/CreateTrackUseCase.js
const {v4: uuidv4} = require('uuid');
const Audio = require("../../entity/Audio");
const ValidTrackUseCase = require("./ValidTrackUseCase");

class CreateTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.validTrackUseCase = new ValidTrackUseCase();
        this.trackRepository = trackRepository;
    }

    /**
     * @param {{name: string, src: string, color: string, tag: string}} track
     * @returns {Promise<Audio>}
     */
    async execute(track) {
        this.validTrackUseCase.execute(track);

        const newTrack = new Audio(uuidv4(), track.name, track.src, track.color, track.tag);
        await this.trackRepository.create(newTrack);

        return newTrack;
    }
}

module.exports = CreateTrackUseCase;
```
```js
// public/script/application/useCase/track/UpdateTrackUseCase.js
const ValidTrackUseCase = require("./ValidTrackUseCase");

class UpdateTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.validTrackUseCase = new ValidTrackUseCase();
        this.trackRepository = trackRepository;
    }

    /**
     * @param {string} id
     * @param {Audio} track
     * @returns {Promise<Audio>}
     */
    async execute(id, track) {
        this.validTrackUseCase.execute(track);

        track.updatedAt = new Date();
        await this.trackRepository.update(id, track);

        return track;
    }
}

module.exports = UpdateTrackUseCase;
```
```js
// public/script/application/useCase/track/DeleteTrackUseCase.js
class DeleteTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.trackRepository = trackRepository;
    }

    /**
     * @param {string} id
     */
    async execute(id) {
        await this.trackRepository.delete(id);
    }
}

module.exports = DeleteTrackUseCase;
```
- [ ] **Step 4: Run tests to verify they pass**
Run: `yarn test:main public/script/application/useCase/track`
Expected: PASS (11 tests: 4 + 2 + 2 + 2 + 1)
- [ ] **Step 5: Commit**
```bash
git add public/script/application/useCase/track
git commit -m "Add Track use cases (Valid/List/Create/Update/Delete)"
```

---

### Task 4: Wire track singletons into `useCase.js`

**Files:**
- Modify: `public/script/infrastructure/useCase.js`

**Interfaces:**
- Consumes: `TrackStoreRepository` (Task 2), `List/Create/Update/DeleteTrackUseCase` (Task 3).
- Produces: `listTrackUseCase`, `createTrackUseCase`, `updateTrackUseCase`, `deleteTrackUseCase` singletons exported from `public/script/infrastructure/useCase.js`, relied on by Task 9's `MainWindow.js`. The existing `listFolderUseCase`/`createFolderUseCase`/.../`deleteAudioUseCase`/`listAudioByFolderUseCase` exports are left untouched here — they are only removed in Task 11, once nothing else imports them.

- [ ] **Step 1: Add the new requires, instantiations and exports (append-only, nothing removed)**
```js
// public/script/infrastructure/useCase.js — add near the top, after the existing folder/audio requires
const ListTrackUseCase = require('../application/useCase/track/ListTrackUseCase.js');
const CreateTrackUseCase = require('../application/useCase/track/CreateTrackUseCase.js');
const UpdateTrackUseCase = require('../application/useCase/track/UpdateTrackUseCase.js');
const DeleteTrackUseCase = require('../application/useCase/track/DeleteTrackUseCase.js');
```
```js
// public/script/infrastructure/useCase.js — add near the other *StoreRespository requires
const TrackStoreRespository = require('./repository/TrackStoreRepository.js');
```
```js
// public/script/infrastructure/useCase.js — add near the other singleton instantiations
const trackStoreRespository = new TrackStoreRespository();

const listTrackUseCase = new ListTrackUseCase(trackStoreRespository);
const createTrackUseCase = new CreateTrackUseCase(trackStoreRespository);
const updateTrackUseCase = new UpdateTrackUseCase(trackStoreRespository);
const deleteTrackUseCase = new DeleteTrackUseCase(trackStoreRespository);
```
```js
// public/script/infrastructure/useCase.js — add inside the existing module.exports object
module.exports = {
    listFolderUseCase,
    createFolderUseCase,
    updateFolderUseCase,
    deleteFolderUseCase,

    listAudioByFolderUseCase,
    createAudioUseCase,
    updateAudioUseCase,
    deleteAudioUseCase,

    listTrackUseCase,
    createTrackUseCase,
    updateTrackUseCase,
    deleteTrackUseCase,

    createWorkflowUseCase,
    updateWorkflowUseCase,
    deleteWorkflowUseCase,
    listWorkflowUseCase,

    createStepUseCase,
    updateStepUseCase,
    deleteStepUseCase,
    listStepByWorkflowUseCase,

    createSessionUseCase
}
```
- [ ] **Step 2: Verify by re-running every backend suite written so far**
Run: `yarn test:main`
Expected: PASS (all suites from Tasks 1-3 still pass; `useCase.js` itself has no dedicated test since it's pure wiring — a `require('./useCase.js')` syntax/runtime error would surface as every other suite failing to load, so a full green run is the verification here)
- [ ] **Step 3: (no separate implementation step — Step 1 is the full change)**
- [ ] **Step 4: (covered by Step 2)**
- [ ] **Step 5: Commit**
```bash
git add public/script/infrastructure/useCase.js
git commit -m "Wire Track use case singletons into useCase.js"
```

---

### Task 5: Migration `'0.1.0'` — folders/audios_* → flat tracks

**Files:**
- Create: `public/script/infrastructure/repository/migrations.js`
- Modify: `public/script/infrastructure/repository/store.js`
- Test: `public/script/infrastructure/repository/__tests__/migrations.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure data transformation, no entity classes involved — old/new shapes are plain objects).
- Produces: `module.exports` of `migrations.js` — a plain `{version: fn}` object also passed into `store.js`'s `Store` constructor — consumed only by `store.js` itself and by this task's test (never by anything else, per the Global Constraint against constructing the real singleton in tests).

- [ ] **Step 1: Write the failing test**
```js
// public/script/infrastructure/repository/__tests__/migrations.test.js
const os = require('os');
const fs = require('fs');
const Store = require('electron-store').default;
const migrations = require('../migrations.js');

describe('migrations 0.1.0 (folders/audios_* -> flat tracks)', () => {
    let legacyPath;

    afterEach(() => {
        if (legacyPath && fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath);
    });

    it("copies every folder's audios into a flat tracks array tagged Musique, without deleting the old folders/audios_* keys", () => {
        const name = 'test-migration-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.0.1', migrations});
        legacyPath = legacy.path;
        legacy.set('folders', [{id: 'f1', name: 'Rock', color: '#ff0000', createdAt: '2024-01-01', updatedAt: '2024-01-01'}]);
        legacy.set('audios_f1', [
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', playing: false, createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);

        const migrated = new Store({name, cwd, projectVersion: '0.1.0', migrations});

        expect(migrated.get('tracks')).toEqual([
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', tag: 'Musique', createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);
        expect(migrated.get('folders')).toEqual([{id: 'f1', name: 'Rock', color: '#ff0000', createdAt: '2024-01-01', updatedAt: '2024-01-01'}]);
        expect(migrated.get('audios_f1')).toEqual([
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', playing: false, createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);
    });

    it('is additive: appends to any pre-existing tracks instead of overwriting them', () => {
        const name = 'test-migration-additive-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.0.1', migrations});
        legacyPath = legacy.path;
        legacy.set('tracks', [{id: 'existing', name: 'Existing Track', src: '/tmp/e.mp3', color: '#000000', tag: 'Disco'}]);
        legacy.set('folders', [{id: 'f1', name: 'Rock', color: '#ff0000'}]);
        legacy.set('audios_f1', [{id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', createdAt: '2024-02-01', updatedAt: '2024-02-02'}]);

        const migrated = new Store({name, cwd, projectVersion: '0.1.0', migrations});

        expect(migrated.get('tracks')).toEqual([
            {id: 'existing', name: 'Existing Track', src: '/tmp/e.mp3', color: '#000000', tag: 'Disco'},
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', tag: 'Musique', createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);
    });

    it('leaves an empty tracks array when there are no folders at all', () => {
        const name = 'test-migration-empty-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.0.1', migrations});
        legacyPath = legacy.path;

        const migrated = new Store({name, cwd, projectVersion: '0.1.0', migrations});

        expect(migrated.get('tracks')).toEqual([]);
    });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `yarn test:main public/script/infrastructure/repository/__tests__/migrations.test.js`
Expected: FAIL with "Cannot find module '../migrations.js'"
- [ ] **Step 3: Write minimal implementation**
```js
// public/script/infrastructure/repository/migrations.js
const migrations = {
    '0.0.1': store => {
        store.set('playlists', []);
    },
    '0.1.0': store => {
        const folders = store.get('folders') || [];
        const tracks = [];
        for (const folder of folders) {
            const audios = store.get('audios_' + folder.id) || [];
            for (const audio of audios) {
                tracks.push({
                    id: audio.id,
                    name: audio.name,
                    src: audio.src,
                    color: audio.color,
                    tag: 'Musique',
                    createdAt: audio.createdAt,
                    updatedAt: audio.updatedAt,
                });
            }
        }
        store.set('tracks', (store.get('tracks') || []).concat(tracks));
    },
};

module.exports = migrations;
```
```js
// public/script/infrastructure/repository/store.js
const Store = require('electron-store').default;
const migrations = require('./migrations.js');

const store = new Store({migrations});

module.exports = store
```
- [ ] **Step 4: Run test to verify it passes**
Run: `yarn test:main public/script/infrastructure/repository/__tests__/migrations.test.js`
Expected: PASS (3 tests)
- [ ] **Step 5: Commit**
```bash
git add public/script/infrastructure/repository/migrations.js public/script/infrastructure/repository/store.js public/script/infrastructure/repository/__tests__/migrations.test.js
git commit -m "Add non-destructive 0.1.0 migration: folders/audios_* -> flat tracks tagged Musique"
```

---

### Task 6: `useTracks` hook

**Files:**
- Create: `src/component/Hook/useTracks.js`
- Test: `src/component/Hook/__tests__/useTracks.test.js`

**Interfaces:**
- Consumes: `window.electronAPI.trackFetch()` (added in Task 9; mocked with `jest.fn()` in this task's test since Task 9 hasn't run yet), DOM event `'track-onchange'`.
- Produces: `useTracks(): Array<{id, name, src, color, tag, createdAt, updatedAt}>`, relied on by Task 8 (`MusiqueScreen.js`).

- [ ] **Step 1: Write the failing test**
```js
// src/component/Hook/__tests__/useTracks.test.js
import {act, renderHook} from '@testing-library/react';
import useTracks from '../useTracks';

describe('useTracks', () => {
    beforeEach(() => {
        window.electronAPI = {trackFetch: jest.fn()};
    });

    it('starts empty and requests tracks on mount', () => {
        const {result} = renderHook(() => useTracks());

        expect(result.current).toEqual([]);
        expect(window.electronAPI.trackFetch).toHaveBeenCalledTimes(1);
    });

    it('updates when track-onchange fires', () => {
        const {result} = renderHook(() => useTracks());
        act(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: [{id: 't1'}]}));
        });

        expect(result.current).toEqual([{id: 't1'}]);
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useTracks());
        unmount();

        expect(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: [{id: 't1'}]}));
        }).not.toThrow();
    });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Hook/__tests__/useTracks.test.js`
Expected: FAIL with "Cannot find module '../useTracks'"
- [ ] **Step 3: Write minimal implementation**
```js
// src/component/Hook/useTracks.js
import { useState, useEffect } from 'react';

function useTracks() {
    const [tracks, setTracks] = useState([])

    function handleTrack(event) {
        setTracks(event.detail)
    }

    useEffect(() => {
        window.electronAPI.trackFetch()
        document.addEventListener('track-onchange', handleTrack);
        return () => {
            document.removeEventListener('track-onchange', handleTrack);
        }
    }, []);

    return tracks
}

export default useTracks;
```
- [ ] **Step 4: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Hook/__tests__/useTracks.test.js`
Expected: PASS (3 tests)
- [ ] **Step 5: Commit**
```bash
git add src/component/Hook/useTracks.js src/component/Hook/__tests__/useTracks.test.js
git commit -m "Add useTracks hook mirroring useWorkflows"
```

---

### Task 7: `RegieTrackPicker` component

**Files:**
- Create: `src/component/Track/RegieTrackPicker.js`
- Test: `src/component/Track/__tests__/RegieTrackPicker.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure presentational component, props only). Uses `react-i18next`'s `useTranslation`.
- Produces: `<RegieTrackPicker tracks={Array<{id,name,src,tag,color}>} playingIds={Array<string>} onStart={(track) => void}/>` — locked exact props for a later plan ("Régie polish") to import from this exact path. Not wired into `RegieScreen.js` by this task.

- [ ] **Step 1: Add the new translation keys**
```json
// src/i18n/translation.fr.json — new top-level "track" object (see Task 8 for the full merged file)
"track": {
    "tag": {
        "all": "Tous",
        "Musique": "Musique",
        "Bruitage": "Bruitage",
        "Disco": "Disco"
    },
    "start": "Démarrer",
    "playing": "En cours"
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Track/__tests__/RegieTrackPicker.test.js
import '../../../lib/i18n';
import {render, screen, fireEvent, within} from '@testing-library/react';
import RegieTrackPicker from '../RegieTrackPicker';

const tracks = [
    {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'},
    {id: 't2', name: 'Applaudissements', src: '/tmp/t2.mp3', tag: 'Bruitage', color: '#F76707'},
    {id: 't3', name: 'Disco Fever', src: '/tmp/t3.mp3', tag: 'Disco', color: '#AE3EC9'},
];

describe('RegieTrackPicker', () => {
    it('shows every track under "Tous" by default', () => {
        render(<RegieTrackPicker tracks={tracks} playingIds={[]} onStart={() => {}}/>);

        expect(screen.getByText('Générique')).toBeTruthy();
        expect(screen.getByText('Applaudissements')).toBeTruthy();
        expect(screen.getByText('Disco Fever')).toBeTruthy();
    });

    it('filters tracks by tag when a tag tab is clicked', () => {
        render(<RegieTrackPicker tracks={tracks} playingIds={[]} onStart={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Bruitage'}));

        expect(screen.getByText('Applaudissements')).toBeTruthy();
        expect(screen.queryByText('Générique')).toBeNull();
        expect(screen.queryByText('Disco Fever')).toBeNull();
    });

    it('calls onStart with the matching track when its start button is clicked', () => {
        const onStart = jest.fn();
        render(<RegieTrackPicker tracks={tracks} playingIds={[]} onStart={onStart}/>);
        const row = screen.getByText('Générique').closest('li');
        fireEvent.click(within(row).getByRole('button', {name: 'Démarrer'}));

        expect(onStart).toHaveBeenCalledWith(tracks[0]);
    });

    it('disables the button and shows "En cours" for a track whose id is in playingIds', () => {
        render(<RegieTrackPicker tracks={tracks} playingIds={['t1']} onStart={() => {}}/>);
        const row = screen.getByText('Générique').closest('li');

        expect(within(row).getByRole('button', {name: 'En cours'})).toBeDisabled();
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Track/__tests__/RegieTrackPicker.test.js`
Expected: FAIL with "Cannot find module '../RegieTrackPicker'"
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Track/RegieTrackPicker.js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TAGS = ['Musique', 'Bruitage', 'Disco'];

function RegieTrackPicker({ tracks, playingIds, onStart }) {
    const { t } = useTranslation();
    const [activeTag, setActiveTag] = useState('all');

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tag === activeTag);

    return (
        <div>
            <div className="btn-group" role="group" aria-label="tag-filter">
                <button
                    type="button"
                    className={`btn ${activeTag === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTag('all')}
                >{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={`btn ${activeTag === tag ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTag(tag)}
                    >{t(`track.tag.${tag}`)}</button>
                ))}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1em' }}>
                {filtered.map((track) => {
                    const playing = playingIds.includes(track.id);
                    return (
                        <li key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75em', padding: '0.5em 0' }}>
                            <span style={{ width: '1em', height: '1em', borderRadius: '50%', background: track.color, display: 'inline-block' }}/>
                            <span style={{ flex: 1 }}>{track.name}</span>
                            <span className="badge text-bg-secondary">{t(`track.tag.${track.tag}`)}</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={playing}
                                onClick={() => onStart(track)}
                            >{playing ? t('track.playing') : t('track.start')}</button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default RegieTrackPicker;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Track/__tests__/RegieTrackPicker.test.js`
Expected: PASS (4 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Track/RegieTrackPicker.js src/component/Track/__tests__/RegieTrackPicker.test.js src/i18n/translation.fr.json
git commit -m "Add standalone RegieTrackPicker for a later plan to consume"
```

---

### Task 8: `MusiqueScreen` full rewrite

**Files:**
- Modify (full rewrite): `src/component/Screen/MusiqueScreen.js`
- Modify (full rewrite): `src/component/Screen/__tests__/MusiqueScreen.test.js`
- Modify: `src/i18n/translation.fr.json`

**Interfaces:**
- Consumes: `useTracks()` (Task 6), `getFilename`/`hasSource` (existing, `src/lib/filename.js`), `window.electronAPI.trackSave(value)`/`trackRemove(id)` (added in Task 9; mocked with `jest.fn()` here since Task 9 hasn't run yet).
- Produces: `<MusiqueScreen/>` (no props) — same file path and component name as the plan-1 placeholder, so `Dashboard.js` needs zero changes.

- [ ] **Step 1: Re-read `src/component/Screen/MusiqueScreen.js` and `src/i18n/translation.fr.json` fresh, then update translations**
Per the Global Constraints, confirm the placeholder `musique.title`/`musique.placeholder` keys exist as described (from the sibling plan) before replacing them. Merge the following into `src/i18n/translation.fr.json` (`track.*` was already added in Task 7 — this step replaces `musique.placeholder` and adds the rest of `musique.*`):
```json
// src/i18n/translation.fr.json — replace the "musique" object
"musique": {
    "title": "Musique",
    "form": {
        "title": "Ajouter un morceau",
        "name": "Nom",
        "tag": "Tag",
        "src": "Fichier audio",
        "placeholder": "Rechercher dans mes fichiers",
        "submit": "Enregistrer",
        "error": {
            "name": "Le nom est obligatoire.",
            "tag": "Veuillez sélectionner un tag.",
            "src": "Un fichier audio est obligatoire."
        }
    },
    "edit": "Modifier",
    "remove": "Supprimer",
    "empty": "Aucun morceau dans cette catégorie."
}
```
- [ ] **Step 2: Write the failing test**
```js
// src/component/Screen/__tests__/MusiqueScreen.test.js
import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import MusiqueScreen from '../MusiqueScreen';

describe('MusiqueScreen', () => {
    beforeEach(() => {
        window.electronAPI = {
            trackFetch: jest.fn(),
            trackSave: jest.fn(),
            trackRemove: jest.fn(),
        };
    });

    function seedTracks(tracks) {
        act(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: tracks}));
        });
    }

    it('shows validation errors and does not save when the add form is submitted empty', () => {
        render(<MusiqueScreen/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText('Un fichier audio est obligatoire.')).toBeTruthy();
        expect(window.electronAPI.trackSave).not.toHaveBeenCalled();
    });

    it('saves a new track with the entered name, selected tag, picked file and a tag-derived color', () => {
        render(<MusiqueScreen/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique'}});
        fireEvent.change(screen.getByLabelText('Tag'), {target: {value: 'Disco'}});
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Générique',
            tag: 'Disco',
            file,
            color: '#AE3EC9',
        }));
    });

    it('filters the track list by tag when a tab is clicked', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'},
            {id: 't2', name: 'Applaudissements', src: '/tmp/t2.mp3', tag: 'Bruitage', color: '#F76707'},
        ]);

        expect(screen.getByText('Générique')).toBeTruthy();
        expect(screen.getByText('Applaudissements')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: 'Bruitage'}));

        expect(screen.queryByText('Générique')).toBeNull();
        expect(screen.getByText('Applaudissements')).toBeTruthy();
    });

    it('populates the form for editing and calls trackSave with the existing id on submit', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF', createdAt: '2024-01-01', updatedAt: '2024-01-01'},
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Modifier'}));
        expect(screen.getByLabelText('Nom').value).toBe('Générique');

        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique Remix'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 't1',
            name: 'Générique Remix',
            src: '/tmp/t1.mp3',
            color: '#4C6EFF',
        }));
    });

    it('removes a track when its delete button is clicked', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'},
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Supprimer'}));

        expect(window.electronAPI.trackRemove).toHaveBeenCalledWith('t1');
    });
});
```
- [ ] **Step 3: Run test to verify it fails**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/MusiqueScreen.test.js`
Expected: FAIL — the plan-1 placeholder renders only a title and a "Bientôt disponible..." sentence, so none of the form/list assertions above find anything (e.g. `Unable to find a label with the text of: Nom`).
- [ ] **Step 4: Write minimal implementation**
```js
// src/component/Screen/MusiqueScreen.js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
        <div style={{ padding: '1em' }}>
            <h1>{t('musique.title')}</h1>

            <form onSubmit={onSubmit} style={{ marginBottom: '1.5em' }}>
                <h2>{t('musique.form.title')}</h2>
                <div className="form-group">
                    <label htmlFor="track-name" className="form-label">{t('musique.form.name')}</label>
                    <input
                        type="text"
                        id="track-name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        value={value.name}
                        onChange={(e) => {
                            setValue({ ...value, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="track-tag" className="form-label">{t('musique.form.tag')}</label>
                    <select
                        id="track-tag"
                        className={`form-select ${errors.tag ? 'is-invalid' : ''}`}
                        value={value.tag}
                        onChange={(e) => {
                            setValue({ ...value, tag: e.target.value });
                            if (errors.tag) setErrors({ ...errors, tag: undefined });
                        }}
                    >
                        {TAGS.map((tag) => <option key={tag} value={tag}>{t(`track.tag.${tag}`)}</option>)}
                    </select>
                    {errors.tag && <div className="invalid-feedback">{errors.tag}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="track-src" className="form-label">{t('musique.form.src')}</label>
                    <div>
                        <input
                            type="file"
                            className={errors.src ? 'is-invalid' : undefined}
                            style={{ display: 'none' }}
                            id="track-src"
                            onChange={handleFile}
                        />
                        <label className="btn btn-light" htmlFor="track-src">{getFilename(value, t('musique.form.placeholder'))}</label>
                        {errors.src && <div className="invalid-feedback">{errors.src}</div>}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5em' }}>{t('musique.form.submit')}</button>
            </form>

            <div className="btn-group" role="group" aria-label="tag-filter">
                <button type="button" className={`btn ${activeTag === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTag('all')}>{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button key={tag} type="button" className={`btn ${activeTag === tag ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTag(tag)}>{t(`track.tag.${tag}`)}</button>
                ))}
            </div>

            {filtered.length === 0 && <p>{t('musique.empty')}</p>}

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1em' }}>
                {filtered.map((track) => (
                    <li key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75em', padding: '0.5em 0' }}>
                        <span style={{ width: '1em', height: '1em', borderRadius: '50%', background: track.color, display: 'inline-block' }}/>
                        <span style={{ flex: 1 }}>{track.name}</span>
                        <button type="button" className="btn btn-sm btn-warning" onClick={() => edit(track)}>{t('musique.edit')}</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(track)}>{t('musique.remove')}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MusiqueScreen;
```
- [ ] **Step 5: Run test to verify it passes**
Run: `yarn test --watchAll=false src/component/Screen/__tests__/MusiqueScreen.test.js`
Expected: PASS (5 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Screen/MusiqueScreen.js src/component/Screen/__tests__/MusiqueScreen.test.js src/i18n/translation.fr.json
git commit -m "Rewrite MusiqueScreen as a tag-based track library (add/edit/delete, tag filtering)"
```

---

### Task 9: `MainWindow.js` + `preload-main.js` track IPC wiring

**Files:**
- Modify: `public/script/window/MainWindow.js`
- Modify: `public/script/preload/preload-main.js`

**Interfaces:**
- Consumes: `listTrackUseCase`/`createTrackUseCase`/`updateTrackUseCase`/`deleteTrackUseCase` (Task 4).
- Produces: IPC channels `track-fetch`/`track-save`/`track-remove`/`track-play`/`track-end` and the renderer-facing `window.electronAPI.trackFetch/trackSave/trackRemove/trackPlay/trackEnd` + `'track-onchange'` DOM event — relied on by Task 6 (`useTracks`), Task 8 (`MusiqueScreen`) and Task 10 (`AudioController`) once wired for real (those tasks mocked `window.electronAPI` until now).

**Note:** Neither file has an automated test — `MainWindow`/`ipcMain` require a real Electron runtime, and `package.json` has no Electron-main-process test harness (confirmed while researching this plan: no `public/script/window/**/*.test.js` exist and none of `MainWindow`'s existing IPC handlers are tested this way). Verification here is code review plus the manual pass in Task 9's Step 3.

- [ ] **Step 1: Replace the folder/audio IPC wiring in `MainWindow.js` with track wiring**
Re-read `public/script/window/MainWindow.js` fresh first (per the Global Constraints) to confirm it still matches the version this plan was written against — this file is NOT touched by the sibling `nav-shell-regie-v1` plan, so it should be unchanged. Then replace:
```js
// public/script/window/MainWindow.js — full file
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const {
    listTrackUseCase,
    createTrackUseCase,
    updateTrackUseCase,
    deleteTrackUseCase,
    listWorkflowUseCase,
    deleteWorkflowUseCase,
    listStepByWorkflowUseCase,
    deleteStepUseCase,
    createSessionUseCase
} = require('../infrastructure/useCase.js');
const WorkflowWindow = require('./WorkflowWindow.js');
const StepWindow = require('./StepWindow.js')
const SessionWindow = require('./SessionWindow.js')

class MainWindow {
    constructor() {
        this.trackFetch = this.trackFetch.bind(this)
        this.trackSave = this.trackSave.bind(this)
        this.trackRemove = this.trackRemove.bind(this)
        this.trackPlay = this.trackPlay.bind(this)
        this.trackEnd = this.trackEnd.bind(this)
        this.workflowOpen = this.workflowOpen.bind(this)
        this.workflowFetch = this.workflowFetch.bind(this)
        this.workflowClose = this.workflowClose.bind(this)
        this.workflowRemove = this.workflowRemove.bind(this)
        this.stepFetch = this.stepFetch.bind(this)
        this.stepOpen = this.stepOpen.bind(this)
        this.stepRemove = this.stepRemove.bind(this)
        this.sessionPlay = this.sessionPlay.bind(this)
        this.sessionFetch = this.sessionFetch.bind(this)
        this.sessionClose = this.sessionClose.bind(this)
    }

    open() {
        // Create the browser window.
        this.window = new BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
                preload: path.join(__dirname, '../preload/preload-main.js'),
                nodeIntegration: true,
                webSecurity: false
            },
        });

        // Load the index.html from the app or from local dev server in development mode
        this.window.loadURL(
            app.isPackaged
                ? `file://${path.join(__dirname, '../../index.html')}`
                : 'http://localhost:3000'
        );

        // Emitted when the window is closed.
        this.window.on('closed', () => {
            this.window = null;
            ipcMain.removeListener('track-fetch', this.trackFetch)
            ipcMain.removeListener('track-save', this.trackSave)
            ipcMain.removeListener('track-remove', this.trackRemove)
            ipcMain.removeListener('track-play', this.trackPlay)
            ipcMain.removeListener('track-end', this.trackEnd)
            ipcMain.removeListener('workflow-open', this.workflowOpen)
            ipcMain.removeListener('workflow-fetch', this.workflowFetch)
            ipcMain.removeListener('workflow-remove', this.workflowRemove)
            ipcMain.removeListener('step-fetch', this.stepFetch)
            ipcMain.removeListener('step-open', this.stepOpen)
            ipcMain.removeListener('step-remove', this.stepRemove)
            ipcMain.removeListener('session-play', this.sessionPlay)
        });

        this.initHandle()
    }

    initHandle() {
        ipcMain.addListener('track-fetch', this.trackFetch)
        ipcMain.addListener('track-save', this.trackSave)
        ipcMain.addListener('track-remove', this.trackRemove)
        ipcMain.addListener('track-play', this.trackPlay)
        ipcMain.addListener('track-end', this.trackEnd)
        ipcMain.addListener('workflow-open', this.workflowOpen)
        ipcMain.addListener('workflow-fetch', this.workflowFetch)
        ipcMain.addListener('workflow-remove', this.workflowRemove)
        ipcMain.addListener('step-fetch', this.stepFetch)
        ipcMain.addListener('step-open', this.stepOpen)
        ipcMain.addListener('step-remove', this.stepRemove)
        ipcMain.addListener('session-play', this.sessionPlay)
    }

    workflowOpen(event, value) {
        this.workflowWindow = new WorkflowWindow({
            mainWindow: this.window,
            value,
            onClose: this.workflowClose
        })
        this.workflowWindow.start()
    }

    async workflowFetch() {
        const workflows = await listWorkflowUseCase.execute();
        this.window.webContents.send('workflow-onchange', workflows);
    }

    workflowClose() {
        this.workflowWindow = null;
    }

    async workflowRemove(event, id) {
        await deleteWorkflowUseCase.execute(id);
        this.window.webContents.send('workflow-onchange', await listWorkflowUseCase.execute());
    }

    async trackFetch() {
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackSave(event, value) {
        if (value.id) {
            await updateTrackUseCase.execute(value.id, value);
        } else {
            await createTrackUseCase.execute(value);
        }
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackRemove(event, id) {
        await deleteTrackUseCase.execute(id);
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackPlay(event, id) {
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async trackEnd(event, id) {
        this.window.webContents.send('track-onchange', await listTrackUseCase.execute());
    }

    async stepFetch(event, workflowId) {
        const steps = await listStepByWorkflowUseCase.execute(workflowId)
        this.window.webContents.send('step-onchange', steps);
    }

    stepOpen(event, {workflowId, value, afterIndex}) {
        this.stepWindow = new StepWindow({
            mainWindow: this.window,
            value,
            onClose: this.stepClose,
            afterIndex,
            workflowId
        })
        this.stepWindow.start()
    }

    async stepRemove(event, workflowId, id) {
        await deleteStepUseCase.execute(workflowId, id);
        this.window.webContents.send('step-onchange', await listStepByWorkflowUseCase.execute(workflowId));
    }

    sessionFetch() {
        if (!this.sessionWindow) return;
        this.sessionWindow.fetch();
    }

    async sessionPlay(event, workflow) {
        await this.closeSecondaryWindows()
        const session = await createSessionUseCase.execute(workflow)

        this.sessionWindow = new SessionWindow({
            mainWindow: this.window,
            onClose: this.sessionClose,
            session
        })
        await this.sessionWindow.start()
        ipcMain.addListener('session-fetch', this.sessionFetch)
    }

    async sessionClose() {
        this.sessionWindow = null;
        ipcMain.removeListener('session-fetch', this.sessionFetch)
        this.window.webContents.send('session-onchange', undefined);
    }

    setRunning(value) {
        this.running = value
        this.window.webContents.send('running-onchange', this.running);
    }

    reload() {
        if (this.window === null) {
            this.open()
        }
    }

    async closeSecondaryWindows() {

        if (this.sessionWindow) {
            this.sessionWindow.window.close()
            await new Promise(r => setTimeout(r, 1000));
        }

    }
}

module.exports = MainWindow
```
- [ ] **Step 2: Replace the folder/audio preload wiring in `preload-main.js` with track wiring (including the `webUtils` file-to-path conversion `Audio.js`'s old form relied on)**
```js
// public/script/preload/preload-main.js — full file
const {contextBridge, ipcRenderer, webUtils} = require('electron')
const events = [
    'time-onchange',
    'dubbing-onchange',
    'playlist-onchange',
    'running-onchange',
    'track-onchange',
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
    trackFetch: () => ipcRenderer.send('track-fetch'),
    trackSave: (value) => {
        if (value.file !== undefined) {
            value.src = webUtils.getPathForFile(value.file)
            delete value.file
        }
        ipcRenderer.send('track-save', value)
    },
    trackRemove: (id) => ipcRenderer.send('track-remove', id),
    trackPlay: (id) => ipcRenderer.send('track-play', id),
    trackEnd: (id) => ipcRenderer.send('track-end', id),
    workflowFetch: () => ipcRenderer.send('workflow-fetch'),
    workflowOpen: (value) => ipcRenderer.send('workflow-open', value),
    workflowRemove: (id) => ipcRenderer.send('workflow-remove', id),
    stepOpen: ({workflowId, value, afterIndex}) => ipcRenderer.send('step-open', {workflowId, value, afterIndex}),
    stepFetch: (workflowId) => ipcRenderer.send('step-fetch', workflowId),
    stepRemove: (workflowId, id) => ipcRenderer.send('step-remove', workflowId, id),
    sessionFetch: () => ipcRenderer.send('session-fetch'),
    sessionPlay: (workflow) => ipcRenderer.send('session-play', workflow),
    sessionNext: () => ipcRenderer.send('session-next'),
    sessionPrevious: () => ipcRenderer.send('session-previous'),
    sessionToStep: (index) => ipcRenderer.send('session-toStep', index),
    trackChange: (changes) => ipcRenderer.send('track-change', changes),
})
```
Note: `trackChange` (the pre-existing `'track-change'` IPC channel used by the session/step controllers for a completely different concept — playback progress inside a session) is unrelated to this plan's new `'track-*'` (music library) channels and must be left exactly as-is; the naming collision is coincidental and pre-existing in this codebase.
- [ ] **Step 3: Manual verification (no automated test possible)**
Run: `yarn start`
Wait for the Electron window to load, navigate to **Musique**, add a track (name + tag + a real local audio file), confirm it appears in the list, confirm editing and deleting it round-trip through the main process without console errors (Cmd+Option+I to open devtools). Confirm `electron-store`'s config file (find its path by running `require('electron-store').default` isn't accessible from devtools directly — instead check the app's `userData` folder, printed via `require('electron').app.getPath('userData')` if needed, or simply trust the in-app list persisting across an app restart) now has a `'tracks'` array after adding a track, and that restarting the app still shows it (persistence check).
- [ ] **Step 4: Commit**
```bash
git add public/script/window/MainWindow.js public/script/preload/preload-main.js
git commit -m "Replace folder/audio IPC with flat track-* channels in MainWindow and preload-main"
```

---

### Task 10: `AudioController.js` — switch to `trackPlay`/`trackEnd`

**Files:**
- Modify: `src/component/Controller/AudioController.js`
- Test (must still pass, mocking the new methods): `src/component/Controller/__tests__/AudioController.test.js`

**Interfaces:**
- Consumes: `window.electronAPI.trackPlay(id)`/`trackEnd(id)` (Task 9).
- Produces: no new interface — `AudioController`'s rendered output and its `audio-play`/`audio-end` DOM event contract stay identical; only the IPC calls its internal `useEffect` makes change shape (from `(folderId, id)` to `(id)`).

- [ ] **Step 1: Re-read `src/component/Controller/AudioController.js` and its test fresh**
Per the Global Constraints, confirm the file matches the sibling plan's target shape (a `useAudios()`-based component with an inner `useEffect` containing `notifyPlay`/`notifyEnd`, as quoted in this plan's prompt). If it doesn't match exactly, locate the equivalent `notifyPlay`/`notifyEnd` functions in the real file and apply the same two-line change described below.
- [ ] **Step 2: Update the existing test's expectations to the new track-based IPC calls**
```js
// src/component/Controller/__tests__/AudioController.test.js — full file
import '../../../lib/i18n';
import {render, screen, fireEvent, act} from '@testing-library/react';
import AudioController from '../AudioController';

describe('AudioController', () => {
    beforeEach(() => {
        window.electronAPI = {trackPlay: jest.fn(), trackEnd: jest.fn()};
    });

    function play(audio) {
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: audio}));
        });
    }

    it('renders nothing when no audio is playing', () => {
        render(<AudioController/>);
        expect(screen.queryByText(/./)).toBeNull();
    });

    it('shows a playing audio and notifies the main process', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        expect(screen.getByText('Track One')).toBeTruthy();
        expect(window.electronAPI.trackPlay).toHaveBeenCalledWith('a1');
    });

    it('replaces an already-playing audio sharing the same id instead of duplicating it', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});
        play({id: 'a1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'});

        expect(screen.getAllByText(/Track One/)).toHaveLength(1);
        expect(screen.getByText('Track One Remastered')).toBeTruthy();
    });

    it('stops an audio and notifies the main process when its stop button is clicked', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        fireEvent.click(screen.getByRole('button', {name: /stop/i}));

        expect(screen.queryByText('Track One')).toBeNull();
        expect(window.electronAPI.trackEnd).toHaveBeenCalledWith('a1');
    });

    it('stops an audio when an audio-end event is dispatched for it', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        act(() => {
            document.dispatchEvent(new CustomEvent('audio-end', {detail: {id: 'a1'}}));
        });

        expect(screen.queryByText('Track One')).toBeNull();
        expect(window.electronAPI.trackEnd).toHaveBeenCalledWith('a1');
    });
});
```
- [ ] **Step 3: Run the test to verify it fails against the current (folderId-based) implementation**
Run: `yarn test --watchAll=false src/component/Controller/__tests__/AudioController.test.js`
Expected: FAIL — `window.electronAPI.trackPlay` is `undefined` in the real component (it still calls `window.electronAPI.audioPlay(folderId, id)`), so the assertions on `trackPlay`/`trackEnd` never match and the component throws when it tries to call the now-missing `audioPlay`/`audioEnd`.
- [ ] **Step 4: Apply the two-line change**
```js
// src/component/Controller/AudioController.js — inside the component, replace only the useEffect body
useEffect(() => {
    function notifyPlay(event) {
        window.electronAPI.trackPlay(event.detail.id);
    }
    function notifyEnd(event) {
        window.electronAPI.trackEnd(event.detail.id);
    }
    document.addEventListener('audio-play', notifyPlay);
    document.addEventListener('audio-end', notifyEnd);
    return () => {
        document.removeEventListener('audio-play', notifyPlay);
        document.removeEventListener('audio-end', notifyEnd);
    };
}, []);
```
Everything else in the file (the `AudioControllerItem` sub-component, `useAudios()` call, `onStop`'s `audio-end` dispatch, the JSX) stays exactly as-is.
- [ ] **Step 5: Run the test to verify it passes**
Run: `yarn test --watchAll=false src/component/Controller/__tests__/AudioController.test.js`
Expected: PASS (5 tests)
- [ ] **Step 6: Commit**
```bash
git add src/component/Controller/AudioController.js src/component/Controller/__tests__/AudioController.test.js
git commit -m "Switch AudioController to flat trackPlay/trackEnd IPC calls (no more folderId)"
```

---

### Task 11: Retirement — delete the old Folder/Audio system

**Files:**
- Delete: `src/component/Folder/Folder.js`, `src/component/Folder/__tests__/Folder.test.js`
- Delete: `src/component/Audio/Audio.js`, `src/component/Audio/__tests__/Audio.test.js`
- Delete: `src/component/Dashboard/FolderDashboard.js`, `src/component/Dashboard/AudioDashboard.js`
- Modify: `src/App.js`
- Delete: `public/script/window/FolderWindow.js`, `public/script/window/AudioWindow.js`
- Delete: `public/script/preload/preload-folder.js`, `public/script/preload/preload-audio.js`
- Delete: `public/script/application/useCase/folder/` (whole directory), `public/script/application/useCase/audio/` (whole directory)
- Delete: `public/script/infrastructure/repository/FolderStoreRepository.js`, `public/script/infrastructure/repository/AudioStoreRepository.js`
- Delete: `public/script/application/port/repository/FolderRepository.js`, `public/script/application/port/repository/AudioRepository.js`
- Delete: `public/script/application/entity/Folder.js`
- Modify: `public/script/infrastructure/useCase.js`

**Interfaces:**
- Consumes: everything from Tasks 1-10 must already be green (this task only deletes now-dead code and cleans up `useCase.js`'s exports; nothing new is produced).
- Produces: nothing new.

- [ ] **Step 1: Grep for every symbol/path about to be deleted, BEFORE deleting anything**
Run each of the following and record the output in the commit body (or as a comment in the PR/task tracker) as evidence nothing live still references them:
```bash
grep -rn "FolderDashboard\|AudioDashboard" src/ --include="*.js"
grep -rn "component/Folder\|component/Audio['\"/]" src/ --include="*.js"
grep -rn "FolderWindow\|AudioWindow" public/script/ --include="*.js"
grep -rn "preload-folder\|preload-audio" public/script/ --include="*.js"
grep -rn "useCase/folder\|useCase/audio\b" public/script/ --include="*.js"
grep -rn "FolderRepository\|AudioRepository\b" public/script/ --include="*.js"
grep -rn "FolderStoreRepository\|AudioStoreRepository" public/script/ --include="*.js"
grep -rn "entity/Folder" public/script/ --include="*.js"
grep -rn "folderFetch\|folderOpen\|folderRemove\|folderSave\|audioFetch\|audioOpen\|audioRemove\|audioSave\|audioPlay\|audioEnd" src/ public/script/ --include="*.js"
```
Expected at this point (Tasks 1-10 already applied): the only hits left should be the files this task is about to delete themselves (self-references) plus possibly `AudioController.test.js`'s old file if Task 10 wasn't yet committed — confirm every remaining hit is inside a file this step is about to delete, not a live consumer. If any hit is outside the deletion list, STOP and investigate before proceeding (it means something still depends on the old system).
- [ ] **Step 2: Delete the files**
```bash
rm -rf src/component/Folder
rm -rf src/component/Audio
rm src/component/Dashboard/FolderDashboard.js
rm src/component/Dashboard/AudioDashboard.js
rm public/script/window/FolderWindow.js
rm public/script/window/AudioWindow.js
rm public/script/preload/preload-folder.js
rm public/script/preload/preload-audio.js
rm -rf public/script/application/useCase/folder
rm -rf public/script/application/useCase/audio
rm public/script/infrastructure/repository/FolderStoreRepository.js
rm public/script/infrastructure/repository/AudioStoreRepository.js
rm public/script/application/port/repository/FolderRepository.js
rm public/script/application/port/repository/AudioRepository.js
rm public/script/application/entity/Folder.js
```
- [ ] **Step 3: Remove the `mode: 'folder'`/`mode: 'audio'` cases from `App.js`**
```js
// src/App.js — full file
import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './component/Dashboard/Dashboard';
import Workflow from './component/Workflow/Workflow';
import Step from './component/Step/Step';
import Session from './component/Session/Session';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard />;
    case 'workflow':
      return <Workflow />;
    case 'step':
      return <Step />;
    case 'session':
      return <Session />;
    default:
      return 'loading...';
  }
}

export default App;
```
- [ ] **Step 4: Remove the folder/audio requires, instantiations and exports from `useCase.js`**
```js
// public/script/infrastructure/useCase.js — full file
const ListTrackUseCase = require('../application/useCase/track/ListTrackUseCase.js');
const CreateTrackUseCase = require('../application/useCase/track/CreateTrackUseCase.js');
const UpdateTrackUseCase = require('../application/useCase/track/UpdateTrackUseCase.js');
const DeleteTrackUseCase = require('../application/useCase/track/DeleteTrackUseCase.js');

const CreateWorkflowUseCase = require('../application/useCase/workflow/CreateWorkflowUseCase.js');
const UpdateWorkflowUseCase = require('../application/useCase/workflow/UpdateWorkflowUseCase.js');
const DeleteWorkflowUseCase = require('../application/useCase/workflow/DeleteWorkflowUseCase.js');
const ListWorkflowUseCase = require('../application/useCase/workflow/ListWorkflowUseCase.js');

const CreateStepUseCase = require('../application/useCase/step/CreateStepUseCase.js');
const UpdateStepUseCase = require('../application/useCase/step/UpdateStepUseCase.js');
const DeleteStepUseCase = require('../application/useCase/step/DeleteStepUseCase.js');
const ListStepByWorkflowUseCase = require('../application/useCase/step/ListStepByWorkflowUseCase.js');

const CreateSessionUseCase = require('../application/useCase/session/CreateSessionUseCase.js');

const TrackStoreRespository = require('./repository/TrackStoreRepository.js');
const WorkflowStoreRespository = require('./repository/WorkflowStoreRepository.js');
const StepStoreRespository = require('./repository/StepStoreRepository.js');

const trackStoreRespository = new TrackStoreRespository();
const workflowStoreRespository = new WorkflowStoreRespository();
const stepStoreRespository = new StepStoreRespository();

const listTrackUseCase = new ListTrackUseCase(trackStoreRespository);
const createTrackUseCase = new CreateTrackUseCase(trackStoreRespository);
const updateTrackUseCase = new UpdateTrackUseCase(trackStoreRespository);
const deleteTrackUseCase = new DeleteTrackUseCase(trackStoreRespository);

const createWorkflowUseCase = new CreateWorkflowUseCase(workflowStoreRespository);
const updateWorkflowUseCase = new UpdateWorkflowUseCase(workflowStoreRespository);
const deleteWorkflowUseCase = new DeleteWorkflowUseCase(workflowStoreRespository);
const listWorkflowUseCase = new ListWorkflowUseCase(workflowStoreRespository);

const createStepUseCase = new CreateStepUseCase(stepStoreRespository);
const updateStepUseCase = new UpdateStepUseCase(stepStoreRespository);
const deleteStepUseCase = new DeleteStepUseCase(stepStoreRespository);
const listStepByWorkflowUseCase = new ListStepByWorkflowUseCase(stepStoreRespository);

const createSessionUseCase = new CreateSessionUseCase(stepStoreRespository);


module.exports = {
    listTrackUseCase,
    createTrackUseCase,
    updateTrackUseCase,
    deleteTrackUseCase,

    createWorkflowUseCase,
    updateWorkflowUseCase,
    deleteWorkflowUseCase,
    listWorkflowUseCase,

    createStepUseCase,
    updateStepUseCase,
    deleteStepUseCase,
    listStepByWorkflowUseCase,

    createSessionUseCase
}
```
- [ ] **Step 5: Run both full test suites to confirm nothing regressed**
Run: `yarn test --watchAll=false`
Expected: PASS (every remaining `src/` suite — `Folder.test.js`/`Audio.test.js` no longer exist to run)
Run: `yarn test:main`
Expected: PASS (every `public/script/` suite from Tasks 1, 2, 3, 5 — the deleted folder/audio use cases never had tests under this runner to begin with)
- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "Retire the old Folder/Audio system now that the tag-based track library is in place"
```
