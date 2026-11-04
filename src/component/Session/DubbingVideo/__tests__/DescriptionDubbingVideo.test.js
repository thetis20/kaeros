import {render, screen} from '@testing-library/react';
import DescriptionDubbingVideo from '../DescriptionDubbingVideo';

describe('DescriptionDubbingVideo', () => {
    it('renders the index, the time and the description', () => {
        render(<DescriptionDubbingVideo track={{time: '01:30', description: 'Intro'}} index={3}/>);
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('01:30')).toBeInTheDocument();
        expect(screen.getByText('Intro')).toBeInTheDocument();
    });

    it('pins a smaller index to the bottom-right corner of the box', () => {
        render(<DescriptionDubbingVideo track={{time: '01:30'}} index={1}/>);
        const indexEl = screen.getByText('1');
        expect(indexEl.style.position).toBe('absolute');
        expect(indexEl.style.right).toBe('20px');
        expect(indexEl.style.bottom).toBe('10px');
        expect(indexEl.style.fontSize).toBe('0.5em');
    });
});
