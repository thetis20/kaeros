import {render, screen, fireEvent} from '@testing-library/react';
import StepController from '../StepController';

describe('StepController', () => {
    function buildSession(index) {
        return {index, toStep: jest.fn()};
    }

    it('renders the step name', () => {
        render(<StepController session={buildSession(0)} step={{id: 's1', name: 'Étape 1', type: 'image'}} index={0}/>);
        expect(screen.getByText('Étape 1')).toBeTruthy();
    });

    it('marks the current step as primary and is not clickable', () => {
        const session = buildSession(1);
        const {container} = render(<StepController session={session} step={{id: 's1', name: 'Current', type: 'image'}} index={1}/>);

        const item = container.querySelector('.step-row');
        expect(item.className).toContain('current');
        fireEvent.click(item);
        expect(session.toStep).not.toHaveBeenCalled();
    });

    it('marks an upcoming step plain and jumps to it on click', () => {
        const session = buildSession(0);
        const {container} = render(<StepController session={session} step={{id: 's2', name: 'Upcoming', type: 'image'}} index={2}/>);

        const item = container.querySelector('.step-row');
        expect(item.className).not.toContain('current');
        expect(item.className).not.toContain('done');
        fireEvent.click(item);
        expect(session.toStep).toHaveBeenCalledWith(2);
    });

    it('marks a past step as secondary and jumps to it on click', () => {
        const session = buildSession(3);
        const {container} = render(<StepController session={session} step={{id: 's3', name: 'Past', type: 'image'}} index={1}/>);

        const item = container.querySelector('.step-row');
        expect(item.className).toContain('done');
        fireEvent.click(item);
        expect(session.toStep).toHaveBeenCalledWith(1);
    });

    it('delegates battle-royal steps to BattleRoyalStepController', () => {
        const session = {index: 0, track: {players: []}, toStep: jest.fn()};
        const {container} = render(<StepController session={session} step={{id: 's4', name: 'BR', type: 'battle-royal'}} index={0}/>);

        expect(screen.getByText('BR')).toBeTruthy();
        expect(container.querySelector('.step-row').className).toContain('current');
    });
});
