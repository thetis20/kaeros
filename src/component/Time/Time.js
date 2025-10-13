import React, { useEffect, useState } from 'react';
import PresentationTime from './PresentationTime';
import RunningTime from './RunningTime';
import TIME_STATE from '../../enum/TIME_STATE'
import PendingTime from './PendingTime';

function Time() {
    const [time, setTime]= useState()

    function dispatchTime(status){
        electronAPI.timeOnChange(status)
    }

    function handleTime(event){
        setTime(event.detail)
    }

    useEffect(() => {
        document.addEventListener('time-onchange', handleTime);
        return () => {
            document.removeEventListener('time-onchange', handleTime);
        }
    }, []);

    useEffect(() => {
        function decrementTimer(){
            if(time.secondes - 1<=0){
                dispatchTime({
                    ...time,
                    secondes: 0,
                    paused: true
                })
            }else{
                dispatchTime({
                    ...time,
                    secondes: time.secondes - 1
                })
            }
        }

        function handleKeyboard(event){
            switch(event.key){
                case ' ':
                    if(time.state === TIME_STATE.PENDING){
                        dispatchTime({
                            ...time,
                            state: TIME_STATE.PRESENTATION,
                            paused: false
                        })
                    }else{
                        dispatchTime({
                            ...time,
                            paused: !time.paused
                        })
                    } 
                  break;
                case 'ArrowRight':
                    if(time.state === TIME_STATE.RUNNING){
                        dispatchTime({
                            ...time,
                            number: time.number + 1
                        })
                    } 
                    break;
                case 'ArrowLeft':
                    if(time.state === TIME_STATE.RUNNING){
                        dispatchTime({
                            ...time,
                            number: time.number - 1
                        })
                    }
                  break;
            }
            return 
        }

        let interval = null

        if(time?.paused !== true && time?.state === TIME_STATE.RUNNING){
            interval = setInterval(decrementTimer, 1000); 
        }

        document.addEventListener('keydown', handleKeyboard)
        return () => {
            if(null !== interval){
                clearInterval(interval);
            }
            document.removeEventListener('keydown', handleKeyboard)
        }
    }, [time]);
  
    return (
      <div className="with-full height-full bg-black">
          {time?.state === TIME_STATE.PENDING && <PendingTime time={time} />}
          {time?.state === TIME_STATE.PRESENTATION && <PresentationTime time={time} onEnded={() => dispatchTime({...time, state:TIME_STATE.RUNNING})} />}
          {time?.state === TIME_STATE.RUNNING && <RunningTime time={time}/>}
      </div>
    );
}

export default Time;