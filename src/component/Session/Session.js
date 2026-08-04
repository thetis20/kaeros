import 'react';
import useSession from '../Hook/useSession';
import ImageTrack from './ImageTrack';
import SessionController from '../Controller/SessionController';
import DubbingVideoTrack from "./DubbingVideo/DubbingVideoTrack";
import RunningVideo from "./Video/RunningVideo";
import TimeTrack from "./Time/TimeTrack";
import BattleRoyalTrack from "./BattleRoyal/BattleRoyalTrack";

function Session() {
    const session = useSession()

    if (null === session) {
        return <div className="with-full height-full" style={{backgroundColor: '#000'}} />
    }

    return (
        <div className="with-full height-full" style={{backgroundColor: '#000'}}>
            <SessionController display={false} />
            {session.track.type === 'image' && <ImageTrack track={session.track} />}
            {session.track.type === 'dubbing-video' && <DubbingVideoTrack track={session.track} />}
            {session.track.type === 'video' && <RunningVideo track={session.track} />}
            {session.track.type === 'time' && <TimeTrack track={session.track} />}
            {session.track.type === 'battle-royal' && <BattleRoyalTrack track={session.track} />}
        </div>
    );
}

export default Session;