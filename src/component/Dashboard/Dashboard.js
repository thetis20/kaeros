import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TimeDashboard from './Time/TimeDashboard';
import DubbingDashboard from './Dubbing/DubbingDashboard';
import { Alarm, EmojiSunglassesFill, Film, Images } from 'react-bootstrap-icons';
import PlaylistDashboard from './Playlist/PlaylistDashboard';

function Dashboard() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('playlists');
  const [running, setRunning] = useState(null);

  function handleRunning(event) {
    setRunning(event.detail)
    setStatus(event.detail ?? status)
  }

  useEffect(() => {
    document.addEventListener('running-onchange', handleRunning);
    return () => {
      document.removeEventListener('running-onchange', handleRunning);
    }
  }, []);

  return (
    <div className="d-flex height-full" style={{ height: '100vh' }}>
      <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark height-full" style={{ width: '280px' }}>
        <header className="d-flex align-items-center gap-2">
          <EmojiSunglassesFill />
          <span className="fs-4">{t('app.name')}</span>
        </header>
        <hr style={{ marginBottom: '2em' }} />
        {running === 'dubbing' && <DubbingDashboard />}
        {running === 'time' && <TimeDashboard />}
      </div>
      <main style={{ maxHeight: '100%', overflowY: 'auto', flex: 1 }}>
        <PlaylistDashboard />
      </main>
    </div>
  );
}

export default Dashboard;