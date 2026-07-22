import 'react';
import {useTranslation} from 'react-i18next';
import {Broadcast, List, MusicNoteBeamed, Tv} from 'react-bootstrap-icons';

function Sidebar({screen, onNavigate, sessionRunning, musicPlaying}) {
    const {t} = useTranslation();

    return (
        <nav className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark height-full" style={{width: '280px'}}>
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'regie' ? 'active' : ''}`}
                onClick={() => onNavigate('regie')}
            >
                <Broadcast/>
                <span style={{flex: 1, textAlign: 'left'}}>{t('nav.regie')}</span>
                {sessionRunning && <span title={t('nav.tag.session')}><Tv/></span>}
                {musicPlaying && <span title={t('nav.tag.music')}><MusicNoteBeamed/></span>}
            </button>
            <div style={{margin: '1em 0 .5em', paddingLeft: '.5em', fontSize: '.75em', textTransform: 'uppercase', opacity: 0.7}}>
                {t('nav.library')}
            </div>
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'musique' ? 'active' : ''}`}
                onClick={() => onNavigate('musique')}
            >
                <MusicNoteBeamed/>
                <span>{t('nav.musique')}</span>
            </button>
            <button
                type="button"
                style={{borderRadius: 0, display: 'flex', alignItems: 'center', gap: '.5em'}}
                className={`btn btn-light ${screen === 'sessions' ? 'active' : ''}`}
                onClick={() => onNavigate('sessions')}
            >
                <List/>
                <span>{t('nav.sessions')}</span>
            </button>
        </nav>
    );
}

export default Sidebar;
