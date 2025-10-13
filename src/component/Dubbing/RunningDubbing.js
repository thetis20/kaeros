import React, { useRef, useEffect } from 'react';

function RunningDubbing({dubbing, onEnded}) {

    const video = dubbing.videos[dubbing.index]
    const ref = useRef()

    useEffect(()=>{
        if(dubbing.paused !== ref.current.paused){
            if(ref.current.paused){
                ref.current.play()
            }else{
                ref.current.pause()
            }
        }
    }, [ref, dubbing])

    return (
        <div className="d-flex width-full height-full align-items-center">
            <video onEnded={onEnded} autoPlay ref={ref} className='width-full'>
                <source src={video.url} type="video/mp4" />
            </video>
        </div>
    );
}

export default RunningDubbing;