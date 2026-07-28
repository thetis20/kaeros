import 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import useSession from '../Hook/useSession';

const TYPES = ['image', 'dubbing-video', 'time', 'battle-royal'];
const PREVIEW_BOX_STYLE = {border: '1px dashed #ccc', padding: '2em', textAlign: 'center', marginBottom: '1em'};

function RegieLiveController() {
    const {t} = useTranslation();
    const session = useSession();
    const [activeType, setActiveType] = useState(session ? session.track.type : null);

    if (!session) {
        return null;
    }

    function renderPanel() {
        if (activeType === 'image') {
            return <div style={PREVIEW_BOX_STYLE}>{t('regie.controller.imagePreview')}</div>;
        }
        if (activeType === 'dubbing-video') {
            return (
                <>
                    <div style={PREVIEW_BOX_STYLE}>{t('regie.controller.dubbingPreview')}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '.5em'}}>
                        <span>00:00</span>
                        <input type="range" min="0" max="100" defaultValue="0" disabled/>
                        <span>00:00</span>
                    </div>
                </>
            );
        }
        return null;
    }

    return (
        <div>
            <div className="tabs" id="regie-tabs" style={{display: 'flex', gap: '.5em', marginBottom: '1em'}}>
                {TYPES.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`btn btn-sm ${activeType === type ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveType(type)}
                    >{t(`regie.tabs.${type}`)}</button>
                ))}
            </div>
            <div id="regie-controller">
                {renderPanel()}
            </div>
        </div>
    );
}

export default RegieLiveController;
