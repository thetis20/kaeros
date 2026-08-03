import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import TagMultiSelect from '../TagMultiSelect';

const tags = [
    {id: 'tag1', name: 'Musique', color: '#4C6EFF'},
    {id: 'tag2', name: 'Bruitage', color: '#F76707'},
    {id: 'tag3', name: 'Disco', color: '#AE3EC9'},
];

describe('TagMultiSelect', () => {
    beforeEach(() => {
        window.electronAPI = {tagCreate: jest.fn()};
    });

    it('shows the selected tags as removable pills', () => {
        render(<TagMultiSelect tags={tags} value={['tag1', 'tag2']} onChange={() => {}}/>);

        expect(screen.getByText('Musique')).toBeTruthy();
        expect(screen.getByText('Bruitage')).toBeTruthy();
        expect(screen.queryByText('Disco')).toBeNull();
    });

    it('removes a tag from the selection when its pill remove button is clicked', () => {
        const onChange = jest.fn();
        render(<TagMultiSelect tags={tags} value={['tag1', 'tag2']} onChange={onChange}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Retirer Musique'}));

        expect(onChange).toHaveBeenCalledWith(['tag2']);
    });

    it('filters the dropdown of available tags by typed text', () => {
        render(<TagMultiSelect tags={tags} value={[]} onChange={() => {}}/>);

        fireEvent.focus(screen.getByPlaceholderText('Rechercher ou créer un tag'));
        fireEvent.change(screen.getByPlaceholderText('Rechercher ou créer un tag'), {target: {value: 'disc'}});

        expect(screen.getByRole('button', {name: 'Disco'})).toBeTruthy();
        expect(screen.queryByRole('button', {name: 'Musique'})).toBeNull();
    });

    it('adds an existing tag to the selection when clicked in the dropdown', () => {
        const onChange = jest.fn();
        render(<TagMultiSelect tags={tags} value={[]} onChange={onChange}/>);

        fireEvent.focus(screen.getByPlaceholderText('Rechercher ou créer un tag'));
        fireEvent.change(screen.getByPlaceholderText('Rechercher ou créer un tag'), {target: {value: 'disc'}});
        fireEvent.mouseDown(screen.getByRole('button', {name: 'Disco'}));

        expect(onChange).toHaveBeenCalledWith(['tag3']);
    });

    it('offers to create a new tag only when no existing tag matches exactly', () => {
        render(<TagMultiSelect tags={tags} value={[]} onChange={() => {}}/>);
        const input = screen.getByPlaceholderText('Rechercher ou créer un tag');

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: 'Rock'}});
        expect(screen.getByRole('button', {name: 'Créer « Rock »'})).toBeTruthy();

        fireEvent.change(input, {target: {value: 'musique'}});
        expect(screen.queryByRole('button', {name: /Créer/})).toBeNull();
    });

    it('creates a new tag via electronAPI and auto-selects it once it appears in tags', () => {
        const onChange = jest.fn();
        const {rerender} = render(<TagMultiSelect tags={tags} value={[]} onChange={onChange}/>);
        const input = screen.getByPlaceholderText('Rechercher ou créer un tag');

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: 'Rock'}});
        fireEvent.mouseDown(screen.getByRole('button', {name: 'Créer « Rock »'}));

        expect(window.electronAPI.tagCreate).toHaveBeenCalledWith({name: 'Rock'});
        expect(onChange).not.toHaveBeenCalled();

        const newTag = {id: 'tag4', name: 'Rock', color: '#12B886'};
        act(() => {
            rerender(<TagMultiSelect tags={[...tags, newTag]} value={[]} onChange={onChange}/>);
        });

        expect(onChange).toHaveBeenCalledWith(['tag4']);
    });
});
