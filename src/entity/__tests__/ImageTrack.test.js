import ImageTrack from '../ImageTrack';

describe('ImageTrack', () => {
    it('stores the image source and inherits Track defaults', () => {
        const track = new ImageTrack({type: 'image', name: 'Slide 1', src: '/tmp/slide.png'});
        expect(track.src).toBe('/tmp/slide.png');
        expect(track.canPlay()).toBe(false);
        expect(track.canPause()).toBe(false);
        expect(track.canPlus()).toBe(false);
        expect(track.canMinus()).toBe(false);
    });
});
