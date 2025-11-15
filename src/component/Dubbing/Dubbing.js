import React, { useEffect, useState } from 'react';
import DUBBING_STATE from '../../enum/DUBBING_STATE'
import IntroductionDubbing from './IntroductionDubbing'
import PendingDubbing from './PendingDubbing'
import PresentationDubbing from './PresentationDubbing'
import RunningDubbing from './RunningDubbing';
import DubbingController from '../Controller/DubbingController';

function Dubbing() {
    const [dubbing, setDubbing] = useState()

    function handleDubbing(event) {
        setDubbing(event.detail)
    }

    function nextStep() {
        if (dubbing.state === DUBBING_STATE.PENDING) {
            electronAPI.dubbingOnChange({
                ...dubbing,
                state: DUBBING_STATE.PRESENTATION,
                paused: true
            })
        } else if (dubbing.state === DUBBING_STATE.PRESENTATION) {
            electronAPI.dubbingOnChange({
                ...dubbing,
                state: DUBBING_STATE.INTRODUCTION,
                paused: false
            })
        } else if (dubbing.state === DUBBING_STATE.INTRODUCTION) {
            electronAPI.dubbingOnChange({ ...dubbing, state: DUBBING_STATE.RUNNING })
        } else {
            toVideo(dubbing, dubbing.index + 1)
        }
    }

    function toVideo(dubbing, index) {
        if (index >= dubbing.videos.length || index < 0) {
            electronAPI.dubbingOnChange({ ...dubbing, index: 0, state: DUBBING_STATE.PENDING, paused: true })
        } else {
            electronAPI.dubbingOnChange({ ...dubbing, index, state: DUBBING_STATE.PRESENTATION, paused: true })
        }
    }

    useEffect(() => {
        document.addEventListener('dubbing-onchange', handleDubbing);
        return () => {
            document.removeEventListener('dubbing-onchange', handleDubbing);
        }
    }, []);

    return (
        <div className="with-full height-full bg-black">
            <DubbingController display={false} />
            {dubbing?.state === DUBBING_STATE.PENDING && <PendingDubbing />}
            {dubbing?.state === DUBBING_STATE.PRESENTATION && <PresentationDubbing dubbing={dubbing} />}
            {dubbing?.state === DUBBING_STATE.INTRODUCTION && <IntroductionDubbing dubbing={dubbing} onEnded={nextStep} />}
            {dubbing?.state === DUBBING_STATE.RUNNING && <RunningDubbing dubbing={dubbing} />}
        </div>
    );
}

export default Dubbing;