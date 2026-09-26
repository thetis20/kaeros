import {toFileUrl} from '../mediaUrl';

describe('toFileUrl', () => {
    it('encodes a space in the path', () => {
        expect(toFileUrl('/tmp/my file.mp4')).toBe('file:///tmp/my%20file.mp4');
    });

    it('encodes an accented character in the path', () => {
        expect(toFileUrl('/tmp/vidéo.mp4')).toBe('file:///tmp/vid%C3%A9o.mp4');
    });

    it('encodes a # in the path', () => {
        expect(toFileUrl('/tmp/track#1.mp3')).toBe('file:///tmp/track%231.mp3');
    });

    it('encodes a ? in the path', () => {
        expect(toFileUrl('/tmp/what?.mp3')).toBe('file:///tmp/what%3F.mp3');
    });

    it('leaves a simple path untouched aside from the file:// prefix', () => {
        expect(toFileUrl('/tmp/video.mp4')).toBe('file:///tmp/video.mp4');
    });
});