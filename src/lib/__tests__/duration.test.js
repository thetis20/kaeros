import {extractDurationMs, formatRoundedDuration} from '../duration';

describe('formatRoundedDuration', () => {
    it.each([
        [165000, '2min45'],
        [90000, '1min30'],
        [180000, '3min'],
        [172000, '2min45'],
        [173000, '3min'],
        [45000, '45s'],
        [3000, '15s'],
        [60000, '1min'],
        [67000, '1min'],
        [68000, '1min15'],
    ])('%i ms -> %s', (ms, expected) => {
        expect(formatRoundedDuration(ms)).toBe(expected);
    });

    it('returns null for an unusable duration', () => {
        expect(formatRoundedDuration(0)).toBeNull();
        expect(formatRoundedDuration(NaN)).toBeNull();
        expect(formatRoundedDuration(-1)).toBeNull();
    });
});

describe('extractDurationMs', () => {
    it('uses the whole media when no offsets are set', () => {
        expect(extractDurationMs({}, 120000)).toBe(120000);
    });

    it('subtracts the start offset and stops at the end offset', () => {
        expect(extractDurationMs({startOffsetMs: '10000', endOffsetMs: '70000'}, 120000)).toBe(60000);
    });

    it('treats an empty end offset as the end of the media', () => {
        expect(extractDurationMs({startOffsetMs: 20000, endOffsetMs: ''}, 120000)).toBe(100000);
    });

    it('caps the end offset at the media duration', () => {
        expect(extractDurationMs({endOffsetMs: 500000}, 120000)).toBe(120000);
    });

    it('returns null when the media duration is unknown or the window is empty', () => {
        expect(extractDurationMs({}, null)).toBeNull();
        expect(extractDurationMs({startOffsetMs: 130000}, 120000)).toBeNull();
    });
});
