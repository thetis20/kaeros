# Media Title Auto-fill Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the media title auto-fill feature (name pre-filled from the picked file's filename) to `ImageStep.js`, and fix a gap where a step's non-empty default name (e.g. "Nouvelle image") silently blocks auto-fill on `DubbingVideoStep` in real usage.

**Architecture:** Extract the existing inline auto-fill logic (currently duplicated between `MusiqueScreen.js` and `DubbingVideoStep.js`) into one pure helper, `resolveAutoFillName(currentName, defaultName, fileName)`, in `src/lib/filename.js` alongside `stripExtension`/`hasSource`/`getFilename`. The helper treats the name as "still blank" when it's empty/whitespace-only OR when it still equals the step's translated default name. All three file-picking components (`MusiqueScreen`, `DubbingVideoStep`, `ImageStep`) call this single helper from their `handleFile`.

**Tech Stack:** React 19, Jest + React Testing Library, react-i18next.

## Global Constraints

- Pure function, no I/O, no exceptions expected from `resolveAutoFillName` (per spec).
- `defaultName` is optional: when omitted/falsy, only the empty/whitespace check applies (this is what keeps `MusiqueScreen`'s behavior byte-for-byte identical — it has no step-default-name concept).
- No new fields on the `step`/`track` object shape, no changes to `SessionCreationScreen.js`'s own name input (per spec's "Hors périmètre").
- `TimeStep`/`BattleRoyalStep` are out of scope (no file picker).
- Every step ends with the full test suite for the touched file(s) passing before moving to the next task.

---

### Task 1: `resolveAutoFillName` helper in `src/lib/filename.js`

**Files:**
- Modify: `src/lib/filename.js` (add export, after `stripExtension`, before `hasSource`)
- Test: `src/lib/__tests__/filename.test.js` (add new `describe` block, after the existing `stripExtension` block, before `hasSource`)

**Interfaces:**
- Produces: `resolveAutoFillName(currentName: string|undefined, defaultName: string|undefined, fileName: string): string` — pure function. Returns `stripExtension(fileName)` when `currentName` is empty/whitespace-only OR strictly equal to a truthy `defaultName`; otherwise returns `currentName` unchanged.

- [ ] **Step 1: Write the failing tests**

Add this block to `src/lib/__tests__/filename.test.js`, right after the `describe('stripExtension', ...)` block (around line 33, before `describe('hasSource', ...)`):

```js
describe('resolveAutoFillName', () => {
    it('returns the stripped file name when currentName is empty', () => {
        expect(resolveAutoFillName('', undefined, 'clip.mp4')).toBe('clip');
    });

    it('returns the stripped file name when currentName is whitespace-only', () => {
        expect(resolveAutoFillName('   ', undefined, 'clip.mp4')).toBe('clip');
    });

    it('returns the stripped file name when currentName equals the provided defaultName', () => {
        expect(resolveAutoFillName('Nouvelle image', 'Nouvelle image', 'clip.mp4')).toBe('clip');
    });

    it('keeps currentName unchanged when it differs from defaultName and is non-empty', () => {
        expect(resolveAutoFillName('Mon titre', 'Nouvelle image', 'clip.mp4')).toBe('Mon titre');
    });

    it('keeps currentName unchanged when defaultName is not provided and currentName is non-empty', () => {
        expect(resolveAutoFillName('Mon titre', undefined, 'clip.mp4')).toBe('Mon titre');
    });
});
```

Also update the import line at the top of the file (line 1) to include the new function:

```js
import {getFilename, hasSource, stripExtension, resolveAutoFillName} from '../filename';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/lib/__tests__/filename.test.js --watchAll=false`
Expected: FAIL — `resolveAutoFillName is not a function` (or `undefined`) for the 5 new tests. The pre-existing `getFilename`/`stripExtension`/`hasSource` tests still pass.

- [ ] **Step 3: Implement the helper**

In `src/lib/filename.js`, add this export right after `stripExtension` (after line 15) and before `hasSource`:

```js
export function resolveAutoFillName(currentName, defaultName, fileName) {
    const isEmpty = !currentName || !currentName.trim();
    const isUntouchedDefault = !!defaultName && currentName === defaultName;
    return (isEmpty || isUntouchedDefault) ? stripExtension(fileName) : currentName;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/lib/__tests__/filename.test.js --watchAll=false`
Expected: PASS — all tests in the file, including the 5 new ones.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filename.js src/lib/__tests__/filename.test.js
git commit -m "feat: add resolveAutoFillName helper for step/track name auto-fill"
```

---

### Task 2: Switch `MusiqueScreen.js` to the shared helper (no behavior change)

**Files:**
- Modify: `src/component/Screen/MusiqueScreen.js:7` (import), `:25-30` (`handleFile`)
- Test: `src/component/Screen/__tests__/MusiqueScreen.test.js` (existing file, no new tests needed — this task is a pure refactor verified by the existing "fills the empty name field..." and "does not overwrite..." tests)

**Interfaces:**
- Consumes: `resolveAutoFillName(currentName, defaultName, fileName)` from Task 1 (`../../lib/filename`).

- [ ] **Step 1: Confirm the existing regression tests already cover this**

`src/component/Screen/__tests__/MusiqueScreen.test.js` already has:
- `'fills the empty name field with the picked file name (without extension)'`
- `'does not overwrite an already-entered name when a file is picked'`

No new test needed for this task — these two are the regression guard. Run them once now to confirm current baseline (pre-refactor) is green:

Run: `CI=true npx react-scripts test src/component/Screen/__tests__/MusiqueScreen.test.js --watchAll=false`
Expected: PASS (all existing tests, including the two above).

- [ ] **Step 2: Refactor `handleFile` to use the helper**

In `src/component/Screen/MusiqueScreen.js`, update the import on line 7 (drop `stripExtension`, it has no other caller in this file, add `resolveAutoFillName`):

```js
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';
```

Replace `handleFile` (lines 25-30):

```js
    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const name = resolveAutoFillName(value.name, undefined, file.name);
        setValue({ ...value, file, name });
        if (errors.src) setErrors({ ...errors, src: undefined });
    }
```

- [ ] **Step 3: Run tests to verify no regression**

Run: `CI=true npx react-scripts test src/component/Screen/__tests__/MusiqueScreen.test.js --watchAll=false`
Expected: PASS — identical results to Step 1, confirming the refactor is behavior-preserving.

- [ ] **Step 4: Commit**

```bash
git add src/component/Screen/MusiqueScreen.js
git commit -m "refactor: MusiqueScreen uses shared resolveAutoFillName helper"
```

---

### Task 3: Fix `DubbingVideoStep.js` default-name gap

**Files:**
- Modify: `src/component/Step/DubbingVideoStep.js:4` (import), `:16-26` (`handleFile`)
- Test: `src/component/Step/__tests__/DubbingVideoStep.test.js` (add one new test after the existing "does not overwrite..." test, around line 60)

**Interfaces:**
- Consumes: `resolveAutoFillName(currentName, defaultName, fileName)` from Task 1 (`../../lib/filename`).
- Consumes: `value.type` (already present on every step object, set by `newStep()` in `SessionCreationScreen.js`) and `t('sessionCreation.newStepName.<type>')` (existing i18n keys: `image` → "Nouvelle image", `dubbing-video` → "Nouveau doublage", `time` → "Nouveau time", `battle-royal` → "Nouveau battle royal").

- [ ] **Step 1: Write the failing test for the default-name gap**

Add this test to `src/component/Step/__tests__/DubbingVideoStep.test.js`, right after the `'does not overwrite an already-set step name when a file is picked'` test (after line 60, before the `'editing the time field...'` test):

```js
    it('fills the step name when it still equals the type default name (untouched since creation)', () => {
        const {setValue} = renderStep({type: 'dubbing-video', name: 'Nouveau doublage'});
        const file = new File(['vid'], 'Sketch final.mp4', {type: 'video/mp4'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/component/Step/__tests__/DubbingVideoStep.test.js --watchAll=false`
Expected: FAIL on the new test — `setValue` is called with `name: 'Nouveau doublage'` (unchanged) instead of `'Sketch final'`, because the current guard only checks for empty/blank.

- [ ] **Step 3: Implement the fix**

In `src/component/Step/DubbingVideoStep.js`, update the import on line 4 (drop `stripExtension`, it has no other caller in this file, add `resolveAutoFillName`):

```js
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';
```

Replace `handleFile` (lines 16-26):

```js
    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const defaultName = t(`sessionCreation.newStepName.${value.type}`);
        const name = resolveAutoFillName(value.name, defaultName, file.name);
        setValue({
            ...value,
            file,
            name
        })
        if (errors.file) setErrors({...errors, file: undefined})
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/component/Step/__tests__/DubbingVideoStep.test.js --watchAll=false`
Expected: PASS — the new test plus all pre-existing tests in the file (including "fills the empty step name..." and "does not overwrite...", which must still pass unchanged since `renderStep()` without an explicit `type` leaves `value.type` `undefined`, `t('sessionCreation.newStepName.undefined')` returns the raw key as a non-matching fallback string, so `isUntouchedDefault` stays `false` and behavior for those two pre-existing tests is unaffected).

- [ ] **Step 5: Commit**

```bash
git add src/component/Step/DubbingVideoStep.js src/component/Step/__tests__/DubbingVideoStep.test.js
git commit -m "fix: DubbingVideoStep auto-fill now triggers even when name still holds its type default"
```

---

### Task 4: Add auto-fill to `ImageStep.js`

**Files:**
- Modify: `src/component/Step/ImageStep.js:4` (import), `:15-21` (add `handleFile` logic — currently a no-op passthrough with no name auto-fill)
- Test: Create `src/component/Step/__tests__/ImageStep.test.js` (new file — does not exist today)

**Interfaces:**
- Consumes: `resolveAutoFillName(currentName, defaultName, fileName)` from Task 1 (`../../lib/filename`).
- Consumes: `value.type`, `t('sessionCreation.newStepName.image')` — same pattern as Task 3.

- [ ] **Step 1: Write the failing tests in a new test file**

Create `src/component/Step/__tests__/ImageStep.test.js`:

```js
import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import ImageStep, {validate} from '../ImageStep';

describe('ImageStep validate()', () => {
    it('requires a source file', () => {
        const errors = validate({}, (key) => key);
        expect(errors.file).toBe('step.form.error.file');
    });

    it('passes once a source is set', () => {
        const errors = validate({file: {name: 'photo.png'}}, (key) => key);
        expect(errors).toEqual({});
    });
});

describe('ImageStep component', () => {
    function renderStep(overrides = {}) {
        const value = {id: 'step-1', ...overrides};
        const setValue = jest.fn();
        const setErrors = jest.fn();
        render(<ImageStep value={value} setValue={setValue} errors={overrides.errors || {}} setErrors={setErrors}/>);
        return {value, setValue, setErrors};
    }

    it('shows the placeholder label when no file is set', () => {
        renderStep();
        expect(screen.getByText('Rechercher dans mes fichiers')).toBeTruthy();
    });

    it('picking a file updates the value and clears the file error', () => {
        const {setValue, setErrors} = renderStep({errors: {file: 'missing'}});
        const file = new File(['img'], 'photo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({file}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({file: undefined}));
    });

    it('fills the empty step name with the picked file name (without extension) when a file is picked', () => {
        const {setValue} = renderStep({name: ''});
        const file = new File(['img'], 'Sketch final.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });

    it('does not overwrite an already-set step name when a file is picked', () => {
        const {setValue} = renderStep({name: 'Mon étape'});
        const file = new File(['img'], 'photo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Mon étape'}));
    });

    it('fills the step name when it still equals the type default name (untouched since creation)', () => {
        const {setValue} = renderStep({type: 'image', name: 'Nouvelle image'});
        const file = new File(['img'], 'Sketch final.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });
});
```

Note: `getByLabelText('Image')` resolves via `t('step.form.src.label')` — verify this translation key resolves to `"Image"` (same label already used and asserted in `DubbingVideoStep.test.js` line 40, since both components share `t('step.form.src.label')`).

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `CI=true npx react-scripts test src/component/Step/__tests__/ImageStep.test.js --watchAll=false`
Expected: FAIL on `'fills the empty step name...'` and `'fills the step name when it still equals the type default name...'` — `setValue` is currently called with only `{file}`, no `name` key at all. The other tests (`validate()`, placeholder, picking-a-file, does-not-overwrite) should already PASS since they match today's existing behavior.

- [ ] **Step 3: Implement `handleFile` with auto-fill**

In `src/component/Step/ImageStep.js`, update the import on line 4:

```js
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';
```

Replace `handleFile` (lines 15-21):

```js
    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const defaultName = t(`sessionCreation.newStepName.${value.type}`);
        const name = resolveAutoFillName(value.name, defaultName, file.name);
        setValue({
            ...value,
            file,
            name
        })
        if (errors.file) setErrors({...errors, file: undefined})
    }
```

`t` is already destructured from `useTranslation()` earlier in the component (line 13) — no new import needed for translation.

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/component/Step/__tests__/ImageStep.test.js --watchAll=false`
Expected: PASS — all 7 tests in the new file.

- [ ] **Step 5: Commit**

```bash
git add src/component/Step/ImageStep.js src/component/Step/__tests__/ImageStep.test.js
git commit -m "feat: add media title auto-fill to ImageStep"
```

---

### Task 5: Full regression pass

**Files:** none (verification-only task)

- [ ] **Step 1: Run the full frontend test suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS — every suite, including `MusiqueScreen.test.js`, `DubbingVideoStep.test.js`, `ImageStep.test.js`, `filename.test.js`, and all unrelated suites (no regression from the refactor touching shared `filename.js`).

- [ ] **Step 2: Build the frontend to catch any stray import/lint error**

Run: `CI=false npx react-scripts build`
Expected: `Compiled successfully.`

- [ ] **Step 3: No commit needed for this task** — it's a verification checkpoint. If anything fails, fix it inside the task that introduced the regression and re-run this task from Step 1.
