import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiSunglassesFill, Film, Images } from 'react-bootstrap-icons';
import PlaylistDashboard from './PlaylistDashboard';
import FolderDashboard from './FolderDashboard';
import DubbingController from '../Controller/DubbingController';
import TimeController from '../Controller/TimeController';
import WorkflowDashboard from './WorkflowDashboard';
import useSession from '../Hook/useSession';
import Controller from '../Session/Controller';

function Dashboard() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('playlists');
  const [running, setRunning] = useState(null);

  function handleRunning(event) {
    setRunning(event.detail)
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
        <button
          style={{ borderRadius: 0 }}
          type="button"
          className={`btn btn-light ${status === 'playlists' ? 'active' : ''}`}
          onClick={() => setStatus('playlists')}
        >
          {t('nav.playlists')}
        </button>
        <button
          style={{ borderRadius: 0 }}
          type="button"
          className={`btn btn-light ${status === 'folders' ? 'active' : ''}`}
          onClick={() => setStatus('folders')}
        >
          {t('nav.folders')}
        </button>
        <button
          style={{ borderRadius: 0 }}
          type="button"
          className={`btn btn-light ${status === 'workflows' ? 'active' : ''}`}
          onClick={() => setStatus('workflows')}
        >
          {t('nav.workflows')}
        </button>
        <hr style={{ marginBottom: '2em' }} />
        <Controller />
        {running === 'dubbing' && <DubbingController />}
        {running === 'time' && <TimeController />}
      </div>
      <main style={{ maxHeight: '100%', overflowY: 'auto', flex: 1 }}>
        {status === 'playlists' && <PlaylistDashboard />}
        {status === 'folders' && <FolderDashboard />}
        {status === 'workflows' && <WorkflowDashboard />}
      </main>
    </div>
  );
}

export default Dashboard;