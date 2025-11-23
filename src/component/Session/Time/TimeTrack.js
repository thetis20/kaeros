import 'react';
import {STATUS_PRESENTATION, STATUS_RUNNING} from '../../../entity/TimeTrack'
import PresentationTime from "./PresentationTime";
import RunningTime from "./RunningTime";

function TimeTrack({track}) {
    console.log('time', track);

    switch (track.status) {
        case STATUS_PRESENTATION:
            return <PresentationTime track={track}/>
        case STATUS_RUNNING:
            return <RunningTime track={track}/>

    }
}

export default TimeTrack;