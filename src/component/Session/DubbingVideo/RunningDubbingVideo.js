import React, { useRef, useEffect, useState } from 'react';
import { redBg } from '../../../enum/COLOR'

function ProgressBar({ currentTime, duration }) {
    const percent = currentTime / duration * 100
    const restTime = duration - currentTime

    return <div style={{
        position: 'absolute',
        width: '80%',
        bottom: 30,
        margin: 'auto',
        height: 5,
        backgroundColor: '#e9ecef',
        borderRadius: '.25rem',
        overflow: 'hidden'
    }}
    >
        <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
                width: percent + '%',
                height: '100%',
                backgroundColor: restTime < 10 ? '#dc3545' : '#6c757d'
            }}></div>
    </div>
}

function RunningDubbingVideo({ track }) {
    const [time, setTime] = useState({currentTime: 0, duration: 0})
    const ref = useRef()

    function onTimeUpdate(e) {
        setTime({
            currentTime: e.target.currentTime,
            duration: e.target.duration
        })
    }

    useEffect(() => {

        if (track.paused !== ref.current.paused) {
            if (ref.current.paused) {
                ref.current.play()
            } else {
                ref.current.pause()
            }
        }

    }, [ref, track])

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <video autoPlay ref={ref} style={{ width: '100%' }} onTimeUpdate={onTimeUpdate} onEnded={track.pause} muted={true}>
                <source src={'file://' + track.src} type="video/mp4" />
            </video>
            <ProgressBar currentTime={time.currentTime} duration={time.duration} />
        </div>
    );
}

export default RunningDubbingVideo;