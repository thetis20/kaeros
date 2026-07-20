import TimeTrack, {STATUS_PRESENTATION, STATUS_RUNNING} from '../TimeTrack';

describe('TimeTrack', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    const build = (overrides = {}) => new TimeTrack({
        impro: 10,
        minutes: 3,
        count: 1,
        time: 60,
        paused: true,
        status: STATUS_PRESENTATION,
        ...overrides,
    });

    it('canPlay/canPause mirror the paused flag', () => {
        expect(build({paused: true}).canPlay()).toBe(true);
        expect(build({paused: true}).canPause()).toBe(false);
        expect(build({paused: false}).canPlay()).toBe(false);
        expect(build({paused: false}).canPause()).toBe(true);
    });

    it('canPlus requires STATUS_RUNNING and count below impro', () => {
        expect(build({status: STATUS_RUNNING, count: 5, impro: 10}).canPlus()).toBe(true);
        expect(build({status: STATUS_RUNNING, count: 10, impro: 10}).canPlus()).toBe(false);
        expect(build({status: STATUS_PRESENTATION, count: 5, impro: 10}).canPlus()).toBe(false);
    });

    it('canMinus requires STATUS_RUNNING and count above 1', () => {
        expect(build({status: STATUS_RUNNING, count: 2}).canMinus()).toBe(true);
        expect(build({status: STATUS_RUNNING, count: 1}).canMinus()).toBe(false);
        expect(build({status: STATUS_PRESENTATION, count: 2}).canMinus()).toBe(false);
    });

    it('play() unpauses', () => {
        build().play();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});
    });

    it('run() switches to running and unpauses', () => {
        build().run();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({status: STATUS_RUNNING, paused: false});
    });

    it('pause() pauses', () => {
        build().pause();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});
    });

    it('decrement() ticks the clock down by one', () => {
        build({time: 10}).decrement();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({time: 9});
    });

    it('decrement() floors at 0 and pauses once time runs out', () => {
        build({time: 1}).decrement();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({time: 0, paused: true});
    });

    it('decrement() floors at 0 and pauses when time is already 0', () => {
        build({time: 0}).decrement();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({time: 0, paused: true});
    });
});
