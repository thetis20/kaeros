import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

function TimeFormPlaylist({ value, setValue }) {
    const { t } = useTranslation();

    function onChange(v, k) {
        setValue({
            ...value,
            [k]: v
        })
    }

    return (
        <Fragment>
            <div className="mb-3">
                <label className="form-label">{t('time.form.image.label')}</label>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        value="time"
                        id="image-time"
                        onChange={e => onChange(e.currentTarget.value, 'image')}
                        checked={value.image === 'time'}
                    />
                    <label className="form-check-label" for="image-time">
                        {t('time.form.image.option.time')}
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        value="spinoff"
                        id="image-spinoff"
                        onChange={e => onChange(e.currentTarget.value, 'image')}
                        checked={value.image === 'spinoff'}
                    />
                    <label className="form-check-label" for="image-spinoff">
                        {t('time.form.image.option.spinoff')}
                    </label>
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="time-minutes" className="form-label">{t('time.form.minutes')}</label>
                <input
                    className="form-control"
                    id="time-minutes"
                    type="number"
                    value={value.minutes}
                    onChange={e => onChange(e.target.value, 'minutes')}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="time-number" className="form-label">{t('time.form.number')}</label>
                <input
                    className="form-control"
                    id="time-number"
                    type="number"
                    value={value.number}
                    onChange={e => onChange(e.target.value, 'number')}
                />
            </div>
            <input className="btn btn-primary" style={{ marginBottom: 30 }} type="submit" value={t('playlist.form.submit')} />
        </Fragment>
    );
}

export default TimeFormPlaylist;
