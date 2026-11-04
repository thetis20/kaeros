import {render, screen} from '@testing-library/react';
import Session from '../Session';
import useSession from '../../Hook/useSession';
import {STATUS_DESCRIPTION} from '../../../entity/DubbingVideoTrack';

jest.mock('../../Hook/useSession');
jest.mock('../../Controller/SessionController', () => () => null);

describe('Session', () => {
    it('counts only dubbing-video steps up to the current one', () => {
        useSession.mockReturnValue({
            steps: [{type: 'image'}, {type: 'dubbing-video'}, {type: 'dubbing-video'}],
            index: 2,
            track: {type: 'dubbing-video', status: STATUS_DESCRIPTION, time: '00:10', description: 'Desc'},
        });
        render(<Session/>);
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not count later dubbing-video steps', () => {
        useSession.mockReturnValue({
            steps: [{type: 'image'}, {type: 'dubbing-video'}, {type: 'dubbing-video'}],
            index: 1,
            track: {type: 'dubbing-video', status: STATUS_DESCRIPTION, time: '00:10', description: 'Desc'},
        });
        render(<Session/>);
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});
