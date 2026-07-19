import 'react';
import {STATUS_DESCRIPTION, STATUS_RUNNING} from '../../../entity/DubbingVideoTrack'
import DescriptionDubbingVideo from "./DescriptionDubbingVideo";
import RunningDubbingVideo from "./RunningDubbingVideo";

function DubbingVideoTrack({track}) {

    switch (track.status) {
        case STATUS_DESCRIPTION:
            return <DescriptionDubbingVideo track={track}/>
        case STATUS_RUNNING:
            return <RunningDubbingVideo track={track}/>
        default:
            return null
    }
}

export default DubbingVideoTrack;