const Tag = require('../Tag');

describe('Tag entity', () => {
    it('assigns id, name, color, createdAt and updatedAt from the constructor', () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const tag = new Tag('tag1', 'Rock', '#4C6EFF', createdAt, updatedAt);

        expect(tag.id).toBe('tag1');
        expect(tag.name).toBe('Rock');
        expect(tag.color).toBe('#4C6EFF');
        expect(tag.createdAt).toBe(createdAt);
        expect(tag.updatedAt).toBe(updatedAt);
    });

    it('defaults createdAt/updatedAt to a Date when omitted', () => {
        const tag = new Tag('tag1', 'Rock', '#4C6EFF');

        expect(tag.createdAt).toBeInstanceOf(Date);
        expect(tag.updatedAt).toBeInstanceOf(Date);
    });
});
