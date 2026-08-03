const ValidTagUseCase = require('../ValidTagUseCase');

describe('ValidTagUseCase', () => {
    const validTagUseCase = new ValidTagUseCase();

    it('accepts a tag with a non-empty name', () => {
        const tag = {name: 'Rock'};
        expect(validTagUseCase.execute(tag)).toBe(tag);
    });

    it('rejects a missing, empty or blank name', () => {
        expect(() => validTagUseCase.execute({name: ''})).toThrow('Invalid tag name');
        expect(() => validTagUseCase.execute({name: '   '})).toThrow('Invalid tag name');
        expect(() => validTagUseCase.execute({})).toThrow('Invalid tag name');
    });

    it('rejects a non-string name', () => {
        expect(() => validTagUseCase.execute({name: 42})).toThrow('Invalid tag name');
    });
});
