import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ControllerTimeDashboard from './ControllerTimeDashboard';

function Time() {

  const { t } = useTranslation();
  const [time, setTime] = useState()

  function handleTime(event) {
    setTime(event.detail)
  }

  useEffect(() => {
    window.electronAPI.timeFetch()
    document.addEventListener('time-onchange', handleTime);
    return () => {
      document.removeEventListener('time-onchange', handleTime);
    }
  }, []);

  return (
    <div style={{ margin: '2em 0' }}>
      <h5>{t('time.name')}</h5>
      {time && <ControllerTimeDashboard time={time} />}
    </div>
  );
}

export default Time;
