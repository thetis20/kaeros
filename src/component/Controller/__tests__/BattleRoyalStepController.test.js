import {render, screen, fireEvent} from '@testing-library/react';
import BattleRoyalStepController from '../BattleRoyalStepController';
import BattleRoyalTrack from '../../../entity/BattleRoyalTrack';

describe('BattleRoyalStepController', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    it('renders a plain clickable row when it is not the current step', () => {
        const session = {index: 0, toStep: jest.fn()};
        const {container} = render(<BattleRoyalStepController session={session} step={{id: 's1', name: 'BR Round'}} index={2}/>);

        const item = container.querySelector('.step-row');
        expect(item.className).not.toContain('current');
        fireEvent.click(item);
        expect(session.toStep).toHaveBeenCalledWith(2);
    });

    it('expands the player scoreboard when it is the current step', () => {
        const track = new BattleRoyalTrack({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: false},
            ],
        });
        const session = {index: 0, track, toStep: jest.fn()};
        const {container} = render(<BattleRoyalStepController session={session} step={{id: 's1', name: 'BR Round'}} index={0}/>);

        expect(container.querySelector('.step-row').className).toContain('current');
        expect(screen.getByText(/Alice/)).toBeTruthy();
        expect(screen.getByText(/Bob/)).toBeTruthy();
    });

    it('disables increment/decrement once the player is disabled', () => {
        const track = new BattleRoyalTrack({
            players: [{id: 'p1', name: 'Alice', score: 0, enabled: false}],
        });
        const session = {index: 0, track, toStep: jest.fn()};
        render(<BattleRoyalStepController session={session} step={{id: 's1', name: 'BR Round'}} index={0}/>);

        const incrementButton = screen.getByRole('button', {name: 'increment'});
        const decrementButton = screen.getByRole('button', {name: 'decrement'});
        expect(incrementButton.disabled).toBe(true);
        expect(decrementButton.disabled).toBe(true);
    });

    it('disables decrement for an enabled player at score 0', () => {
        const track = new BattleRoyalTrack({
            players: [{id: 'p1', name: 'Alice', score: 0, enabled: true}],
        });
        const session = {index: 0, track, toStep: jest.fn()};
        render(<BattleRoyalStepController session={session} step={{id: 's1', name: 'BR Round'}} index={0}/>);

        const incrementButton = screen.getByRole('button', {name: 'increment'});
        const decrementButton = screen.getByRole('button', {name: 'decrement'});
        expect(incrementButton.disabled).toBe(false);
        expect(decrementButton.disabled).toBe(true);
    });

    it('increment/decrement call trackChange with only the targeted player updated', () => {
        const track = new BattleRoyalTrack({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: false},
            ],
        });
        const session = {index: 0, track, toStep: jest.fn()};
        render(<BattleRoyalStepController session={session} step={{id: 's1', name: 'BR Round'}} index={0}/>);

        const incrementAlice = screen.getAllByRole('button', {name: 'increment'})[0];
        fireEvent.click(incrementAlice);

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 4, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: false},
            ],
        });
    });

    it('shows disable for an enabled player and enable for a disabled one', () => {
        const track = new BattleRoyalTrack({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: false},
            ],
        });
        const session = {index: 0, track, toStep: jest.fn()};
        render(<BattleRoyalStepController session={session} step={{id: 's1', name: 'BR Round'}} index={0}/>);

        const disableButtons = screen.getAllByRole('button', {name: 'disable'});
        const enableButtons = screen.getAllByRole('button', {name: 'enable'});
        expect(disableButtons).toHaveLength(1);
        expect(enableButtons).toHaveLength(1);

        fireEvent.click(enableButtons[0]);
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: true},
            ],
        });
    });
});
