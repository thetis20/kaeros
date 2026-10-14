import {render, screen} from '@testing-library/react';
import ImageTrack from '../ImageTrack';

describe('Session ImageTrack', () => {
    it('sets the background image on the container', () => {
        const {container} = render(<ImageTrack track={{name: 'Slide', src: '/tmp/slide.png'}}/>);
        const root = container.firstChild;
        expect(root.style.backgroundImage).toContain('image/presentation-dubbing.png');
        expect(root.style.backgroundSize).toBe('cover');
        expect(root.style.backgroundPosition).toBe('center');
        expect(root.style.backgroundRepeat).toBe('no-repeat');
    });

    it('sizes the image at 100% by default', () => {
        render(<ImageTrack track={{name: 'Slide', src: '/tmp/slide.png'}}/>);
        const img = screen.getByAltText('Slide');
        expect(img.style.width).toBe('100%');
        expect(img.style.height).toBe('100%');
        expect(img.style.objectFit).toBe('contain');
    });

    it('sizes the image according to scale', () => {
        render(<ImageTrack track={{name: 'Slide', src: '/tmp/slide.png', scale: 60}}/>);
        const img = screen.getByAltText('Slide');
        expect(img.style.width).toBe('60%');
        expect(img.style.height).toBe('60%');
    });
});
