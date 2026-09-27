import React from 'react';
import { render, screen } from '@testing-library/react';
import BlackFadeOverlay from '../BlackFadeOverlay';

describe('BlackFadeOverlay', () => {
    it('renders with the given opacity', () => {
        render(<BlackFadeOverlay opacity={0.5} />);
        expect(screen.getByTestId('black-fade-overlay')).toHaveStyle({ opacity: 0.5 });
    });

    it('is aria-hidden', () => {
        render(<BlackFadeOverlay opacity={1} />);
        expect(screen.getByTestId('black-fade-overlay')).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not capture pointer events', () => {
        render(<BlackFadeOverlay opacity={0} />);
        expect(screen.getByTestId('black-fade-overlay')).toHaveStyle({ pointerEvents: 'none' });
    });
});
