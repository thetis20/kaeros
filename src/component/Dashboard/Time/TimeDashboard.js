import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormTimeDashboard from './FormTimeDashboard';
import ControllerTimeDashboard from './ControllerTimeDashboard';

function Time() {

  const { t } = useTranslation();
  const [time, setTime] = useState()

  function handleTime(event) {
    setTime(event.detail)
  }

  useEffect(() => {
    document.addEventListener('time-onchange', handleTime);
    return () => {
      document.removeEventListener('time-onchange', handleTime);
    }
  }, []);

  function onSubmit(time) {
    window.electronAPI.timeOpen(time)
  }

  return (
    <div className="p-4">
      <h1>{t('time.name')}</h1>
      {!time === true && <FormTimeDashboard onSubmit={onSubmit} />}
      {time && <ControllerTimeDashboard time={time} />}
    </div>
  );
}

export default Time;
