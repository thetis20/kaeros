import React, {useEffect} from 'react';

function RunningTime({track}) {

    const min = Math.floor(track.time / 60);
    const sec = track.time % 60 <= 9 ? `0${track.time % 60}` : track.time % 60;

    useEffect(() => {

        let interval = null

        if (track?.paused !== true) {
            interval = setInterval(track.decrement, 1000);
        }

        return () => {
            if (null !== interval) {
                clearInterval(interval);
            }
        }
    }, [track]);

    return (
        <div className="counter-time">
            <div className="counter-time__number">{track.count}</div>
            <div className="counter-time__timer">{min}:{sec}</div>
        </div>
    );
}

export default RunningTime;