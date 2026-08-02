import React, { useRef, useEffect } from 'react';

function PresentationTime({track}) {
    const ref = useRef()

    useEffect(()=>{
        if(track.paused !== ref.current.paused){
            if(ref.current.paused){
                ref.current.play()
            }else{
                ref.current.pause()
            }
        }
    }, [ref, track])

    return (
        <div className="width-full height-full" style={{display: 'flex', alignItems: 'center'}}>
            <video onEnded={track.run} autoPlay ref={ref} className='width-full'>
                <source src="video/time-intro.mp4" type="video/mp4" />
            </video>
        </div>
    );
}

export default PresentationTime;