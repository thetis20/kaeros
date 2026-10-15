import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IconBroadcast, IconList, IconMusic, IconDeviceTv} from '@tabler/icons-react';

function Sidebar({screen, onNavigate, sessionRunning, musicPlaying}) {
    const {t} = useTranslation();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);

    async function handleUninstall() {
        setBusy(true);
        setMessage(null);
        try {
            const result = await window.electronAPI.appUninstall();
            if (result?.canceled) {
                return;
            }
            if (!result?.ok) {
                setMessage({type: 'error', text: `${t('uninstall.error')}${result?.error ? ` : ${result.error}` : ''}`});
            } else if (result.mode === 'data-only') {
                setMessage({type: 'info', text: t('uninstall.dataOnly')});
            }
        } catch (error) {
            setMessage({type: 'error', text: `${t('uninstall.error')} : ${error?.message ?? error}`});
        } finally {
            setBusy(false);
        }
    }

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
            <div className="sidebar-footer">
                <button type="button" className="nav-item nav-item-discreet" disabled={busy} onClick={handleUninstall}>
                    {t('uninstall.button')}
                </button>
                {message && (
                    <p className={`sidebar-message ${message.type === 'error' ? 'sidebar-message-error' : ''}`} role={message.type === 'error' ? 'alert' : 'status'}>
                        {message.text}
                    </p>
                )}
            </div>
        </nav>
    );
}

export default Sidebar;
