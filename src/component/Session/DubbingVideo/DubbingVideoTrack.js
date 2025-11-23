import 'react';
import {STATUS_DESCRIPTION, STATUS_PRESENTATION, STATUS_RUNNING} from '../../../entity/DubbingVideoTrack'
import PresentationDubbingVideo from "./PresentationDubbingVideo";
import DescriptionDubbingVideo from "./DescriptionDubbingVideo";
import RunningDubbingVideo from "./RunningDubbingVideo";

function DubbingVideoTrack({track}) {

    switch (track.status) {
        case STATUS_DESCRIPTION:
            return <DescriptionDubbingVideo track={track}/>
        case STATUS_PRESENTATION:
            return <PresentationDubbingVideo track={track}/>
        case STATUS_RUNNING:
            return <RunningDubbingVideo track={track}/>

    }
}

export default DubbingVideoTrack;