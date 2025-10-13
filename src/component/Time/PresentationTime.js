import React, { useRef, useEffect } from 'react';

function PresentationTime({time, onEnded}) {
    const ref = useRef()

    useEffect(()=>{
        if(time.paused !== ref.current.paused){
            if(ref.current.paused){
                ref.current.play()
            }else{
                ref.current.pause()
            }
        }
    }, [ref, time])

    return (
        <div className="d-flex width-full height-full align-items-center">
            <video onEnded={onEnded} autoPlay ref={ref} className='width-full'>
                <source src="video/time-intro.mp4" type="video/mp4" />
            </video>
        </div>
    );
}

export default PresentationTime;