import React, { useRef, useEffect } from 'react';

function IntroductionDubbing({dubbing, onEnded}) {
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
                <source src="video/dubbing-intro.mp4" type="video/mp4" />
            </video>
        </div>
    );
}

export default IntroductionDubbing;