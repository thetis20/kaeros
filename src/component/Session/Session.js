import 'react';
import useSession from '../Hook/useSession';
import ImageTrack from './ImageTrack';
import Controller from '../Controller/Controller';
import DubbingVideoTrack from "./DubbingVideo/DubbingVideoTrack";
import TimeTrack from "./Time/TimeTrack";
import BattleRoyalTrack from "./BattleRoyal/BattleRoyalTrack";

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
            {session.track.type === 'battle-royal' && <BattleRoyalTrack track={session.track} />}
        </div>
    );
}

export default Session;