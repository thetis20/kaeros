import { toWindow, isPastEnd, windowedProgress } from '../mediaWindow';

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
