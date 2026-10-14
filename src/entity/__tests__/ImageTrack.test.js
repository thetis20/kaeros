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

    it('defaults scale to 100', () => {
        const track = new ImageTrack({type: 'image', name: 'Slide 1', src: '/tmp/slide.png'});
        expect(track.scale).toBe(100);
    });

    it('preserves a given scale, including 0', () => {
        expect(new ImageTrack({type: 'image', src: 'a.png', scale: 40}).scale).toBe(40);
        expect(new ImageTrack({type: 'image', src: 'a.png', scale: 0}).scale).toBe(0);
    });
});
