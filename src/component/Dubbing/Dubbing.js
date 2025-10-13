import React, { useEffect, useState } from 'react';
import DUBBING_STATE from '../../enum/DUBBING_STATE'
import IntroductionDubbing from './IntroductionDubbing'
import PendingDubbing from './PendingDubbing'
import PresentationDubbing from './PresentationDubbing'
import RunningDubbing from './RunningDubbing';

function Dubbing() {
    const [dubbing, setDubbing]= useState()
    console.log('dubbing', dubbing)

    function dispatchDubbing(changes){
        electronAPI.dubbingOnChange({...dubbing, ...changes})
    }

    function handleDubbing(event){
        setDubbing(event.detail)
    }

    useEffect(() => {
        document.addEventListener('dubbing-onchange', handleDubbing);
        return () => {
            document.removeEventListener('dubbing-onchange', handleDubbing);
        }
    }, []);

    useEffect(() => {

        function handleKeyboard(event){
            switch(event.key){
                case ' ':
                    if(dubbing.state === DUBBING_STATE.PENDING){
                        dispatchDubbing({
                            state: DUBBING_STATE.PRESENTATION,
                            paused: true
                        })
                    }else if(dubbing.state === DUBBING_STATE.PRESENTATION){
                        dispatchDubbing({
                            state: DUBBING_STATE.INTRODUCTION,
                            paused: false
                        })
                    }else{
                        dispatchDubbing({
                            paused: !dubbing.paused
                        })
                    } 
                  break;
                case 'ArrowRight':
                    if(dubbing.state === DUBBING_STATE.RUNNING){
                        dispatchDubbing({
                            index: dubbing.index + 1 > dubbing.videos.length ? 0 : dubbing.index + 1
                        })
                    } 
                    break;
                case 'ArrowLeft':
                    if(dubbing.state === DUBBING_STATE.RUNNING){
                        dispatchDubbing({
                            index: dubbing.index - 1 > 0 ? dubbing.index - 1: dubbing.videos.length
                        })
                    }
                  break;
            }
            return 
        }

        document.addEventListener('keydown', handleKeyboard)
        return () => {
            document.removeEventListener('keydown', handleKeyboard)
        }
    }, [dubbing]);
  
    return (
      <div className="with-full height-full bg-black">
          {dubbing?.state === DUBBING_STATE.PENDING && <PendingDubbing />}
          {dubbing?.state === DUBBING_STATE.PRESENTATION && <PresentationDubbing dubbing={dubbing}/>}
          {dubbing?.state === DUBBING_STATE.INTRODUCTION && <IntroductionDubbing dubbing={dubbing} onEnded={() => dispatchDubbing({state:DUBBING_STATE.RUNNING})} />}
          {dubbing?.state === DUBBING_STATE.RUNNING && <RunningDubbing dubbing={dubbing} onEnded={() => dispatchDubbing({state:DUBBING_STATE.PRESENTATION, index: dubbing.index + 1})}/>}
      </div>
    );
}

export default Dubbing;