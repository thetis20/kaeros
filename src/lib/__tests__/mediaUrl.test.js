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

    it('converts a Windows drive path', () => {
        expect(toFileUrl('C:\\Users\\me\\Images\\photo.png')).toBe('file:///C:/Users/me/Images/photo.png');
    });

    it('encodes special characters in a Windows path', () => {
        expect(toFileUrl('D:\\Mes vidéos\\clip#1.mp4')).toBe('file:///D:/Mes%20vid%C3%A9os/clip%231.mp4');
    });

    it('converts a Windows path with forward slashes', () => {
        expect(toFileUrl('C:/Users/me/photo.png')).toBe('file:///C:/Users/me/photo.png');
    });

    it('converts a Windows UNC path', () => {
        expect(toFileUrl('\\\\server\\share\\photo.png')).toBe('file://server/share/photo.png');
    });
});
