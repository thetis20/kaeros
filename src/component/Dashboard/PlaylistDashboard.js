import { useState, useEffect } from 'react';
import { Pen, Play, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

function Item({ playlist }) {
  const { t } = useTranslation();

  function remove() {
    window.electronAPI.playlistRemove(playlist.id)
  }

  function play() {
    window.electronAPI.playlistPlay(playlist)
  }

  function edit() {
    window.electronAPI.playlistOpen(playlist)
  }

  let src = ""
  if (playlist.type === 'time') {
    src = playlist.image === 'time' ? 'image/pending-time.png' : 'image/pending-time-spinoff.png'
  } else if (playlist.type === 'dubbing') {
    src = 'image/pending-dubbing.png'
  }

  return <li style={{ margin: 10, padding: 10, display: 'flex' }}>
    <div style={{ display: 'flex', width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
      <img
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        src={src} />
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      marginLeft: 10,
      flex: 1
    }}>
      <div style={{ display: 'flex' }}>
        <h3>{playlist.name}</h3>
      </div>
      <div style={{ display: 'flex' }}>
        <div>{t(`playlist.${playlist.type}.description`, playlist)}</div>
      </div>
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      marginLeft: 10,
      gap: 10
    }}>
      <div style={{ display: 'flex' }}>
        <button className='btn btn-success' onClick={play}><Play /></button>
      </div>
      <div style={{ display: 'flex' }}>
        <button className='btn btn-secondary' onClick={edit}><Pen /></button>
      </div>
      <div style={{ display: 'flex' }}>
        <button className='btn btn-danger' onClick={remove}><Trash /></button>
      </div>
    </div>
  </li>
}

function PlaylistDashboard() {
  const { t } = useTranslation();
  const [playlists, setPlaylists] = useState([])

  function handlePlaylist(event) {
    setPlaylists(event.detail)
  }

  useEffect(() => {
    window.electronAPI.playlistFetch()
    document.addEventListener('playlist-onchange', handlePlaylist);
    return () => {
      document.removeEventListener('playlist-onchange', handlePlaylist);
    }
  }, []);

  function create() {
    window.electronAPI.playlistOpen()
  }

  return (
    <div style={{ padding: '1em' }}>
      <h1>{t('playlist.name')}</h1>
      <button className="btn btn-primary" onClick={create}>{t('playlist.create')}</button>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        gap: 30,
        display: 'flex',
        flexDirection: 'column',
        marginTop: 30
      }}>
        {playlists.map((playlist) => <Item key={playlist.id} playlist={playlist} />)}
      </ul>
    </div >
  );
}

export default PlaylistDashboard;
