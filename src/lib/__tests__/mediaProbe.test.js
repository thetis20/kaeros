import {probeOne, probeAll} from '../mediaProbe';

class FakeElement {
    constructor() {
        this.listeners = {};
        this._src = '';
        this.preload = '';
    }

    addEventListener(event, handler) {
        this.listeners[event] = handler;
    }

    removeEventListener(event, handler) {
        if (this.listeners[event] === handler) delete this.listeners[event];
    }

    set src(value) {
        this._src = value;
    }

    get src() {
        return this._src;
    }

    trigger(event) {
        this.listeners[event]?.();
    }
}

describe('mediaProbe', () => {
    let realCreateElement;

    beforeEach(() => {
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
        realCreateElement = document.createElement.bind(document);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.Image;
        delete global.Audio;
    });

    describe('probeOne', () => {
        it('resolves ok when the image fires load', async () => {
            const fakeImage = new FakeElement();
            global.Image = jest.fn(() => fakeImage);

            const promise = probeOne({src: '/tmp/img.png', type: 'image'});
            fakeImage.trigger('load');

            await expect(promise).resolves.toEqual({code: 'ok'});
        });

        it('resolves decode-failed when the element fires error', async () => {
            const fakeImage = new FakeElement();
            global.Image = jest.fn(() => fakeImage);

            const promise = probeOne({src: '/tmp/img.png', type: 'image'});
            fakeImage.trigger('error');

            await expect(promise).resolves.toEqual({code: 'decode-failed'});
        });

        it('resolves timeout when nothing fires before the delay', async () => {
            jest.useFakeTimers();
            const fakeVideo = new FakeElement();
            jest.spyOn(document, 'createElement').mockImplementation((tag) => (
                tag === 'video' ? fakeVideo : realCreateElement(tag)
            ));

            const promise = probeOne({src: '/tmp/video.mp4', type: 'video'}, {timeoutMs: 8000});
            jest.advanceTimersByTime(8000);

            await expect(promise).resolves.toEqual({code: 'timeout'});
            jest.useRealTimers();
        });

        it('uses loadedmetadata (not load) as the success event for audio/video', async () => {
            const fakeAudio = new FakeElement();
            global.Audio = jest.fn(() => fakeAudio);

            const promise = probeOne({src: '/tmp/track.mp3', type: 'audio'});
            fakeAudio.trigger('load');
            fakeAudio.trigger('loadedmetadata');

            await expect(promise).resolves.toEqual({code: 'ok'});
        });

        it('probes a File via a blob URL instead of the file:// path when one is provided', async () => {
            const fakeAudio = new FakeElement();
            global.Audio = jest.fn(() => fakeAudio);
            const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});

            const promise = probeOne({file, type: 'audio'});

            expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
            expect(fakeAudio.src).toBe('blob:mock-url');

            fakeAudio.trigger('loadedmetadata');
            await promise;
        });

        it('cleans up listeners, src and the blob URL once settled', async () => {
            const fakeAudio = new FakeElement();
            global.Audio = jest.fn(() => fakeAudio);
            const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});

            const promise = probeOne({file, type: 'audio'});
            fakeAudio.trigger('loadedmetadata');
            await promise;

            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
            expect(fakeAudio.listeners.loadedmetadata).toBeUndefined();
            expect(fakeAudio.listeners.error).toBeUndefined();
            expect(fakeAudio.src).toBe('');
        });

        it('never rejects, even when element creation throws', async () => {
            global.Image = jest.fn(() => {
                throw new Error('boom');
            });

            await expect(probeOne({src: '/tmp/img.png', type: 'image'})).resolves.toEqual({code: 'decode-failed'});
        });
    });

    describe('probeAll', () => {
        it('preserves input order in the output regardless of resolution order', async () => {
            const fakeElements = [new FakeElement(), new FakeElement(), new FakeElement()];
            let callIndex = 0;
            global.Audio = jest.fn(() => fakeElements[callIndex++]);

            const items = [
                {id: 'a', src: '/tmp/a.mp3', type: 'audio'},
                {id: 'b', src: '/tmp/b.mp3', type: 'audio'},
                {id: 'c', src: '/tmp/c.mp3', type: 'audio'},
            ];

            const promise = probeAll(items, {concurrency: 3});

            // Resolve out of order: c, then a, then b.
            fakeElements[2].trigger('loadedmetadata');
            fakeElements[0].trigger('error');
            fakeElements[1].trigger('loadedmetadata');

            const results = await promise;

            expect(results.map((r) => r.id)).toEqual(['a', 'b', 'c']);
            expect(results).toEqual([
                {id: 'a', src: '/tmp/a.mp3', type: 'audio', code: 'decode-failed'},
                {id: 'b', src: '/tmp/b.mp3', type: 'audio', code: 'ok'},
                {id: 'c', src: '/tmp/c.mp3', type: 'audio', code: 'ok'},
            ]);
        });

        it('bounds concurrency: only `concurrency` probes run at a time', async () => {
            const createdElements = [];
            global.Audio = jest.fn(() => {
                const el = new FakeElement();
                createdElements.push(el);
                return el;
            });

            const items = [0, 1, 2, 3, 4].map((i) => ({id: `t${i}`, src: `/tmp/${i}.mp3`, type: 'audio'}));

            const promise = probeAll(items, {concurrency: 2});

            // With concurrency 2, only 2 workers should have started an element so far,
            // even though 5 items were passed in.
            expect(createdElements).toHaveLength(2);

            // Freeing both in-flight workers lets them each pick up one more item.
            createdElements[0].trigger('loadedmetadata');
            createdElements[1].trigger('loadedmetadata');
            await Promise.resolve();
            await Promise.resolve();
            expect(createdElements).toHaveLength(4);

            // Freeing those frees exactly one worker slot for the last remaining item.
            createdElements[2].trigger('loadedmetadata');
            createdElements[3].trigger('loadedmetadata');
            await Promise.resolve();
            await Promise.resolve();
            expect(createdElements).toHaveLength(5);

            createdElements[4].trigger('loadedmetadata');

            const results = await promise;
            expect(results).toHaveLength(5);
            expect(results.every((r) => r.code === 'ok')).toBe(true);
        });
    });
});