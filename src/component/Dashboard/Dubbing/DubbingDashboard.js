import { useState, useEffect, Fragment } from 'react';
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

  return (
    <Fragment>
      <h5>{t('dubbing.name')}</h5>
      {dubbing && <ControllerDubbingDashboard dubbing={dubbing} />}
    </Fragment >
  );
}

export default DubbingDashboard;
