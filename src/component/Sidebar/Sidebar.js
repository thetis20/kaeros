import 'react';
import {useTranslation} from 'react-i18next';
import {IconBroadcast, IconList, IconMusic, IconDeviceTv} from '@tabler/icons-react';

function Sidebar({screen, onNavigate, sessionRunning, musicPlaying}) {
    const {t} = useTranslation();

    return (
        <nav className="sidebar">
            <div className="brand">Kaeros</div>
            <button
                type="button"
                className={`nav-item ${screen === 'regie' ? 'active' : ''}`}
                onClick={() => onNavigate('regie')}
            >
                <IconBroadcast/>
                <span style={{flex: 1, textAlign: 'left'}}>{t('nav.regie')}</span>
                {sessionRunning && <span className="nav-tag" title={t('nav.tag.session')}><IconDeviceTv size={14}/></span>}
                {musicPlaying && <span className="nav-tag" title={t('nav.tag.music')}><IconMusic size={14}/></span>}
            </button>
            <div className="nav-category">{t('nav.library')}</div>
            <button
                type="button"
                className={`nav-item nav-subitem ${screen === 'musique' ? 'active' : ''}`}
                onClick={() => onNavigate('musique')}
            >
                <IconMusic/>
                <span>{t('nav.musique')}</span>
            </button>
            <button
                type="button"
                className={`nav-item nav-subitem ${(screen === 'sessions' || screen === 'creation') ? 'active' : ''}`}
                onClick={() => onNavigate('sessions')}
            >
                <IconList/>
                <span>{t('nav.sessions')}</span>
            </button>
        </nav>
    );
}

export default Sidebar;
