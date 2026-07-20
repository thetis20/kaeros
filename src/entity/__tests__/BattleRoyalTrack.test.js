import BattleRoyalTrack from '../BattleRoyalTrack';

describe('BattleRoyalTrack', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    const build = () => new BattleRoyalTrack({
        players: [
            {id: 'p1', name: 'Alice', score: 3, enabled: true},
            {id: 'p2', name: 'Bob', score: 0, enabled: false},
        ],
    });

    it('wraps each raw player in a Player instance', () => {
        const track = build();
        expect(track.players).toHaveLength(2);
        expect(track.players[0].name).toBe('Alice');
    });

    it('canIncrement/canDisable require the player to be enabled', () => {
        const [alice, bob] = build().players;
        expect(alice.canIncrement()).toBe(true);
        expect(alice.canDisable()).toBe(true);
        expect(bob.canIncrement()).toBe(false);
        expect(bob.canDisable()).toBe(false);
    });

    it('canDecrement additionally requires a positive score', () => {
        const [alice] = build().players;
        expect(alice.canDecrement()).toBe(true);
        alice.score = 0;
        expect(alice.canDecrement()).toBe(false);
    });

    it('canEnable is the opposite of enabled', () => {
        const [alice, bob] = build().players;
        expect(alice.canEnable()).toBe(false);
        expect(bob.canEnable()).toBe(true);
    });

    it('increment() only bumps the matching player, others pass through unchanged', () => {
        const [alice] = build().players;
        alice.increment();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 4, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: false},
            ],
        });
    });

    it('decrement() drops the matching player score by one', () => {
        const [alice] = build().players;
        alice.decrement();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 2, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: false},
            ],
        });
    });

    it('disable()/enable() flip only the matching player', () => {
        const [, bob] = build().players;
        bob.enable();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: true},
            ],
        });
    });
});
