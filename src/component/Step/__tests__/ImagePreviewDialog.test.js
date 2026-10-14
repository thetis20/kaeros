import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import ImagePreviewDialog from '../ImagePreviewDialog';

describe('ImagePreviewDialog', () => {
    afterEach(() => {
        delete URL.createObjectURL;
        delete URL.revokeObjectURL;
    });

    function renderDialog(value) {
        const onChange = jest.fn();
        const onClose = jest.fn();
        const utils = render(<ImagePreviewDialog value={value} onChange={onChange} onClose={onClose}/>);
        return {...utils, onChange, onClose};
    }

    it('uses a file:// url for a stored src', () => {
        renderDialog({name: 'Photo', src: '/tmp/photo.png'});
        expect(screen.getByRole('img').getAttribute('src')).toMatch(/^file:\/\//);
    });

    it('uses a blob url for a picked file and revokes it on unmount', () => {
        URL.createObjectURL = jest.fn(() => 'blob:abc');
        URL.revokeObjectURL = jest.fn();
        const file = new File(['img'], 'photo.png', {type: 'image/png'});
        const {unmount} = renderDialog({name: 'Photo', file});

        expect(URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(screen.getByRole('img').getAttribute('src')).toBe('blob:abc');
        unmount();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:abc');
    });

    it('changing the range calls onChange with a number', () => {
        const {onChange} = renderDialog({name: 'Photo', src: '/tmp/photo.png'});
        fireEvent.change(screen.getByLabelText("Taille de l'image"), {target: {value: '30'}});
        expect(onChange).toHaveBeenCalledWith(30);
    });

    it('image width follows the scale', () => {
        renderDialog({name: 'Photo', src: '/tmp/photo.png', scale: 40});
        expect(screen.getByRole('img').style.width).toBe('40%');
    });
});
