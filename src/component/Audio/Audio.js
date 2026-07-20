import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import InputColor from "../Common/InputColor";
import { getFilename, hasSource } from '../../lib/filename';

function Audio() {
    const { t } = useTranslation();
    const [value, setValue] = useState({
        id: uuidv4(),
        name: "",
        color: "#ffffff",
    })
    const [errors, setErrors] = useState({})

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
        if (errors.src) setErrors({...errors, src: undefined})
    }

    function validate(value) {
        const errors = {};
        if (!value.name || !value.name.trim()) errors.name = t('audio.form.error.name');
        if (!value.color || value.color.toLowerCase() === '#ffffff') errors.color = t('audio.form.error.color');
        if (!hasSource(value)) errors.src = t('audio.form.error.src');
        return errors;
    }

    function onSubmit(e) {
        e.stopPropagation();
        e.preventDefault();
        const validationErrors = validate(value);
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        window.electronAPI.audioSave(value)
    }

    return (
        <section style={{ margin: 10 }}>
            <h1>{t('audio.form.title', { context: value.createdAt ? 'edition' : 'creation' })}</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label htmlFor="name" className="form-label">{t('audio.form.name')}</label>
                    <input type="text" id="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={value.name} onChange={(e) => {
                        setValue({ ...value, name: e.target.value })
                        if (errors.name) setErrors({...errors, name: undefined})
                    }} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className='form-group'>
                    <label htmlFor="color" className="form-label">{t('audio.form.color')}</label>
                    <InputColor
                        id="color"
                        value={value.color}
                        isInvalid={!!errors.color}
                        onChange={(color) => {
                            setValue({...value, color})
                            if (errors.color) setErrors({...errors, color: undefined})
                        }}
                    />
                    {errors.color && <div className="invalid-feedback">{errors.color}</div>}
                </div>
                <div className='form-group'>
                    <label htmlFor={'src'} className="form-label">{t('audio.form.src')}</label>
                    <div>
                        <input
                            type="file"
                            className={errors.src ? 'is-invalid' : undefined}
                            style={{ display: 'none' }}
                            id={'src'}
                            onChange={handleFile}
                        />
                        <label className="btn btn-light" htmlFor={'src'}>{getFilename(value, t('audio.form.placeholder'))}</label>
                        {errors.src && <div className="invalid-feedback">{errors.src}</div>}
                    </div>
                </div>
                <button style={{ marginTop: 30 }} type="submit" className="btn btn-primary">{t('audio.form.submit')}</button>
            </form>
        </section>
    );
}

export default Audio;