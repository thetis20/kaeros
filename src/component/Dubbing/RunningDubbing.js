import React, { useRef, useEffect, useState } from 'react';
import { redBg } from '../../enum/COLOR'

function ProgressBar({ currentTime, duration }) {
    const percent = currentTime / duration * 100
    const restTime = duration - currentTime

    const isRed = restTime < 10

    return <div class="progress" style={{
        position: 'absolute',
        width: '80%',
        bottom: 30,
        margin: 'auto',
        height: 5
    }}
    >
        <div
            class={'progress-bar ' + (restTime < 10 ? 'bg-danger' : 'bg-secondary')}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ width: percent + '%' }}></div>
    </div>
}

function RunningDubbing({ dubbing, onEnded }) {
    const [time, setTime] = useState(0)
    const video = dubbing.videos[dubbing.index]
    const ref = useRef()

    function onTimeUpdate(e) {
        setTime({
            currentTime: e.target.currentTime,
            duration: e.target.duration
        })
    }

    useEffect(() => {

        if (dubbing.paused !== ref.current.paused) {
            if (ref.current.paused) {
                ref.current.play()
            } else {
                ref.current.pause()
            }
        }

    }, [ref, dubbing])

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <video onEnded={onEnded} autoPlay ref={ref} style={{ width: '100%' }} onTimeUpdate={onTimeUpdate} muted={true}>
                <source src={'file://' + video.src} type="video/mp4" />
            </video>
            <ProgressBar currentTime={time.currentTime} duration={time.duration} />
        </div>
    );
}

export default RunningDubbing;