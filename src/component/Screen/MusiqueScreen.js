import 'react';
import {useTranslation} from 'react-i18next';

function MusiqueScreen() {
    const {t} = useTranslation();

    return (
        <div style={{padding: '1em'}}>
            <h1>{t('musique.title')}</h1>
            <p>{t('musique.placeholder')}</p>
        </div>
    );
}

export default MusiqueScreen;
