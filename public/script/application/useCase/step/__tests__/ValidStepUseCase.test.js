const ValidStepUseCase = require('../ValidStepUseCase');

describe('ValidStepUseCase', () => {
    const validStepUseCase = new ValidStepUseCase();

    it('accepts a step with a non-empty name', () => {
        const step = {name: 'Step One'};
        expect(validStepUseCase.execute(step)).toBe(step);
    });

    it('rejects a missing or empty name', () => {
        expect(() => validStepUseCase.execute({name: ''})).toThrow('Invalid step name');
        expect(() => validStepUseCase.execute({})).toThrow('Invalid step name');
    });

    describe('dubbing-video offsets', () => {
        it('defaults startOffsetMs to 0 and endOffsetMs to null when omitted', () => {
            const step = {name: 'Step One', type: 'dubbing-video'};
            const result = validStepUseCase.execute(step);

            expect(result.startOffsetMs).toBe(0);
            expect(result.endOffsetMs).toBeNull();
        });

        it('keeps valid non-negative integer offsets', () => {
            const step = {name: 'Step One', type: 'dubbing-video', startOffsetMs: 250, endOffsetMs: 5000};
            const result = validStepUseCase.execute(step);

            expect(result.startOffsetMs).toBe(250);
            expect(result.endOffsetMs).toBe(5000);
        });

        it('coerces numeric string offsets to numbers', () => {
            const step = {name: 'Step One', type: 'dubbing-video', startOffsetMs: '250', endOffsetMs: '5000'};
            const result = validStepUseCase.execute(step);

            expect(result.startOffsetMs).toBe(250);
            expect(result.endOffsetMs).toBe(5000);
        });

        it('keeps endOffsetMs null when explicitly null or empty', () => {
            const step = {name: 'Step One', type: 'dubbing-video', startOffsetMs: 100, endOffsetMs: null};
            expect(validStepUseCase.execute(step).endOffsetMs).toBeNull();

            const step2 = {name: 'Step One', type: 'dubbing-video', startOffsetMs: 100, endOffsetMs: ''};
            expect(validStepUseCase.execute(step2).endOffsetMs).toBeNull();
        });

        it('rejects a negative startOffsetMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', startOffsetMs: -1})).toThrow('Invalid dubbing start offset');
        });

        it('rejects a non-integer startOffsetMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', startOffsetMs: 1.5})).toThrow('Invalid dubbing start offset');
        });

        it('rejects a negative endOffsetMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', endOffsetMs: -1})).toThrow('Invalid dubbing end offset');
        });

        it('rejects a non-integer endOffsetMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', endOffsetMs: 1.5})).toThrow('Invalid dubbing end offset');
        });

        it('rejects an endOffsetMs equal to startOffsetMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', startOffsetMs: 100, endOffsetMs: 100})).toThrow('Invalid dubbing offsets range');
        });

        it('rejects an endOffsetMs lower than startOffsetMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', startOffsetMs: 100, endOffsetMs: 50})).toThrow('Invalid dubbing offsets range');
        });

        it('does not touch offsets on a step of another type', () => {
            const imageStep = {name: 'Step One', type: 'image', startOffsetMs: undefined, endOffsetMs: undefined};
            const result = validStepUseCase.execute(imageStep);
            expect(result.startOffsetMs).toBeUndefined();
            expect(result.endOffsetMs).toBeUndefined();

            const timeStep = {name: 'Step One', type: 'time'};
            expect(() => validStepUseCase.execute(timeStep)).not.toThrow();
            expect(timeStep.startOffsetMs).toBeUndefined();
            expect(timeStep.endOffsetMs).toBeUndefined();
        });
    });

    describe('dubbing-video fadeOutMs', () => {
        it('defaults fadeOutMs to 1000 when omitted, null or empty', () => {
            const step = {name: 'Step One', type: 'dubbing-video'};
            expect(validStepUseCase.execute(step).fadeOutMs).toBe(1000);

            const step2 = {name: 'Step One', type: 'dubbing-video', fadeOutMs: null};
            expect(validStepUseCase.execute(step2).fadeOutMs).toBe(1000);

            const step3 = {name: 'Step One', type: 'dubbing-video', fadeOutMs: ''};
            expect(validStepUseCase.execute(step3).fadeOutMs).toBe(1000);
        });

        it('coerces a numeric string fadeOutMs to a number', () => {
            const step = {name: 'Step One', type: 'dubbing-video', fadeOutMs: '2000'};
            expect(validStepUseCase.execute(step).fadeOutMs).toBe(2000);
        });

        it('accepts 0 as a valid fadeOutMs', () => {
            const step = {name: 'Step One', type: 'dubbing-video', fadeOutMs: 0};
            expect(validStepUseCase.execute(step).fadeOutMs).toBe(0);
        });

        it('rejects a negative fadeOutMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', fadeOutMs: -1})).toThrow('Invalid dubbing fade out');
        });

        it('rejects a non-integer fadeOutMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', fadeOutMs: 1.5})).toThrow('Invalid dubbing fade out');
        });

        it('does not touch fadeOutMs on a step of another type', () => {
            const imageStep = {name: 'Step One', type: 'image', fadeOutMs: undefined};
            const result = validStepUseCase.execute(imageStep);
            expect(result.fadeOutMs).toBeUndefined();
        });
    });

    describe('dubbing-video fadeInMs', () => {
        it('defaults fadeInMs to 1000 when omitted, null or empty', () => {
            const step = {name: 'Step One', type: 'dubbing-video'};
            expect(validStepUseCase.execute(step).fadeInMs).toBe(1000);

            const step2 = {name: 'Step One', type: 'dubbing-video', fadeInMs: null};
            expect(validStepUseCase.execute(step2).fadeInMs).toBe(1000);

            const step3 = {name: 'Step One', type: 'dubbing-video', fadeInMs: ''};
            expect(validStepUseCase.execute(step3).fadeInMs).toBe(1000);
        });

        it('coerces a numeric string fadeInMs to a number', () => {
            const step = {name: 'Step One', type: 'dubbing-video', fadeInMs: '2000'};
            expect(validStepUseCase.execute(step).fadeInMs).toBe(2000);
        });

        it('accepts 0 as a valid fadeInMs', () => {
            const step = {name: 'Step One', type: 'dubbing-video', fadeInMs: 0};
            expect(validStepUseCase.execute(step).fadeInMs).toBe(0);
        });

        it('rejects a negative fadeInMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', fadeInMs: -1})).toThrow('Invalid dubbing fade in');
        });

        it('rejects a non-integer fadeInMs', () => {
            expect(() => validStepUseCase.execute({name: 'Step One', type: 'dubbing-video', fadeInMs: 1.5})).toThrow('Invalid dubbing fade in');
        });

        it('does not touch fadeInMs on a step of another type', () => {
            const imageStep = {name: 'Step One', type: 'image', fadeInMs: undefined};
            const result = validStepUseCase.execute(imageStep);
            expect(result.fadeInMs).toBeUndefined();
        });
    });
});
