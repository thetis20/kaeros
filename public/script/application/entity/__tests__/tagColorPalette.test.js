const TAG_COLOR_PALETTE = require('../tagColorPalette');

describe('tagColorPalette', () => {
    it('starts with the historical Musique/Bruitage/Disco colors, in that order', () => {
        expect(TAG_COLOR_PALETTE.slice(0, 3)).toEqual(['#4C6EFF', '#F76707', '#AE3EC9']);
    });

    it('has no duplicate colors', () => {
        expect(new Set(TAG_COLOR_PALETTE).size).toBe(TAG_COLOR_PALETTE.length);
    });
});
