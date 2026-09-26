import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import OffsetDialog from '../OffsetDialog';
import {previewWindow} from '../../../lib/mediaWindow';

const mockPlay = jest.fn();
jest.mock('../../Hook/useMediaPreview', () => () => ({mediaRef: {current: null}, play: mockPlay}));

describe('OffsetDialog', () => {
    beforeEach(() => {
        mockPlay.mockClear();
    });

    it('renders the startOffsetMs field on the start anchor', () => {
        render(<OffsetDialog anchor="start" value={{startOffsetMs: '100'}} onChange={() => {}} onClose={() => {}}/>);
        const input = document.querySelector('input[name="startOffsetMs"]');
        expect(input).toBeTruthy();
        expect(input.value).toBe('100');
        expect(document.querySelector('input[name="endOffsetMs"]')).toBeNull();
    });

    it('renders the endOffsetMs field on the end anchor', () => {
        render(<OffsetDialog anchor="end" value={{endOffsetMs: '500'}} onChange={() => {}} onClose={() => {}}/>);
        const input = document.querySelector('input[name="endOffsetMs"]');
        expect(input).toBeTruthy();
        expect(input.value).toBe('500');
        expect(document.querySelector('input[name="startOffsetMs"]')).toBeNull();
    });

    it('calls onChange when the field is edited', () => {
        const onChange = jest.fn();
        render(<OffsetDialog anchor="start" value={{startOffsetMs: ''}} onChange={onChange} onClose={() => {}}/>);
        const input = document.querySelector('input[name="startOffsetMs"]');
        fireEvent.change(input, {target: {value: '250'}});
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls play() with a resolver producing start -> start+5s on the start anchor', () => {
        const value = {startOffsetMs: '2000'};
        render(<OffsetDialog anchor="start" value={value} onChange={() => {}} onClose={() => {}}/>);
        fireEvent.click(screen.getByText('Tester'));

        expect(mockPlay).toHaveBeenCalledWith(value, expect.any(Function));
        const resolveWindow = mockPlay.mock.calls[0][1];

        expect(resolveWindow(10)).toEqual(previewWindow(value, 'start', 10));
        expect(resolveWindow(10)).toEqual({startSec: 2, endSec: 7});
    });

    it('calls play() with a resolver producing end-5s -> end on the end anchor', () => {
        const value = {startOffsetMs: '0', endOffsetMs: '9000'};
        render(<OffsetDialog anchor="end" value={value} onChange={() => {}} onClose={() => {}}/>);
        fireEvent.click(screen.getByText('Tester'));

        expect(mockPlay).toHaveBeenCalledWith(value, expect.any(Function));
        const resolveWindow = mockPlay.mock.calls[0][1];

        expect(resolveWindow(999)).toEqual(previewWindow(value, 'end', 999));
        expect(resolveWindow(999)).toEqual({startSec: 4, endSec: 9});
    });

    it('falls back to the media duration on the end anchor when no endOffsetMs is set', () => {
        const value = {startOffsetMs: '0'};
        render(<OffsetDialog anchor="end" value={value} onChange={() => {}} onClose={() => {}}/>);
        fireEvent.click(screen.getByText('Tester'));

        const resolveWindow = mockPlay.mock.calls[0][1];
        expect(resolveWindow(12)).toEqual(previewWindow(value, 'end', 12));
        expect(resolveWindow(12)).toEqual({startSec: 7, endSec: 12});
    });

    it('does not render the controls attribute on the preview video', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        expect(video).toBeTruthy();
        expect(video.hasAttribute('controls')).toBe(false);
    });

    it('shows the error message when error is provided', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} error="Invalide" onClose={() => {}}/>);
        expect(screen.getByText('Invalide')).toBeTruthy();
    });

    it('does not show an error message when none is provided', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={() => {}}/>);
        expect(document.querySelector('.invalid-feedback')).toBeNull();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = jest.fn();
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={onClose}/>);
        fireEvent.click(screen.getByText('Fermer'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape is pressed', () => {
        const onClose = jest.fn();
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={onClose}/>);
        fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the overlay backdrop is clicked', () => {
        const onClose = jest.fn();
        const {container} = render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={onClose}/>);
        fireEvent.click(container.querySelector('.confirm-dialog-overlay'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the inner box', () => {
        const onClose = jest.fn();
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={onClose}/>);
        fireEvent.click(screen.getByRole('dialog'));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not let a keydown fired inside the dialog reach a document-level keydown listener', () => {
        const documentHandler = jest.fn();
        document.addEventListener('keydown', documentHandler);
        try {
            render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={() => {}}/>);
            fireEvent.keyDown(screen.getByRole('dialog'), {key: 'ArrowRight'});
            expect(documentHandler).not.toHaveBeenCalled();
        } finally {
            document.removeEventListener('keydown', documentHandler);
        }
    });

    it('focuses the offset field after mount', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={() => {}}/>);
        expect(document.querySelector('input[name="startOffsetMs"]')).toHaveFocus();
    });
});
