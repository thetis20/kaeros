import { toWindow, isPastEnd, windowedProgress, previewWindow, fadeWindow, fadeOpacity, fadeInWindow, fadeInOpacity } from '../mediaWindow';

describe('toWindow', () => {
    it('converts start and end offsets from milliseconds to seconds', () => {
        expect(toWindow({ startOffsetMs: 250, endOffsetMs: 4000 })).toEqual({ startSec: 0.25, endSec: 4 });
    });

    it('defaults startSec to 0 when startOffsetMs is missing', () => {
        expect(toWindow({})).toEqual({ startSec: 0, endSec: null });
    });

    it('returns a null endSec when endOffsetMs is undefined', () => {
        expect(toWindow({ startOffsetMs: 100 })).toEqual({ startSec: 0.1, endSec: null });
    });

    it('returns a null endSec when endOffsetMs is explicitly null', () => {
        expect(toWindow({ startOffsetMs: 100, endOffsetMs: null })).toEqual({ startSec: 0.1, endSec: null });
    });

    it('returns a null endSec when endOffsetMs is an empty string', () => {
        expect(toWindow({ startOffsetMs: 100, endOffsetMs: '' })).toEqual({ startSec: 0.1, endSec: null });
    });

    it('absorbs string values coming from form inputs', () => {
        expect(toWindow({ startOffsetMs: '250', endOffsetMs: '4000' })).toEqual({ startSec: 0.25, endSec: 4 });
    });

    it('absorbs NaN-producing values as 0', () => {
        expect(toWindow({ startOffsetMs: 'abc', endOffsetMs: 'def' })).toEqual({ startSec: 0, endSec: 0 });
    });
});

describe('isPastEnd', () => {
    it('is false when there is no end boundary', () => {
        expect(isPastEnd(1000, null)).toBe(false);
    });

    it('is true once currentTime reaches the end boundary', () => {
        expect(isPastEnd(4, 4)).toBe(true);
        expect(isPastEnd(4.5, 4)).toBe(true);
    });

    it('is false before the end boundary', () => {
        expect(isPastEnd(3.9, 4)).toBe(false);
    });
});

describe('windowedProgress', () => {
    it('rebases currentTime and duration onto the window', () => {
        expect(windowedProgress(5, 20, 2, 10)).toEqual({ currentTime: 3, duration: 8 });
    });

    it('falls back to the media duration when there is no end boundary', () => {
        expect(windowedProgress(5, 20, 2, null)).toEqual({ currentTime: 3, duration: 18 });
    });

    it('clamps currentTime to 0 before the window start', () => {
        expect(windowedProgress(1, 20, 2, null)).toEqual({ currentTime: 0, duration: 18 });
    });

    it('returns a 0 duration when metadata has not loaded yet (NaN duration, no end boundary)', () => {
        expect(windowedProgress(0, NaN, 2, null)).toEqual({ currentTime: 0, duration: 0 });
    });

    it('still computes a duration from the end boundary when duration is NaN', () => {
        expect(windowedProgress(3, NaN, 2, 10)).toEqual({ currentTime: 1, duration: 8 });
    });
});

describe('previewWindow', () => {
    it('anchors on the start: plays 5s from the configured start when duration is unknown', () => {
        expect(previewWindow({ startOffsetMs: 2000 }, 'start', undefined)).toEqual({ startSec: 2, endSec: 7 });
    });

    it('anchors on the start: clamps the 5s preview to the media duration', () => {
        expect(previewWindow({ startOffsetMs: 8000 }, 'start', 10)).toEqual({ startSec: 8, endSec: 10 });
    });

    it('anchors on the end: uses the configured end boundary', () => {
        expect(previewWindow({ startOffsetMs: 1000, endOffsetMs: 20000 }, 'end', 999)).toEqual({ startSec: 15, endSec: 20 });
    });

    it('anchors on the end: falls back to the media duration when no end boundary is configured', () => {
        expect(previewWindow({ startOffsetMs: 1000 }, 'end', 30)).toEqual({ startSec: 25, endSec: 30 });
    });

    it('anchors on the end: never moves the lower bound before the configured start on a clip shorter than 5s', () => {
        expect(previewWindow({ startOffsetMs: 1000, endOffsetMs: 3000 }, 'end', 999)).toEqual({ startSec: 1, endSec: 3 });
    });

    it('anchors on the end: falls back to toWindow when duration is unusable and there is no end boundary', () => {
        expect(previewWindow({ startOffsetMs: 1000 }, 'end', NaN)).toEqual({ startSec: 1, endSec: null });
    });
});

describe('fadeWindow', () => {
    it('returns null when fadeOutMs is 0', () => {
        expect(fadeWindow(0, 40, 60, 0)).toBeNull();
    });

    it('returns null when fadeOutMs is undefined', () => {
        expect(fadeWindow(0, 40, 60, undefined)).toBeNull();
    });

    it('returns null when fadeOutMs is negative', () => {
        expect(fadeWindow(0, 40, 60, -500)).toBeNull();
    });

    it('returns null when endSec is null and duration is NaN', () => {
        expect(fadeWindow(0, null, NaN, 1000)).toBeNull();
    });

    it('falls back to duration when endSec is null', () => {
        expect(fadeWindow(0, null, 60, 1000)).toEqual({ fromSec: 59, toSec: 60 });
    });

    it('computes the fade window in the normal case', () => {
        expect(fadeWindow(0, 40, 60, 1000)).toEqual({ fromSec: 39, toSec: 40 });
    });

    it('clamps fromSec to startSec when the fade is longer than the extract', () => {
        expect(fadeWindow(10, 12, 60, 5000)).toEqual({ fromSec: 10, toSec: 12 });
    });

    it('returns null when the clamp would make fromSec >= toSec', () => {
        expect(fadeWindow(12, 12, 60, 5000)).toBeNull();
    });
});

describe('fadeOpacity', () => {
    it('is 0 when fade is null', () => {
        expect(fadeOpacity(39.5, null)).toBe(0);
    });

    it('is 0 before fromSec', () => {
        expect(fadeOpacity(38, { fromSec: 39, toSec: 40 })).toBe(0);
    });

    it('is 1 at toSec', () => {
        expect(fadeOpacity(40, { fromSec: 39, toSec: 40 })).toBe(1);
    });

    it('is 1 after toSec', () => {
        expect(fadeOpacity(41, { fromSec: 39, toSec: 40 })).toBe(1);
    });

    it('is 0.5 mid-window', () => {
        expect(fadeOpacity(39.5, { fromSec: 39, toSec: 40 })).toBe(0.5);
    });
});

describe('fadeInWindow', () => {
    it('returns null when fadeInMs is 0', () => {
        expect(fadeInWindow(0, 40, 60, 0)).toBeNull();
    });

    it('returns null when fadeInMs is undefined', () => {
        expect(fadeInWindow(0, 40, 60, undefined)).toBeNull();
    });

    it('returns null when fadeInMs is null', () => {
        expect(fadeInWindow(0, 40, 60, null)).toBeNull();
    });

    it('returns null when fadeInMs is an empty string', () => {
        expect(fadeInWindow(0, 40, 60, '')).toBeNull();
    });

    it('builds the window from startSec even when duration is unknown (NaN, no endSec)', () => {
        expect(fadeInWindow(0, null, NaN, 1000)).toEqual({ fromSec: 0, toSec: 1 });
    });

    it('starts from a non-zero startSec', () => {
        expect(fadeInWindow(10, null, NaN, 1000)).toEqual({ fromSec: 10, toSec: 11 });
    });

    it('clamps toSec to endSec when the fade would exceed it', () => {
        expect(fadeInWindow(10, 10.5, 60, 1000)).toEqual({ fromSec: 10, toSec: 10.5 });
    });

    it('clamps toSec to duration when endSec is null', () => {
        expect(fadeInWindow(59.5, null, 60, 1000)).toEqual({ fromSec: 59.5, toSec: 60 });
    });

    it('returns null when the bound is at or before startSec', () => {
        expect(fadeInWindow(12, 12, 60, 1000)).toBeNull();
    });
});

describe('fadeInOpacity', () => {
    it('is 1 before the window and at its start', () => {
        expect(fadeInOpacity(9, { fromSec: 10, toSec: 11 })).toBe(1);
        expect(fadeInOpacity(10, { fromSec: 10, toSec: 11 })).toBe(1);
    });

    it('is 0.5 mid-window', () => {
        expect(fadeInOpacity(10.5, { fromSec: 10, toSec: 11 })).toBe(0.5);
    });

    it('is 0 at the end and after', () => {
        expect(fadeInOpacity(11, { fromSec: 10, toSec: 11 })).toBe(0);
        expect(fadeInOpacity(12, { fromSec: 10, toSec: 11 })).toBe(0);
    });

    it('is 0 when fade is null', () => {
        expect(fadeInOpacity(10, null)).toBe(0);
    });
});
