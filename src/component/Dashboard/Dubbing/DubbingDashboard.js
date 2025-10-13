import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ControllerDubbingDashboard from './ControllerDubbingDashboard';

function DubbingDashboard() {
  const { t } = useTranslation();
  const [dubbing, setDubbing]= useState()
  console.log('dubbing', dubbing)


  function handleDubbing(event){
      setDubbing(event.detail)
  }
  
  useEffect(() => {
        document.addEventListener('dubbing-onchange', handleDubbing);
        return () => {
            document.removeEventListener('dubbing-onchange', handleDubbing);
        }
  }, []);

  function onSubmit(){
    window.electronAPI.dubbingOpen()
  }

  return (
    <div className="p-4">
        <h1>{t('dubbing.name')}</h1>
        {!dubbing === true && <button onClick={onSubmit}>Start</button>}
        {dubbing && <ControllerDubbingDashboard dubbing={dubbing}/>}
    </div>
  );
}

export default DubbingDashboard;
