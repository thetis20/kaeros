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

    it('renders the fadeInMs field on the start anchor, defaulting to 1000', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={() => {}}/>);
        const input = document.querySelector('input[name="fadeInMs"]');
        expect(input).toBeTruthy();
        expect(input.value).toBe('1000');
    });

    it('does not render the fadeInMs field on the end anchor', () => {
        render(<OffsetDialog anchor="end" value={{}} onChange={() => {}} onClose={() => {}}/>);
        expect(document.querySelector('input[name="fadeInMs"]')).toBeNull();
    });

    it('calls onChange when the fadeInMs field is edited', () => {
        const onChange = jest.fn();
        render(<OffsetDialog anchor="start" value={{}} onChange={onChange} onClose={() => {}}/>);
        const input = document.querySelector('input[name="fadeInMs"]');
        fireEvent.change(input, {target: {value: '2000'}});
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('shows the fadeError message next to the fadeInMs field', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} fadeError="Invalide" onClose={() => {}}/>);
        expect(screen.getByText('Invalide')).toBeTruthy();
        expect(document.querySelector('.invalid-feedback')).toBeTruthy();
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

    it('renders the fadeOutMs field on the end anchor, defaulting to 1000', () => {
        render(<OffsetDialog anchor="end" value={{}} onChange={() => {}} onClose={() => {}}/>);
        const input = document.querySelector('input[name="fadeOutMs"]');
        expect(input).toBeTruthy();
        expect(input.value).toBe('1000');
    });

    it('does not render the fadeOutMs field on the start anchor', () => {
        render(<OffsetDialog anchor="start" value={{}} onChange={() => {}} onClose={() => {}}/>);
        expect(document.querySelector('input[name="fadeOutMs"]')).toBeNull();
    });

    it('calls onChange when the fadeOutMs field is edited', () => {
        const onChange = jest.fn();
        render(<OffsetDialog anchor="end" value={{}} onChange={onChange} onClose={() => {}}/>);
        const input = document.querySelector('input[name="fadeOutMs"]');
        fireEvent.change(input, {target: {value: '2000'}});
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('shows the fadeError message next to the fadeOutMs field', () => {
        render(<OffsetDialog anchor="end" value={{}} onChange={() => {}} fadeError="Invalide" onClose={() => {}}/>);
        expect(screen.getByText('Invalide')).toBeTruthy();
        expect(document.querySelector('.invalid-feedback')).toBeTruthy();
    });

    it('wraps the preview video with a black fade overlay starting at opacity 0', () => {
        render(<OffsetDialog anchor="end" value={{}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        const overlay = screen.getByTestId('black-fade-overlay');
        expect(video).toBeTruthy();
        expect(overlay).toBeTruthy();
        expect(video.parentElement).toBe(overlay.parentElement);
        expect(overlay.style.opacity).toBe('0');
    });

    it('darkens the preview as it nears the configured end', () => {
        render(<OffsetDialog anchor="end" value={{src: '/tmp/a.mp4', endOffsetMs: 40000, fadeOutMs: 1000}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', {value: 39.5, configurable: true});
        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');
    });

    it('darkens the end preview using the default fadeOutMs of 1000 when it is not set', () => {
        render(<OffsetDialog anchor="end" value={{src: '/tmp/a.mp4', endOffsetMs: 40000}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', {value: 39.5, configurable: true});
        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');
    });

    it('lightens the start preview using the default fadeInMs of 1000 when it is not set', () => {
        render(<OffsetDialog anchor="start" value={{src: '/tmp/a.mp4', startOffsetMs: 0}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', {value: 0.5, configurable: true});
        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');
    });

    it('lightens the start preview: it opens on black and fades in over fadeInMs', () => {
        render(<OffsetDialog anchor="start" value={{src: '/tmp/a.mp4', startOffsetMs: 0, fadeInMs: 1000}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);

        // right at the start of the window: fully black.
        Object.defineProperty(video, 'currentTime', {value: 0, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');

        // halfway through the 1s fade-in.
        Object.defineProperty(video, 'currentTime', {value: 0.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');

        // past the fade-in: fully visible.
        Object.defineProperty(video, 'currentTime', {value: 1.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('does not apply a fadeOutMs to the start preview', () => {
        render(<OffsetDialog anchor="start" value={{src: '/tmp/a.mp4', startOffsetMs: 0, fadeInMs: 0, fadeOutMs: 1000}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', {value: 0, configurable: true});
        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('does not apply a fadeInMs to the end preview', () => {
        render(<OffsetDialog anchor="end" value={{src: '/tmp/a.mp4', endOffsetMs: 40000, fadeOutMs: 0, fadeInMs: 1000}} onChange={() => {}} onClose={() => {}}/>);
        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', {value: 39.5, configurable: true});
        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });
    it('opens the start preview on black before the first timeupdate lands', () => {
        render(<OffsetDialog anchor="start" value={{src: '/tmp/a.mp4', startOffsetMs: 0, fadeInMs: 1000}} onChange={() => {}} onClose={() => {}}/>);
        fireEvent.click(screen.getByText('Tester'));
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');

        const video = document.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 60, configurable: true});
        fireEvent.loadedMetadata(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');
    });

    it('keeps the start preview clear from the first frame when fadeInMs is 0', () => {
        render(<OffsetDialog anchor="start" value={{src: '/tmp/a.mp4', startOffsetMs: 0, fadeInMs: 0}} onChange={() => {}} onClose={() => {}}/>);
        fireEvent.click(screen.getByText('Tester'));
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });
});
