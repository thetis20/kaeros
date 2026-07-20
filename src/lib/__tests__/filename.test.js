import {getFilename, hasSource} from '../filename';

describe('getFilename', () => {
    it('prefers the File object name when present', () => {
        expect(getFilename({file: {name: 'clip.mp4'}, src: '/tmp/other.mp4'}, 'placeholder')).toBe('clip.mp4');
    });

    it('extracts the trailing filename from a src path', () => {
        expect(getFilename({src: '/some/dir/video.mp4'}, 'placeholder')).toBe('video.mp4');
    });

    it('falls back to the full src when it has no path separator', () => {
        expect(getFilename({src: 'video.mp4'}, 'placeholder')).toBe('video.mp4');
    });

    it('returns the placeholder when neither file nor src is set', () => {
        expect(getFilename({}, 'placeholder')).toBe('placeholder');
    });
});

describe('hasSource', () => {
    it('is true when a file is present', () => {
        expect(hasSource({file: {name: 'clip.mp4'}})).toBe(true);
    });

    it('is true when a src is present', () => {
        expect(hasSource({src: '/tmp/clip.mp4'})).toBe(true);
    });

    it('is false when neither is present', () => {
        expect(hasSource({})).toBe(false);
    });
});
