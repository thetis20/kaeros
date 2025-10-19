import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ControllerDubbingDashboard from './ControllerDubbingDashboard';

function DubbingDashboard() {
  const { t } = useTranslation();
  const [dubbing, setDubbing] = useState()

  function handleDubbing(event) {
    setDubbing(event.detail)
  }

  useEffect(() => {
    window.electronAPI.dubbingFetch()
    document.addEventListener('dubbing-onchange', handleDubbing);
    return () => {
      document.removeEventListener('dubbing-onchange', handleDubbing);
    }
  }, []);

  function onCreate() {
    window.electronAPI.dubbingOpen()
  }

  return (
    <div className="p-4">
      <h1>{t('dubbing.name')}</h1>
      {!dubbing && <button className="btn btn-danger" onClick={onCreate}>{t('dubbing.start')}</button>}
      {dubbing && <ControllerDubbingDashboard dubbing={dubbing} />}
    </div>
  );
}

export default DubbingDashboard;
