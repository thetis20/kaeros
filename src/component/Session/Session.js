import 'react';
import useSession from '../Hook/useSession';
import ImageTrack from './ImageTrack';
import Controller from './Controller';

function Session() {
    const session = useSession()

    if (undefined === session) {
        return <div className="with-full height-full bg-black" />
    }

    return (
        <div className="with-full height-full bg-black">
            <Controller display={false} />
            {session.track.type === 'image' && <ImageTrack track={session.track} />}
        </div>
    );
}

export default Session;