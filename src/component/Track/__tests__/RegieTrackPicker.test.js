import '../../../lib/i18n';
import {render, screen, fireEvent, within} from '@testing-library/react';
import RegieTrackPicker from '../RegieTrackPicker';

const tags = [
    {id: 'tag1', name: 'Musique', color: '#4C6EFF'},
    {id: 'tag2', name: 'Bruitage', color: '#F76707'},
    {id: 'tag3', name: 'Disco', color: '#AE3EC9'},
];

const tracks = [
    {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tags: ['tag1']},
    {id: 't2', name: 'Applaudissements', src: '/tmp/t2.mp3', tags: ['tag2']},
    {id: 't3', name: 'Disco Fever', src: '/tmp/t3.mp3', tags: ['tag3']},
];

describe('RegieTrackPicker', () => {
    it('shows every track under "Tous" by default', () => {
        render(<RegieTrackPicker tracks={tracks} tags={tags} playingIds={[]} onStart={() => {}}/>);

        expect(screen.getByText('Générique')).toBeTruthy();
        expect(screen.getByText('Applaudissements')).toBeTruthy();
        expect(screen.getByText('Disco Fever')).toBeTruthy();
    });

    it('filters tracks by tag when a tag tab is clicked', () => {
        render(<RegieTrackPicker tracks={tracks} tags={tags} playingIds={[]} onStart={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Bruitage'}));

        expect(screen.getByText('Applaudissements')).toBeTruthy();
        expect(screen.queryByText('Générique')).toBeNull();
        expect(screen.queryByText('Disco Fever')).toBeNull();
    });

    it('calls onStart with the matching track when its start button is clicked', () => {
        const onStart = jest.fn();
        render(<RegieTrackPicker tracks={tracks} tags={tags} playingIds={[]} onStart={onStart}/>);
        const row = screen.getByText('Générique').closest('.step-row');
        fireEvent.click(within(row).getByRole('button', {name: 'Démarrer'}));

        expect(onStart).toHaveBeenCalledWith(tracks[0]);
    });

    it('disables the button and shows "En cours" for a track whose id is in playingIds', () => {
        render(<RegieTrackPicker tracks={tracks} tags={tags} playingIds={['t1']} onStart={() => {}}/>);
        const row = screen.getByText('Générique').closest('.step-row');

        expect(within(row).getByRole('button', {name: 'En cours'})).toBeDisabled();
    });

    it('shows a pill for every tag on a track with several tags', () => {
        const multiTagTracks = [{id: 't4', name: 'Mashup', src: '/tmp/t4.mp3', tags: ['tag1', 'tag3']}];
        render(<RegieTrackPicker tracks={multiTagTracks} tags={tags} playingIds={[]} onStart={() => {}}/>);
        const row = screen.getByText('Mashup').closest('.step-row');

        expect(within(row).getByText('Musique')).toBeTruthy();
        expect(within(row).getByText('Disco')).toBeTruthy();
    });
});
