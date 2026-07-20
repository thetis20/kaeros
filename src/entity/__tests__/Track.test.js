import Track from '../Track';

describe('Track', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    it('stores constructor fields', () => {
        const track = new Track({type: 'time', name: 'Round 1', stratedAt: 42});
        expect(track.type).toBe('time');
        expect(track.name).toBe('Round 1');
        expect(track.stratedAt).toBe(42);
    });

    it('defaults every capability check to false', () => {
        const track = new Track({});
        expect(track.canPlay()).toBe(false);
        expect(track.canPause()).toBe(false);
        expect(track.canPlus()).toBe(false);
        expect(track.canMinus()).toBe(false);
    });

    it('plus/minus/play/pause are no-ops when the matching capability is false', () => {
        const track = new Track({});
        track.plus();
        track.minus();
        track.play();
        track.pause();
        expect(window.electronAPI.trackChange).not.toHaveBeenCalled();
    });
});
