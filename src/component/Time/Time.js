import { useEffect, useState } from 'react';
import PresentationTime from './PresentationTime';
import RunningTime from './RunningTime';
import TIME_STATE from '../../enum/TIME_STATE'
import PendingTime from './PendingTime';
import TimeController from '../Controller/TimeController';

function Time() {
    const [time, setTime] = useState()

    function dispatchTime(status) {
        electronAPI.timeOnChange(status)
    }

    function handleTime(event) {
        setTime(event.detail)
    }

    useEffect(() => {
        document.addEventListener('time-onchange', handleTime);
        return () => {
            document.removeEventListener('time-onchange', handleTime);
        }
    }, []);

    return (
        <div className="with-full height-full bg-black">
            <TimeController display={false} />
            {time?.state === TIME_STATE.PENDING && <PendingTime time={time} />}
            {time?.state === TIME_STATE.PRESENTATION && <PresentationTime time={time} onEnded={() => electronAPI.timeOnChange({ ...time, state: TIME_STATE.RUNNING })} />}
            {time?.state === TIME_STATE.RUNNING && <RunningTime time={time} />}
        </div>
    );
}

export default Time;