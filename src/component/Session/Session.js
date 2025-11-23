import 'react';
import useSession from '../Hook/useSession';
import ImageTrack from './ImageTrack';
import Controller from './Controller';
import DubbingVideoTrack from "./DubbingVideo/DubbingVideoTrack";
import TimeTrack from "./Time/TimeTrack";

function Session() {
    const session = useSession()

    if (null === session) {
        return <div className="with-full height-full bg-black" />
    }

    return (
        <div className="with-full height-full bg-black">
            <Controller display={false} />
            {session.track.type === 'image' && <ImageTrack track={session.track} />}
            {session.track.type === 'dubbing-video' && <DubbingVideoTrack track={session.track} />}
            {session.track.type === 'time' && <TimeTrack track={session.track} />}
        </div>
    );
}

export default Session;