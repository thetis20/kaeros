import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TimeDashboard from './Time/TimeDashboard';
import DubbingDashboard from './Dubbing/DubbingDashboard';
import { Alarm, EmojiSunglasses, EmojiSunglassesFill, Film, Square } from 'react-bootstrap-icons';

function Dashboard() {
  const { t } = useTranslation();
  const [status, setStatus] = useState();

  return (
    <div className="d-flex height-full">
      <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark height-full" style={{width: '280px'}}>
          <header className="d-flex align-items-center gap-2">
            <EmojiSunglassesFill/>
            <span className="fs-4">{t('app.name')}</span>
          </header>
        <hr/>
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item d-flex align-items-center gap-2 cursor-pointer" onClick={() => setStatus('dubbing')}>
            <Film/>
            {t('nav.dubbing')}
          </li>
          <li className="nav-item d-flex align-items-center gap-2 cursor-pointer" onClick={() => setStatus('time')}>
            <Alarm/>
            {t('nav.time')}
          </li>
        </ul>
      </div>
      <main className="">
        {status === 'dubbing' && <DubbingDashboard/>}
        {status === 'time' && <TimeDashboard/>}
      </main>
    </div>
  );
}

export default Dashboard;