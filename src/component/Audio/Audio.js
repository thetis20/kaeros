import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

function Audio() {
    const { t } = useTranslation();
    const [value, setValue] = useState({
        id: uuidv4(),
        name: "",
        color: "#ffffff",
    })

    function handleChange(e) {
        setValue(e.detail)
    }

    useEffect(() => {
        document.addEventListener('audio-onchange', handleChange);
        return () => {
            document.removeEventListener('audio-onchange', handleChange);
        }
    }, []);

    function handleFile(e) {
        const file = e.target.files[0]
        setValue({
            ...value,
            file
        })
    }

    function getFilename() {
        if (value.file) {
            return value.file?.name
        }
        if (value.src) {
            const regex = /\/([^/]*\..*)/g;

            const array = [...value.src.matchAll(regex)];

            return array[0][1]
        }
        return t('audio.form.placeholder')
    }

    function onSubmit(e) {
        e.stopPropagation();
        e.preventDefault();
        window.electronAPI.audioSave(value)
    }

    return (
        <section style={{ margin: 10 }}>
            <h1>{t('audio.form.title', { context: value.createdAt ? 'edition' : 'creation' })}</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label htmlFor="name" className="form-label">{t('audio.form.name')}</label>
                    <input type="text" id="name" className="form-control" value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div className='form-group'>
                    <label htmlFor="color" className="form-label">{t('audio.form.color')}</label>
                    <input type="color" className="form-control form-control-color" id="color" value={value.color} onChange={(e) => setValue({ ...value, color: e.target.value })} />
                </div>
                <div className='form-group'>
                    <label htmlFor={'src'} className="form-label">{t('audio.form.src')}</label>
                    <div>
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            id={'src'}
                            onChange={handleFile}
                        />
                        <label className="btn btn-light" htmlFor={'src'}>{getFilename(value)}</label>
                    </div>
                </div>
                <button style={{ marginTop: 30 }} type="submit" className="btn btn-primary">{t('audio.form.submit')}</button>
            </form>
        </section>
    );
}

export default Audio;