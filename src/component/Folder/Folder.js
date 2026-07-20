import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import InputColor from "../Common/InputColor";

function Folder() {
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
        document.addEventListener('folder-onchange', handleChange);
        return () => {
            document.removeEventListener('folder-onchange', handleChange);
        }
    }, []);

    function validate(value) {
        const errors = {};
        if (!value.name || !value.name.trim()) errors.name = t('folder.form.error.name');
        if (!value.color || value.color.toLowerCase() === '#ffffff') errors.color = t('folder.form.error.color');
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
        window.electronAPI.folderSave(value)
    }

    return (
        <section style={{ margin: 10 }}>
            <h1>{t('folder.form.title', { context: value.createdAt ? 'edition' : 'creation' })}</h1>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="name" className="form-label">{t('folder.form.name')}</label>
                    <input type="text" id="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={value.name} onChange={(e) => {
                        setValue({ ...value, name: e.target.value })
                        if (errors.name) setErrors({...errors, name: undefined})
                    }} />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="color" className="form-label">{t('folder.form.color')}</label>
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
                <button type="submit" className="btn btn-primary">{t('folder.form.submit')}</button>
            </form>
        </section>
    );
}

export default Folder;