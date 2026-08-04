import Session from '../Session';
import ImageTrack from '../ImageTrack';
import TimeTrack from '../TimeTrack';
import DubbingVideoTrack from '../DubbingVideoTrack';
import VideoTrack from '../VideoTrack';
import BattleRoyalTrack from '../BattleRoyalTrack';

describe('Session', () => {
    beforeEach(() => {
        window.electronAPI = {
            trackChange: jest.fn(),
            sessionNext: jest.fn(),
            sessionPrevious: jest.fn(),
            sessionToStep: jest.fn(),
        };
    });

    it('instantiates the right Track subclass from track.type', () => {
        expect(new Session({track: {type: 'image'}, steps: []}).track).toBeInstanceOf(ImageTrack);
        expect(new Session({track: {type: 'time'}, steps: []}).track).toBeInstanceOf(TimeTrack);
        expect(new Session({track: {type: 'dubbing-video'}, steps: []}).track).toBeInstanceOf(DubbingVideoTrack);
        expect(new Session({track: {type: 'video'}, steps: []}).track).toBeInstanceOf(VideoTrack);
        expect(new Session({
            track: {type: 'battle-royal', players: []},
            steps: [],
        }).track).toBeInstanceOf(BattleRoyalTrack);
    });

    it('leaves track untouched when absent', () => {
        expect(new Session({steps: []}).track).toBeUndefined();
    });

    it('hasNext is true while index is before the last step', () => {
        const session = new Session({steps: [1, 2, 3], index: 0});
        expect(session.hasNext()).toBe(true);
        expect(new Session({steps: [1, 2, 3], index: 2}).hasNext()).toBe(false);
    });

    it('hasPrevious is false only at index 0', () => {
        expect(new Session({steps: [1, 2], index: 0}).hasPrevious()).toBe(false);
        expect(new Session({steps: [1, 2], index: 1}).hasPrevious()).toBe(true);
    });

    it('next()/previous() call the Electron bridge only when allowed', () => {
        const firstSession = new Session({steps: [1, 2], index: 0});
        firstSession.previous();
        expect(window.electronAPI.sessionPrevious).not.toHaveBeenCalled();
        firstSession.next();
        expect(window.electronAPI.sessionNext).toHaveBeenCalledTimes(1);

        const lastSession = new Session({steps: [1, 2], index: 1});
        lastSession.next();
        expect(window.electronAPI.sessionNext).toHaveBeenCalledTimes(1);
        lastSession.previous();
        expect(window.electronAPI.sessionPrevious).toHaveBeenCalledTimes(1);
    });

    it('toStep() forwards the index to the Electron bridge', () => {
        new Session({steps: []}).toStep(3);
        expect(window.electronAPI.sessionToStep).toHaveBeenCalledWith(3);
    });

    it('canPlus/canMinus/plus/minus/play/pause delegate to the track', () => {
        const session = new Session({track: {type: 'time', status: 'STATUS_RUNNING', count: 1, impro: 5, paused: true}, steps: []});
        expect(session.canPlus()).toBe(session.track.canPlus());
        expect(session.canMinus()).toBe(session.track.canMinus());

        session.play();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});
    });
});
