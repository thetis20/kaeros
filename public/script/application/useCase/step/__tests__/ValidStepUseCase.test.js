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
});
