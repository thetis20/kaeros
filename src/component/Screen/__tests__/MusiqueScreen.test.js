import '../../../lib/i18n';
import {render, screen} from '@testing-library/react';
import MusiqueScreen from '../MusiqueScreen';

describe('MusiqueScreen', () => {
    it('renders the placeholder title and text without crashing', () => {
        render(<MusiqueScreen/>);

        expect(screen.getByRole('heading', {name: 'Musique'})).toBeTruthy();
        expect(screen.getByText('Bientôt disponible : gestion de la bibliothèque musicale.')).toBeTruthy();
    });
});
